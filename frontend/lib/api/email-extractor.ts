import { apiClient } from '../api-client';

export interface EmailExtractionJob {
  id: string;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  urls: string[];
  results: ExtractionResult[];
  totalEmails: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  startedAt?: string;
  duration?: number; // Duration in milliseconds
}

export interface ExtractionStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  message?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  details?: any;
}

export interface ExtractionResult {
  url: string;
  emails: string[];
  status: 'success' | 'failed' | 'processing';
  error?: string;
  extractedAt: string;
  startedAt?: string;
  duration?: number; // Duration in milliseconds
  progress?: ExtractionStep[]; // Detailed progress tracking
  currentStep?: string; // Current step being processed
}

export interface StartExtractionRequest {
  urls: string[];
  extractionType?: 'single' | 'multiple' | 'csv';
}

export interface StartExtractionResponse {
  success: boolean;
  data?: {
    jobId: string;
  };
  message?: string;
  timestamp?: string;
}

export interface GetExtractionsResponse {
  success: boolean;
  data?: EmailExtractionJob[];
  message?: string;
  timestamp?: string;
}

export interface GetExtractionResponse {
  success: boolean;
  data?: EmailExtractionJob | null;
  message?: string;
  timestamp?: string;
}

export interface ParseCsvResponse {
  success: boolean;
  data: {
    totalUrls: number;
    validUrls: number;
    urls: string[];
    limits?: any;
    usage?: any;
  };
  message: string;
  timestamp: string;
  requiresUpgrade?: boolean;
}

export interface SubscriptionInfoResponse {
  success: boolean;
  data?: {
    limits: {
      dailyExtractionLimit: number;
      canUseCsvUpload: boolean;
      planName: string;
      isUnlimited: boolean;
    };
    usage: {
      used: number;
      remaining: number;
      resetTime: string;
      limit: number;
    };
    canUseCsv: boolean;
    needsUpgrade: boolean;
    upgradeRecommendation?: {
      needsUpgrade: boolean;
      reason: string;
      recommendedPlan: string;
      currentPlan: string;
    };
  };
  message?: string;
  timestamp?: string;
}

export class EmailExtractorAPI {
  /**
   * Start email extraction from URLs
   */
  static async startExtraction(urls: string[], extractionType: 'single' | 'multiple' | 'csv' = 'multiple'): Promise<StartExtractionResponse> {
    const response = await apiClient.post<{ jobId: string }>('/email-extractor/start', { 
      urls, 
      extractionType 
    });
    if (!response.data) {
      throw new Error(response.message || 'Failed to start extraction');
    }
    return response;
  }

  /**
   * Get user's extraction history
   */
  static async getExtractions(limit: number = 20, skip: number = 0): Promise<GetExtractionsResponse> {
    const response = await apiClient.get<EmailExtractionJob[]>(`/email-extractor/extractions?limit=${limit}&skip=${skip}`);
    if (!response.data) {
      throw new Error(response.message || 'Failed to get extractions');
    }
    return response;
  }

  /**
   * Get specific extraction by job ID
   */
  static async getExtraction(jobId: string): Promise<GetExtractionResponse> {
    const response = await apiClient.get<EmailExtractionJob | null>(`/email-extractor/extraction/${jobId}`);
    if (!response.data) {
      throw new Error(response.message || 'Failed to get extraction');
    }
    return response;
  }

  /**
   * Get detailed extraction information by job ID (alias for getExtraction)
   */
  static async getExtractionDetails(jobId: string): Promise<GetExtractionResponse> {
    return this.getExtraction(jobId);
  }

  /**
   * Download extraction results as CSV
   */
  static async downloadResults(jobId: string): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/email-extractor/download/${jobId}`, {
      credentials: 'include', // Include cookies automatically
    });
    
    if (!response.ok) {
      throw new Error('Failed to download results');
    }
    
    return response.blob();
  }

  /**
   * Parse CSV file and extract URLs
   */
  static async parseCsvFile(file: File): Promise<ParseCsvResponse> {
    const formData = new FormData();
    formData.append('csvFile', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/email-extractor/parse-csv`, {
      method: 'POST',
      credentials: 'include', // Include cookies automatically
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to parse CSV file');
    }

    return response.json();
  }

  /**
   * Get subscription limits and usage info
   */
  static async getSubscriptionInfo(): Promise<SubscriptionInfoResponse> {
    const response = await apiClient.get<{
      limits: {
        dailyExtractionLimit: number;
        canUseCsvUpload: boolean;
        planName: string;
        isUnlimited: boolean;
      };
      usage: {
        used: number;
        remaining: number;
        resetTime: string;
        limit: number;
      };
      canUseCsv: boolean;
      needsUpgrade: boolean;
      upgradeRecommendation?: {
        needsUpgrade: boolean;
        reason: string;
        recommendedPlan: string;
        currentPlan: string;
      };
    }>('/email-extractor/subscription-info');
    if (!response.data) {
      throw new Error(response.message || 'Failed to get subscription info');
    }
    return response;
  }

  /**
   * Log results viewed activity
   */
  static async logResultsViewed(jobId: string): Promise<{ success: boolean; message?: string; timestamp?: string }> {
    const response = await apiClient.post<{ success: boolean; message: string; timestamp: string }>(`/email-extractor/log-viewed/${jobId}`);
    if (!response.data) {
      throw new Error(response.message || 'Failed to log results viewed');
    }
    return response;
  }

  /**
   * Download CSV file
   */
  static downloadCsvFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
