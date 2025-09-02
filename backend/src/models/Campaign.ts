import mongoose, { Document, Schema, Model } from 'mongoose';
import { ICampaign, CampaignStatus, ISentEmail } from '../types';

export interface ICampaignDocument extends Omit<ICampaign, '_id'>, Document {
  startCampaign(): Promise<void>;
  pauseCampaign(): Promise<void>;
  resumeCampaign(): Promise<void>;
  completeCampaign(): Promise<void>;
  cancelCampaign(): Promise<void>;
  addSentEmail(emailData: Partial<ISentEmail>): Promise<void>;
  getProgress(): { sent: number; total: number; percentage: number };
}

export interface ICampaignModel extends Model<ICampaignDocument> {
  findByUserId(userId: string): Promise<ICampaignDocument[]>;
  findByBotId(botId: string): Promise<ICampaignDocument[]>;
  findActiveCampaigns(): Promise<ICampaignDocument[]>;
  findCampaignsByStatus(status: CampaignStatus): Promise<ICampaignDocument[]>;
}

export class CampaignModel {
  private static instance: ICampaignModel;

  public static getInstance(): ICampaignModel {
    if (!CampaignModel.instance) {
      CampaignModel.instance = CampaignModel.createModel();
    }
    return CampaignModel.instance;
  }

  private static createModel(): ICampaignModel {
    const campaignSchema = new Schema<ICampaignDocument>({
      userId: {
        type: String,
        required: true,
        ref: 'User'
      },
      botId: {
        type: String,
        required: true,
        ref: 'Bot'
      },
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
      },
      description: {
        type: String,
        trim: true,
        maxlength: 1000
      },
      status: {
        type: String,
        enum: Object.values(CampaignStatus),
        default: CampaignStatus.DRAFT
      },
      emailList: [{
        type: String,
        required: true,
        validate: {
          validator: (email: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
          },
          message: 'Please provide valid email addresses'
        }
      }],
      aiMessages: [{
        type: String,
        trim: true,
        minlength: 10
      }],
      selectedMessageIndex: {
        type: Number,
        default: 0,
        min: 0
      },
      sentEmails: [{
        type: Schema.Types.ObjectId,
        ref: 'SentEmail'
      }],
      startedAt: {
        type: Date
      },
      completedAt: {
        type: Date
      }
    }, {
      timestamps: true
    });

    // Indexes
    campaignSchema.index({ userId: 1 });
    campaignSchema.index({ botId: 1 });
    campaignSchema.index({ status: 1 });
    campaignSchema.index({ createdAt: 1 });
    campaignSchema.index({ startedAt: 1 });

    // Compound indexes
    campaignSchema.index({ userId: 1, status: 1 });
    campaignSchema.index({ botId: 1, status: 1 });
    campaignSchema.index({ userId: 1, createdAt: -1 });

    // Instance methods
    campaignSchema.methods['startCampaign'] = async function(): Promise<void> {
      if (this['status'] !== CampaignStatus.READY) {
        throw new Error('Campaign must be in READY status to start');
      }
      
      this['status'] = CampaignStatus.RUNNING;
      this['startedAt'] = new Date();
      await this['save']();
    };

    campaignSchema.methods['pauseCampaign'] = async function(): Promise<void> {
      if (this['status'] !== CampaignStatus.RUNNING) {
        throw new Error('Campaign must be RUNNING to pause');
      }
      
      this['status'] = CampaignStatus.PAUSED;
      await this['save']();
    };

    campaignSchema.methods['resumeCampaign'] = async function(): Promise<void> {
      if (this['status'] !== CampaignStatus.PAUSED) {
        throw new Error('Campaign must be PAUSED to resume');
      }
      
      this['status'] = CampaignStatus.RUNNING;
      await this['save']();
    };

    campaignSchema.methods['completeCampaign'] = async function(): Promise<void> {
      if (this['status'] !== CampaignStatus.RUNNING && this['status'] !== CampaignStatus.PAUSED) {
        throw new Error('Campaign must be RUNNING or PAUSED to complete');
      }
      
      this['status'] = CampaignStatus.COMPLETED;
      this['completedAt'] = new Date();
      await this['save']();
    };

    campaignSchema.methods['cancelCampaign'] = async function(): Promise<void> {
      if (this['status'] === CampaignStatus.COMPLETED) {
        throw new Error('Cannot cancel completed campaign');
      }
      
      this['status'] = CampaignStatus.CANCELLED;
      await this['save']();
    };

    campaignSchema.methods['addSentEmail'] = async function(emailData: Partial<ISentEmail>): Promise<void> {
      // This will be implemented when we create the SentEmail model
      // For now, we'll just track the count
      this['sentEmails'].push(emailData._id || 'temp-id');
      await this['save']();
    };

    campaignSchema.methods['getProgress'] = function(): { sent: number; total: number; percentage: number } {
      const sent = this['sentEmails'].length;
      const total = this['emailList'].length;
      const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;
      
      return { sent, total, percentage };
    };

    // Static methods
    campaignSchema.statics['findByUserId'] = function(userId: string): Promise<ICampaignDocument[]> {
      return this.find({ userId }).sort({ createdAt: -1 });
    };

    campaignSchema.statics['findByBotId'] = function(botId: string): Promise<ICampaignDocument[]> {
      return this.find({ botId }).sort({ createdAt: -1 });
    };

    campaignSchema.statics['findActiveCampaigns'] = function(): Promise<ICampaignDocument[]> {
      return this.find({ 
        status: { $in: [CampaignStatus.RUNNING, CampaignStatus.PAUSED] } 
      }).sort({ createdAt: -1 });
    };

    campaignSchema.statics['findCampaignsByStatus'] = function(status: CampaignStatus): Promise<ICampaignDocument[]> {
      return this.find({ status }).sort({ createdAt: -1 });
    };

    // Pre-save middleware for validation
    campaignSchema.pre('save', function(next) {
      if (this['emailList'].length === 0) {
        next(new Error('Campaign must have at least one email address'));
      }
      
      if (this['aiMessages'].length === 0) {
        next(new Error('Campaign must have AI-generated messages'));
      }
      
      if (this['selectedMessageIndex'] >= this['aiMessages'].length) {
        next(new Error('Selected message index is out of range'));
      }
      
      next();
    });

    return mongoose.model<ICampaignDocument, ICampaignModel>('Campaign', campaignSchema);
  }
}

export default CampaignModel.getInstance();
