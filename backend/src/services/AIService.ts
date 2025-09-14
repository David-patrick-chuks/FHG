import { GoogleGenAI, Type } from '@google/genai';
import { ApiResponse } from '../types';
import { Logger } from '../utils/Logger';
import dotenv from 'dotenv';
dotenv.config();

export class AIService {
  private static logger: Logger = new Logger();
  private static apiKeys: string[] = [];
  private static currentKeyIndex: number = 0;
  private static keyUsageCounts: Map<string, number> = new Map();
  private static readonly MAX_REQUESTS_PER_KEY = 1500;
  private static readonly MAX_RETRIES = 3;

  static {
    this.initializeApiKeys();
  }

  /**
   * Initialize API keys from environment variable
   */
  private static initializeApiKeys(): void {
    const apiKeyString = process.env['GEMINI_API_KEY'];
    if (!apiKeyString) {
      AIService.logger.error('No GEMINI_API_KEY found in environment variables');
      return;
    }

    this.apiKeys = apiKeyString.split(',').map(key => key.trim()).filter(key => key.length > 0);
    
    if (this.apiKeys.length === 0) {
      AIService.logger.error('No valid API keys found in GEMINI_API_KEY');
      return;
    }

    // Initialize usage counters for each key
    this.apiKeys.forEach(key => {
      this.keyUsageCounts.set(key, 0);
    });

    AIService.logger.info(`Initialized ${this.apiKeys.length} API keys for load balancing`);
  }

  /**
   * Get the next available API key with load balancing
   */
  private static getNextAvailableKey(): string | null {
    if (this.apiKeys.length === 0) {
      return null;
    }

    // Try to find a key that hasn't reached its limit
    for (let i = 0; i < this.apiKeys.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
      const key = this.apiKeys[keyIndex];
      const usageCount = this.keyUsageCounts.get(key) || 0;
      
      if (usageCount < this.MAX_REQUESTS_PER_KEY) {
        this.currentKeyIndex = keyIndex;
        return key;
      }
    }

    // If all keys are at limit, return the first one (will likely get 429)
    AIService.logger.warn('All API keys have reached daily limit, using first key');
    return this.apiKeys[0];
  }

  /**
   * Create AI client with specific API key
   */
  private static createAIClient(apiKey: string): GoogleGenAI {
    return new GoogleGenAI({
      apiKey: apiKey
    });
  }

  /**
   * Increment usage count for an API key
   */
  private static incrementKeyUsage(apiKey: string): void {
    const currentCount = this.keyUsageCounts.get(apiKey) || 0;
    this.keyUsageCounts.set(apiKey, currentCount + 1);
  }

  /**
   * Get current API key usage statistics
   */
  public static getKeyUsageStats(): { key: string; usage: number; remaining: number }[] {
    return this.apiKeys.map(key => ({
      key: key.substring(0, 8) + '...', // Mask the key for security
      usage: this.keyUsageCounts.get(key) || 0,
      remaining: this.MAX_REQUESTS_PER_KEY - (this.keyUsageCounts.get(key) || 0)
    }));
  }

