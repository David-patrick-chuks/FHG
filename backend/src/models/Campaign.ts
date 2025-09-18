import mongoose, { Document, Model, Schema } from 'mongoose';
import { CampaignStatus, ICampaign, ISentEmail } from '../types';

export interface ICampaignDocument extends Omit<ICampaign, '_id'>, Document {
  prepareCampaign(): Promise<void>;
  startCampaign(): Promise<void>;
  scheduleCampaign(scheduledFor: Date): Promise<void>;
  pauseCampaign(): Promise<void>;
  resumeCampaign(): Promise<void>;
  completeCampaign(): Promise<void>;
  cancelCampaign(): Promise<void>;
  addSentEmail(emailData: Partial<ISentEmail>): Promise<void>;
  markMessageAsSent(recipientEmail: string): Promise<void>;
  deleteSentMessages(): Promise<void>;
  getProgress(): { sent: number; total: number; percentage: number };
  scheduledFor?: Date;
  isScheduled: boolean;
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
      templateId: {
        type: String,
        ref: 'Template',
        required: false
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
      generatedMessages: [{
        recipientEmail: {
          type: String,
          required: true,
          validate: {
            validator: (email: string) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(email);
            },
            message: 'Please provide valid email address'
          }
        },
        recipientName: {
          type: String,
          trim: true
        },
        subject: {
          type: String,
          required: true,
          trim: true,
          minlength: 5,
          maxlength: 200
        },
        body: {
          type: String,
          required: true,
          trim: true,
          minlength: 10
        },
        personalizationData: {
          type: Schema.Types.Mixed,
          default: {}
        },
        isSent: {
          type: Boolean,
          default: false
        },
        sentAt: {
          type: Date
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
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
      },
      scheduledFor: {
        type: Date
      },
      isScheduled: {
        type: Boolean,
        default: false
      },
      emailInterval: {
        type: Number,
        default: 0, // 0 means no interval (send all at once)
        min: 0,
        max: 1440 // Maximum 24 hours (1440 minutes)
      },
      emailIntervalUnit: {
        type: String,
        enum: ['seconds', 'minutes', 'hours'],
        default: 'minutes'
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
    campaignSchema.methods['prepareCampaign'] = async function(): Promise<void> {
      if (this['status'] !== CampaignStatus.DRAFT) {
        throw new Error('Campaign must be in DRAFT status to prepare');
      }
      
      this['status'] = CampaignStatus.SCHEDULED;
      await this['save']();
    };

    campaignSchema.methods['startCampaign'] = async function(): Promise<void> {
      if (this['status'] !== CampaignStatus.SCHEDULED) {
        throw new Error('Campaign must be in SCHEDULED status to start');
      }
      
      this['status'] = CampaignStatus.RUNNING;
      this['startedAt'] = new Date();
      await this['save']();
    };

    campaignSchema.methods['scheduleCampaign'] = async function(scheduledFor: Date): Promise<void> {
      if (this['status'] !== CampaignStatus.DRAFT && this['status'] !== CampaignStatus.SCHEDULED) {
        throw new Error('Campaign must be in DRAFT or SCHEDULED status to schedule');
      }
      
      if (scheduledFor <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      
      this['status'] = CampaignStatus.SCHEDULED;
      this['scheduledFor'] = scheduledFor;
      this['isScheduled'] = true;
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
      // Add the sent email ID to the campaign's sentEmails array
      if (emailData._id) {
        this['sentEmails'].push(emailData._id);
        await this['save']();
      }
    };

    campaignSchema.methods['getProgress'] = function(): { sent: number; total: number; percentage: number } {
      const sent = this['sentEmails'].length;
      const total = this['emailList'].length;
      const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;
      
      return { sent, total, percentage };
    };

    campaignSchema.methods['addGeneratedMessages'] = async function(messages: any[]): Promise<void> {
      this['generatedMessages'] = messages;
      await this['save']();
    };

    campaignSchema.methods['markMessageAsSent'] = async function(recipientEmail: string): Promise<void> {
      const message = this['generatedMessages'].find((msg: any) => msg.recipientEmail === recipientEmail);
      if (message) {
        message.isSent = true;
        message.sentAt = new Date();
        await this['save']();
      }
    };

    campaignSchema.methods['getUnsentMessages'] = function(): any[] {
      return this['generatedMessages'].filter((msg: any) => !msg.isSent);
    };

    campaignSchema.methods['getSentMessages'] = function(): any[] {
      return this['generatedMessages'].filter((msg: any) => msg.isSent);
    };

    campaignSchema.methods['getMessageForRecipient'] = function(recipientEmail: string): any {
      return this['generatedMessages'].find((msg: any) => msg.recipientEmail === recipientEmail);
    };

    campaignSchema.methods['deleteSentMessages'] = async function(): Promise<void> {
      this['generatedMessages'] = this['generatedMessages'].filter((msg: any) => !msg.isSent);
      await this['save']();
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
      
      // Validate generatedMessages if they exist
      if (this['generatedMessages'] && this['generatedMessages'].length > 0) {
        if (this['generatedMessages'].length !== this['emailList'].length) {
          next(new Error('Generated messages count must match email list count'));
        }
      }
      
      next();
    });

    return mongoose.model<ICampaignDocument, ICampaignModel>('Campaign', campaignSchema);
  }
}

export default CampaignModel.getInstance();