// Email Extractor Types

export interface IEmailExtraction {
  _id?: string;
  userId: string;
  jobId: string;
  status: ExtractionStatus;
  urls: string[];
  results: ExtractionResult[];
  totalEmails: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  startedAt?: Date;
  duration?: number; // Duration in milliseconds
}

export interface ExtractionStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  message?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  details?: any;
}

export interface ExtractionResult {
  url: string;
  emails: string[];
  status: 'success' | 'failed' | 'processing';
  error?: string;
  extractedAt: Date;
  startedAt?: Date;
  duration?: number; // Duration in milliseconds
  progress?: ExtractionStep[]; // Detailed progress tracking
  currentStep?: string; // Current step being processed
}

export enum ExtractionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
