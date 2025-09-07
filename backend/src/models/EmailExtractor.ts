import mongoose, { Document, Schema } from 'mongoose';
import { Logger } from '../utils/Logger';

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

export interface ExtractionResult {
  url: string;
  emails: string[];
  status: 'success' | 'failed' | 'processing';
  error?: string;
  extractedAt: Date;
  startedAt?: Date;
  duration?: number; // Duration in milliseconds
}

export enum ExtractionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface IEmailExtractionDocument extends IEmailExtraction, Document {
  _id: string;
}

const extractionResultSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  emails: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['success', 'failed', 'processing'],
    default: 'processing'
  },
  error: {
    type: String,
    default: null
  },
  extractedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: null
  }
}, { _id: false });

const emailExtractionSchema = new Schema<IEmailExtractionDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(ExtractionStatus),
    default: ExtractionStatus.PENDING,
    index: true
  },
  urls: [{
    type: String,
    required: true
  }],
  results: [extractionResultSchema],
  totalEmails: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: null
  }
}, {
  timestamps: true,
  collection: 'email_extractions'
});

// Indexes for better query performance
emailExtractionSchema.index({ userId: 1, createdAt: -1 });
emailExtractionSchema.index({ status: 1, createdAt: -1 });

// Static methods
emailExtractionSchema.statics.createExtraction = async function(
  userId: string,
  jobId: string,
  urls: string[]
): Promise<IEmailExtractionDocument> {
  const extraction = new this({
    userId,
    jobId,
    urls,
    results: urls.map(url => ({
      url,
      emails: [],
      status: 'processing' as const,
      extractedAt: new Date()
    }))
  });
  
  return await extraction.save();
};

emailExtractionSchema.statics.getUserExtractions = async function(
  userId: string,
  limit: number = 20,
  skip: number = 0
): Promise<IEmailExtractionDocument[]> {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

emailExtractionSchema.statics.getExtractionByJobId = async function(
  jobId: string
): Promise<IEmailExtractionDocument | null> {
  return await this.findOne({ jobId });
};

emailExtractionSchema.statics.updateExtractionStatus = async function(
  jobId: string,
  status: ExtractionStatus,
  error?: string
): Promise<boolean> {
  const updateData: any = { status };
  
  if (status === ExtractionStatus.COMPLETED) {
    updateData.completedAt = new Date();
  }
  
  if (error) {
    updateData.error = error;
  }
  
  const result = await this.updateOne({ jobId }, updateData);
  return result.modifiedCount > 0;
};

emailExtractionSchema.statics.updateExtractionResult = async function(
  jobId: string,
  url: string,
  emails: string[],
  status: 'success' | 'failed',
  error?: string,
  startedAt?: Date,
  duration?: number
): Promise<boolean> {
  const extraction = await this.findOne({ jobId });
  if (!extraction) return false;
  
  const resultIndex = extraction.results.findIndex(r => r.url === url);
  if (resultIndex === -1) return false;
  
  extraction.results[resultIndex] = {
    url,
    emails,
    status,
    error,
    extractedAt: new Date(),
    startedAt: startedAt || new Date(),
    duration: duration || null
  };
  
  // Update total emails count
  extraction.totalEmails = extraction.results.reduce((total, result) => 
    total + (result.emails ? result.emails.length : 0), 0
  );
  
  await extraction.save();
  return true;
};

// Instance methods
emailExtractionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: obj._id,
    jobId: obj.jobId,
    status: obj.status,
    urls: obj.urls,
    results: obj.results,
    totalEmails: obj.totalEmails,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    startedAt: obj.startedAt,
    duration: obj.duration,
    completedAt: obj.completedAt,
    error: obj.error
  };
};

export class EmailExtractionModel {
  private static instance: mongoose.Model<IEmailExtractionDocument> | null = null;
  private static logger: Logger = new Logger();

  public static getInstance(): mongoose.Model<IEmailExtractionDocument> {
    if (!EmailExtractionModel.instance) {
      try {
        EmailExtractionModel.instance = mongoose.model<IEmailExtractionDocument>('EmailExtraction', emailExtractionSchema);
        EmailExtractionModel.logger.info('EmailExtraction model initialized successfully');
      } catch (error) {
        EmailExtractionModel.logger.error('Error initializing EmailExtraction model:', error);
        throw error;
      }
    }
    return EmailExtractionModel.instance;
  }

  public static async createExtraction(
    userId: string,
    jobId: string,
    urls: string[]
  ): Promise<IEmailExtractionDocument> {
    const model = EmailExtractionModel.getInstance();
    return await (model as any).createExtraction(userId, jobId, urls);
  }

  public static async getUserExtractions(
    userId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<IEmailExtractionDocument[]> {
    const model = EmailExtractionModel.getInstance();
    return await (model as any).getUserExtractions(userId, limit, skip);
  }

  public static async getExtractionByJobId(
    jobId: string
  ): Promise<IEmailExtractionDocument | null> {
    const model = EmailExtractionModel.getInstance();
    return await (model as any).getExtractionByJobId(jobId);
  }

  public static async updateExtractionStatus(
    jobId: string,
    status: ExtractionStatus,
    error?: string
  ): Promise<boolean> {
    const model = EmailExtractionModel.getInstance();
    return await (model as any).updateExtractionStatus(jobId, status, error);
  }

  public static async updateExtractionResult(
    jobId: string,
    url: string,
    emails: string[],
    status: 'success' | 'failed',
    error?: string
  ): Promise<boolean> {
    const model = EmailExtractionModel.getInstance();
    return await (model as any).updateExtractionResult(jobId, url, emails, status, error);
  }
}
