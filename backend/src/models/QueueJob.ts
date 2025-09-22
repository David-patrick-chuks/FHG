import mongoose, { Document, Model, Schema } from 'mongoose';
import { IQueueJob, QueueJobStatus } from '../types';

export interface IQueueJobDocument extends Omit<IQueueJob, '_id'>, Document<unknown, any, any> {
  markAsProcessing(): Promise<void>;
  markAsCompleted(): Promise<void>;
  markAsFailed(errorMessage: string): Promise<void>;
  markAsCancelled(): Promise<void>;
  incrementAttempts(): Promise<void>;
  canRetry(): boolean;
  getProcessingTime(): number | null;
  getQueueTime(): number;
}

export interface IQueueJobModel extends Model<IQueueJobDocument> {
  findByCampaignId(campaignId: string): Promise<IQueueJobDocument[]>;
  findByBotId(botId: string): Promise<IQueueJobDocument[]>;
  findPendingJobs(): Promise<IQueueJobDocument[]>;
  findFailedJobs(): Promise<IQueueJobDocument[]>;
  findJobsByStatus(status: QueueJobStatus): Promise<IQueueJobDocument[]>;
  getQueueStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageProcessingTime: number;
    averageQueueTime: number;
  }>;
  cleanupOldJobs(days: number): Promise<number>;
}

export class QueueJobModel {
  private static instance: IQueueJobModel;

  public static getInstance(): IQueueJobModel {
    if (!QueueJobModel.instance) {
      QueueJobModel.instance = QueueJobModel.createModel();
    }
    return QueueJobModel.instance;
  }

