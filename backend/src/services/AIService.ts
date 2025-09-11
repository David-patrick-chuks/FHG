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
   * Generate AI-powered email outreach messages with structured output
   */
  public static async generateEmailMessages(prompt: string, count: number = 20): Promise<ApiResponse<string[]>> {
    const schema = {
      type: Type.OBJECT,
      properties: {
        messages: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              content: {
                type: Type.STRING,
                description: "The email message content"
              },
              subject: {
                type: Type.STRING,
                description: "A suggested subject line for the email"
              },
              tone: {
                type: Type.STRING,
                enum: ["professional", "friendly", "formal", "casual"],
                description: "The tone of the message"
              }
            },
            required: ["content", "subject", "tone"]
          }
        }
      },
      required: ["messages"]
    };

    const systemInstruction = `
You are an expert email outreach specialist. Generate ${count} unique, professional email outreach messages.

Requirements:
- Each message should be different and unique
- Keep messages professional and engaging
- Length: 100-200 words per message
- Include a clear call-to-action
- Avoid spam-like language
- Make each message feel personal and authentic
- Provide a relevant subject line for each message
- Vary the tone between professional, friendly, formal, and casual

Return a JSON object with an array of messages, each containing content, subject, and tone.
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
            thinkingBudget: 0 // Disable thinking for faster response
          }
        }
      });

      const text = response.text;
      
      if (!text) {
        throw new Error('No text generated from AI model');
      }

      try {
        const parsed = JSON.parse(text);
        if (!parsed.messages || !Array.isArray(parsed.messages)) {
          throw new Error('Invalid response structure from AI model');
        }

        // Extract just the message content for backward compatibility
        const messages = parsed.messages
          .map((msg: any) => msg.content)
          .filter((content: string) => content && content.length > 50)
          .slice(0, count);

        if (messages.length === 0) {
          throw new Error('Failed to generate valid AI messages');
        }

        AIService.logger.info('AI email messages generated successfully', { 
          count: messages.length, 
          promptLength: prompt.length 
        });

        return messages;
      } catch (parseError) {
        throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }, 'AI email message generation');
  }

  /**
   * Generate content for any purpose with custom prompt and schema
   */
  public static async generateContent(
    prompt: string, 
    schema?: any, 
    systemInstruction?: string,
    model: string = "gemini-2.5-flash"
  ): Promise<ApiResponse<string>> {
    return this.executeAIRequest(async (client) => {
      const config: any = {
        temperature: 0.3,
        maxOutputTokens: 1000,
        thinkingConfig: {
          thinkingBudget: 0
        }
      };

      // Add schema if provided
      if (schema) {
        config.responseMimeType = "application/json";
        config.responseSchema = schema;
      }

      const response = await client.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        config
      });

      const text = response.text;
      
      if (!text) {
        throw new Error('No content generated from AI model');
      }

      AIService.logger.info('AI content generated successfully', { 
        model,
        promptLength: prompt.length,
        hasSchema: !!schema
      });

      return text;
    }, 'AI content generation');
  }

  /**
   * Generate structured JSON response with custom schema
   */
  public static async generateStructuredResponse<T>(
    prompt: string,
    schema: any,
    systemInstruction?: string,
    model: string = "gemini-2.5-flash"
  ): Promise<ApiResponse<T>> {
    return this.executeAIRequest(async (client) => {
      const response = await client.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1,
          maxOutputTokens: 1000,
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
        AIService.logger.info('AI structured response generated successfully', { 
          model,
          promptLength: prompt.length
        });
        return parsed;
      } catch (parseError) {
        throw new Error(`Failed to parse structured response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }, 'AI structured response generation');
  }

  /**
   * Generate email variations based on a template sample
   */
  public static async generateEmailVariations(
    templateSample: {
      title: string;
      content: string;
      useCase: string;
      variables: Array<{
        name: string;
        description: string;
        required: boolean;
        defaultValue?: string;
      }>;
    },
    recipientContext?: {
      email?: string;
      name?: string;
      company?: string;
      industry?: string;
    },
    variationCount: number = 20
  ): Promise<ApiResponse<Array<{ subject: string; content: string; variation: number }>>> {
    return this.executeAIRequest(async (client) => {
      const prompt = `
You are an expert email marketer. Generate ${variationCount} unique variations of the following email template sample.

TEMPLATE SAMPLE:
Title: ${templateSample.title}
Content: ${templateSample.content}
Use Case: ${templateSample.useCase}

VARIABLES AVAILABLE:
${templateSample.variables.map(v => `- ${v.name}: ${v.description} (${v.required ? 'required' : 'optional'})`).join('\n')}

RECIPIENT CONTEXT:
${recipientContext ? `
- Email: ${recipientContext.email || 'Not provided'}
- Name: ${recipientContext.name || 'Not provided'}
- Company: ${recipientContext.company || 'Not provided'}
- Industry: ${recipientContext.industry || 'Not provided'}
` : 'No recipient context provided'}

REQUIREMENTS:
1. Generate exactly ${variationCount} unique variations
2. Each variation should maintain the core message and intent of the original template
3. Vary the tone, structure, and wording while keeping the same purpose
4. Use the available variables appropriately in each variation
5. Make each variation feel natural and professional
6. Ensure subject lines are compelling and varied
7. Keep content length similar to the original template

Return the response as a JSON array with this exact structure:
[
  {
    "subject": "Variation 1 subject line",
    "content": "Variation 1 email content with proper formatting",
    "variation": 1
  },
  {
    "subject": "Variation 2 subject line", 
    "content": "Variation 2 email content with proper formatting",
    "variation": 2
  }
  // ... continue for all ${variationCount} variations
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting.
`;

      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
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
        if (!Array.isArray(parsed) || parsed.length !== variationCount) {
          throw new Error(`Expected array of ${variationCount} variations, got ${Array.isArray(parsed) ? parsed.length : 'non-array'}`);
        }

        // Validate each variation has required fields
        for (let i = 0; i < parsed.length; i++) {
          const variation = parsed[i];
          if (!variation.subject || !variation.content || variation.variation !== i + 1) {
            throw new Error(`Invalid variation structure at index ${i}`);
          }
        }

        AIService.logger.info(`Generated ${variationCount} email variations successfully`, {
          templateTitle: templateSample.title,
          variationCount: parsed.length
        });

        return parsed;
      } catch (parseError) {
        throw new Error(`Failed to parse email variations response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }, 'Email variations generation');
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