  /**
   * Execute AI request with retry logic and key rotation
   */
  private static async executeAIRequest<T>(
    requestFn: (client: GoogleGenAI) => Promise<T>,
    operation: string
  ): Promise<ApiResponse<T>> {
    let lastError: any = null;
    let retryCount = 0;

    while (retryCount < this.MAX_RETRIES) {
      const apiKey = this.getNextAvailableKey();
      if (!apiKey) {
        return {
          success: false,
          message: 'No available API keys',
          timestamp: new Date()
        };
      }

      try {
        const client = this.createAIClient(apiKey);
        const result = await requestFn(client);
        
        // Increment usage only on success
        this.incrementKeyUsage(apiKey);
        
        return {
          success: true,
          message: `${operation} completed successfully`,
          data: result,
          timestamp: new Date()
        };

      } catch (error: any) {
        lastError = error;
        
        // Check if it's a retryable error (429 rate limit or 503 service unavailable)
        const isRetryableError = error.status === 429 || 
                                error.status === 503 || 
                                error.message?.includes('429') || 
                                error.message?.includes('503') ||
                                error.message?.includes('RESOURCE_EXHAUSTED') ||
                                error.message?.includes('UNAVAILABLE');
        
        if (isRetryableError) {
          const errorType = error.status === 429 ? 'Rate limit (429)' : 'Service unavailable (503)';
          AIService.logger.warn(`${errorType} hit for API key ${apiKey.substring(0, 8)}...`, {
            retryCount: retryCount + 1,
            operation,
            status: error.status,
            message: error.message
          });
          
          // For 429 errors, mark this key as exhausted for now
          if (error.status === 429) {
            this.keyUsageCounts.set(apiKey, this.MAX_REQUESTS_PER_KEY);
          }
          
          // For 503 errors, add a small delay before retry (service might be temporarily overloaded)
          if (error.status === 503) {
            await this.delay(1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s
          }
          
          retryCount++;
          continue;
        }

        // For other errors, don't retry
        break;
      }
    }

    AIService.logger.error(`Failed to execute ${operation} after ${retryCount} retries:`, lastError);
    return {
      success: false,
      message: `Failed to execute ${operation}`,
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      timestamp: new Date()
    };
  }


  /**
   * Generate email variations from template samples
   */
  public static async generateVariationsFromTemplate(
    template: {
      name: string;
      description: string;
      useCase: string;
      variables: Array<{
        key: string;
        value: string;
        required: boolean;
      }>;
      samples: Array<{
        subject: string;
        body: string;
      }>;
    },
    recipientContext?: {
      email?: string;
      name?: string;
      company?: string;
      industry?: string;
    },
    variationCount: number = 20
  ): Promise<ApiResponse<Array<{ subject: string; body: string; variation: number }>>> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        variations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subject: {
                type: Type.STRING,
                description: "The email subject line"
              },
              body: {
                type: Type.STRING,
                description: "The email message content"
              },
              variation: {
                type: Type.NUMBER,
                description: "The variation number (1-based index)"
              }
            },
            required: ["subject", "body", "variation"]
          }
        }
      },
      required: ["variations"]
    };

    const prompt = `
You are an expert email marketer. Generate ${variationCount} unique variations based on the following email template and its samples.

TEMPLATE INFORMATION:
Name: ${template.name}
Description: ${template.description}
Use Case: ${template.useCase}

VARIABLES AVAILABLE:
${template.variables.map(v => `- {{${v.key}}}: ${v.value} (${v.required ? 'required' : 'optional'})`).join('\n')}

TEMPLATE SAMPLES (learn from these patterns):
${template.samples.map((sample, index) => `
Sample ${index + 1}:
Subject: ${sample.subject}
Body: ${sample.body}
`).join('\n')}

RECIPIENT CONTEXT:
${recipientContext ? `
- Email: ${recipientContext.email || 'Not provided'}
- Name: ${recipientContext.name || 'Not provided'}
- Company: ${recipientContext.company || 'Not provided'}
- Industry: ${recipientContext.industry || 'Not provided'}
` : 'No recipient context provided'}

REQUIREMENTS:
1. Generate exactly ${variationCount} unique variations
2. Each variation should follow the patterns and style of the template samples
3. Use the available variables ({{variable_name}}) appropriately in each variation
4. Vary the tone, structure, and wording while maintaining the core message
5. Make each variation feel natural and professional
6. Ensure subject lines are compelling and varied
7. Keep content length similar to the template samples
8. Maintain the same purpose and intent as the original template

Return a JSON object with a "variations" array containing the email variations.
`;

    return this.executeAIRequest(async (client) => {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7,
          maxOutputTokens: 4000,
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      const text = response.text;
      
      if (!text) {
        throw new Error('No content generated from AI model');
      }

      try {
        const parsed = JSON.parse(text);
        
        // Validate the response structure
        if (!parsed.variations || !Array.isArray(parsed.variations) || parsed.variations.length !== variationCount) {
          throw new Error(`Expected variations array with ${variationCount} items, got ${Array.isArray(parsed.variations) ? parsed.variations.length : 'non-array'}`);
        }

        // Validate each variation has required fields
        for (let i = 0; i < parsed.variations.length; i++) {
          const variation = parsed.variations[i];
          if (!variation.subject || !variation.body || variation.variation !== i + 1) {
            throw new Error(`Invalid variation structure at index ${i}`);
          }
        }

        AIService.logger.info(`Generated ${variationCount} email variations from template successfully`, {
          templateName: template.name,
          sampleCount: template.samples.length,
          variationCount: parsed.variations.length
        });

        return parsed.variations;
      } catch (parseError) {
        throw new Error(`Failed to parse email variations response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }, 'Email variations generation from template');
  }

  /**
   * Test AI service connectivity
   */
  public static async testConnection(): Promise<ApiResponse<{ connected: boolean; model: string; availableKeys: number }>> {
    return this.executeAIRequest(async (client) => {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Hello, this is a test message.",
        config: {
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      });

      if (!response.text) {
        throw new Error('No response from AI model');
      }

      AIService.logger.info('AI service connection test successful');
      
      return {
        connected: true,
        model: "gemini-2.5-flash",
        availableKeys: this.apiKeys.filter(key => 
          (this.keyUsageCounts.get(key) || 0) < this.MAX_REQUESTS_PER_KEY
        ).length
      };
    }, 'AI service connection test');
  }

  /**
   * Reset usage counters (useful for testing or daily reset)
   */
  public static resetUsageCounters(): void {
    this.apiKeys.forEach(key => {
      this.keyUsageCounts.set(key, 0);
    });
    AIService.logger.info('API key usage counters reset');
  }

  /**
   * Utility method to add delay between operations
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