  private static createModel(): IQueueJobModel {
    const queueJobSchema = new Schema<IQueueJobDocument>({
      campaignId: {
        type: String,
        required: true,
        ref: 'Campaign'
      },
      botId: {
        type: String,
        required: true,
        ref: 'Bot'
      },
      recipientEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate: {
          validator: (email: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
          },
          message: 'Please provide a valid email address'
        }
      },
      message: {
        type: String,
        required: true,
        minlength: 10
      },
      priority: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
      },
      status: {
        type: String,
        enum: Object.values(QueueJobStatus),
        default: QueueJobStatus.PENDING
      },
      attempts: {
        type: Number,
        default: 0,
        min: 0
      },
      maxAttempts: {
        type: Number,
        default: 3,
        min: 1,
        max: 10
      },
      scheduledFor: {
        type: Date,
        required: true,
        default: Date.now
      },
      processedAt: {
        type: Date
      },
      errorMessage: {
        type: String,
        trim: true
      }
    }, {
      timestamps: true
    });

    // Indexes
    queueJobSchema.index({ campaignId: 1 });
    queueJobSchema.index({ botId: 1 });
    queueJobSchema.index({ status: 1 });
    queueJobSchema.index({ priority: 1 });
    queueJobSchema.index({ scheduledFor: 1 });
    queueJobSchema.index({ createdAt: 1 });
    queueJobSchema.index({ processedAt: 1 });

    // Compound indexes
    queueJobSchema.index({ status: 1, priority: -1 });
    queueJobSchema.index({ botId: 1, status: 1 });
    queueJobSchema.index({ status: 1, scheduledFor: 1 });
    queueJobSchema.index({ campaignId: 1, status: 1 });

    // Instance methods
    (queueJobSchema.methods as any)['markAsProcessing'] = async function(): Promise<void> {
      (this as any)['status'] = QueueJobStatus.PROCESSING;
      await (this as any)['save']();
    };

    (queueJobSchema.methods as any)['markAsCompleted'] = async function(): Promise<void> {
      (this as any)['status'] = QueueJobStatus.COMPLETED;
      (this as any)['processedAt'] = new Date();
      await (this as any)['save']();
    };

    (queueJobSchema.methods as any)['markAsFailed'] = async function(errorMessage: string): Promise<void> {
      (this as any)['status'] = QueueJobStatus.FAILED;
      (this as any)['processedAt'] = new Date();
      (this as any)['errorMessage'] = errorMessage;
      await (this as any)['save']();
    };

    (queueJobSchema.methods as any)['markAsCancelled'] = async function(): Promise<void> {
      (this as any)['status'] = QueueJobStatus.CANCELLED;
      (this as any)['processedAt'] = new Date();
      await (this as any)['save']();
    };

    (queueJobSchema.methods as any)['incrementAttempts'] = async function(): Promise<void> {
      (this as any)['attempts'] += 1;
      await (this as any)['save']();
    };

    (queueJobSchema.methods as any)['canRetry'] = function(): boolean {
      return (this as any)['attempts'] < (this as any)['maxAttempts'] && (this as any)['status'] === QueueJobStatus.FAILED;
    };

    (queueJobSchema.methods as any)['getProcessingTime'] = function(): number | null {
      if ((this as any)['processedAt'] && (this as any)['scheduledFor']) {
        return (this as any)['processedAt'].getTime() - (this as any)['scheduledFor'].getTime();
      }
      return null;
    };

    (queueJobSchema.methods as any)['getQueueTime'] = function(): number {
      const now = new Date();
      return now.getTime() - (this as any)['createdAt'].getTime();
    };

    // Static methods
    (queueJobSchema.statics as any)['findByCampaignId'] = function(campaignId: string): Promise<IQueueJobDocument[]> {
      return this.find({ campaignId }).sort({ createdAt: -1 });
    };

    (queueJobSchema.statics as any)['findByBotId'] = function(botId: string): Promise<IQueueJobDocument[]> {
      return this.find({ botId }).sort({ createdAt: -1 });
    };

    (queueJobSchema.statics as any)['findPendingJobs'] = function(): Promise<IQueueJobDocument[]> {
      return this.find({ 
        status: QueueJobStatus.PENDING,
        scheduledFor: { $lte: new Date() }
      }).sort({ priority: -1, scheduledFor: 1 });
    };

    (queueJobSchema.statics as any)['findFailedJobs'] = function(): Promise<IQueueJobDocument[]> {
      return this.find({ status: QueueJobStatus.FAILED }).sort({ createdAt: -1 });
    };

    (queueJobSchema.statics as any)['findJobsByStatus'] = function(status: QueueJobStatus): Promise<IQueueJobDocument[]> {
      return this.find({ status }).sort({ createdAt: -1 });
    };

    (queueJobSchema.statics as any)['getQueueStats'] = async function(): Promise<{
      total: number;
      pending: number;
      processing: number;
      completed: number;
      failed: number;
      cancelled: number;
      averageProcessingTime: number;
      averageQueueTime: number;
    }> {
      const stats = await this.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', QueueJobStatus.PENDING] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', QueueJobStatus.PROCESSING] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', QueueJobStatus.COMPLETED] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', QueueJobStatus.FAILED] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', QueueJobStatus.CANCELLED] }, 1, 0] } },
            processingTimes: {
              $push: {
                $cond: [
                  { $and: [{ $ne: ['$processedAt', null] }, { $ne: ['$scheduledFor', null] }] },
                  { $subtract: ['$processedAt', '$scheduledFor'] },
                  null
                ]
              }
            },
            queueTimes: {
              $push: {
                $subtract: [new Date(), '$createdAt']
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0, pending: 0, processing: 0, completed: 0, failed: 0, cancelled: 0,
        processingTimes: [], queueTimes: []
      };

      // Calculate average processing time
      const validProcessingTimes = result.processingTimes.filter((time: number) => time !== null);
      const averageProcessingTime = validProcessingTimes.length > 0 
        ? validProcessingTimes.reduce((sum: number, time: number) => sum + time, 0) / validProcessingTimes.length
        : 0;

      // Calculate average queue time
      const averageQueueTime = result.queueTimes.length > 0
        ? result.queueTimes.reduce((sum: number, time: number) => sum + time, 0) / result.queueTimes.length
        : 0;

      return {
        total: result.total,
        pending: result.pending,
        processing: result.processing,
        completed: result.completed,
        failed: result.failed,
        cancelled: result.cancelled,
        averageProcessingTime: Math.round(averageProcessingTime),
        averageQueueTime: Math.round(averageQueueTime)
      };
    };

    (queueJobSchema.statics as any)['cleanupOldJobs'] = async function(days: number): Promise<number> {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await this.deleteMany({
        status: { $in: [QueueJobStatus.COMPLETED, QueueJobStatus.FAILED, QueueJobStatus.CANCELLED] },
        processedAt: { $lt: cutoffDate }
      });

      return result.deletedCount || 0;
    };

    // Pre-save middleware for validation
    queueJobSchema.pre('save', function(next) {
      if (this.attempts > this.maxAttempts) {
        next(new Error('Attempts cannot exceed max attempts'));
      }
      
      if (this.priority < 1 || this.priority > 10) {
        next(new Error('Priority must be between 1 and 10'));
      }
      
      next();
    });

    return mongoose.model<IQueueJobDocument, IQueueJobModel>('QueueJob', queueJobSchema);
  }
}

export default QueueJobModel.getInstance();
