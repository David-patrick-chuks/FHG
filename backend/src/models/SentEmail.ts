import mongoose, { Document, Model, Schema } from 'mongoose';
import { EmailStatus, ISentEmail } from '../types';

export interface ISentEmailDocument extends Omit<ISentEmail, '_id'>, Document {
  markAsDelivered(): Promise<void>;
  markAsOpened(): Promise<void>;
  markAsReplied(): Promise<void>;
  markAsFailed(errorMessage: string): Promise<void>;
  markAsBounced(): Promise<void>;
  getDeliveryTime(): number | null;
  getOpenTime(): number | null;
  getReplyTime(): number | null;
}

export interface ISentEmailModel extends Model<ISentEmailDocument> {
  findByCampaignId(campaignId: string): Promise<ISentEmailDocument[]>;
  findByBotId(botId: string): Promise<ISentEmailDocument[]>;
  findByRecipientEmail(email: string): Promise<ISentEmailDocument[]>;
  findByStatus(status: EmailStatus): Promise<ISentEmailDocument[]>;
  getDeliveryStats(campaignId: string): Promise<{
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    replied: number;
    failed: number;
    bounced: number;
    deliveryRate: number;
    openRate: number;
    replyRate: number;
  }>;
}

export class SentEmailModel {
  private static instance: ISentEmailModel;

  public static getInstance(): ISentEmailModel {
    if (!SentEmailModel.instance) {
      SentEmailModel.instance = SentEmailModel.createModel();
    }
    return SentEmailModel.instance;
  }

  private static createModel(): ISentEmailModel {
    const sentEmailSchema = new Schema<ISentEmailDocument>({
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
      subject: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200
      },
      message: {
        type: String,
        required: true,
        minlength: 10
      },
      status: {
        type: String,
        enum: Object.values(EmailStatus),
        default: EmailStatus.PENDING
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      deliveredAt: {
        type: Date
      },
      openedAt: {
        type: Date
      },
      repliedAt: {
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
    sentEmailSchema.index({ campaignId: 1 });
    sentEmailSchema.index({ botId: 1 });
    sentEmailSchema.index({ recipientEmail: 1 });
    sentEmailSchema.index({ status: 1 });
    sentEmailSchema.index({ sentAt: 1 });
    sentEmailSchema.index({ deliveredAt: 1 });
    sentEmailSchema.index({ openedAt: 1 });

    // Compound indexes
    sentEmailSchema.index({ campaignId: 1, status: 1 });
    sentEmailSchema.index({ botId: 1, status: 1 });
    sentEmailSchema.index({ campaignId: 1, sentAt: -1 });

    // Instance methods
    sentEmailSchema.methods['markAsDelivered'] = async function(): Promise<void> {
      this['status'] = EmailStatus.DELIVERED;
      this['deliveredAt'] = new Date();
      await this['save']();
    };

    sentEmailSchema.methods['markAsOpened'] = async function(): Promise<void> {
      if (this['status'] === EmailStatus.DELIVERED || this['status'] === EmailStatus.SENT) {
        this['status'] = EmailStatus.OPENED;
        this['openedAt'] = new Date();
        await this['save']();
      }
    };

    sentEmailSchema.methods['markAsReplied'] = async function(): Promise<void> {
      if (this['status'] === EmailStatus.OPENED || this['status'] === EmailStatus.DELIVERED || this['status'] === EmailStatus.SENT) {
        this['status'] = EmailStatus.REPLIED;
        this['repliedAt'] = new Date();
        await this['save']();
      }
    };

    sentEmailSchema.methods['markAsFailed'] = async function(errorMessage: string): Promise<void> {
      this['status'] = EmailStatus.FAILED;
      this['errorMessage'] = errorMessage;
      await this['save']();
    };

    sentEmailSchema.methods['markAsBounced'] = async function(): Promise<void> {
      this['status'] = EmailStatus.BOUNCED;
      await this['save']();
    };

    sentEmailSchema.methods['getDeliveryTime'] = function(): number | null {
      if (this['deliveredAt'] && this['sentAt']) {
        return this['deliveredAt'].getTime() - this['sentAt'].getTime();
      }
      return null;
    };

    sentEmailSchema.methods['getOpenTime'] = function(): number | null {
      if (this['openedAt'] && this['sentAt']) {
        return this['openedAt'].getTime() - this['sentAt'].getTime();
      }
      return null;
    };

    sentEmailSchema.methods['getReplyTime'] = function(): number | null {
      if (this['repliedAt'] && this['sentAt']) {
        return this['repliedAt'].getTime() - this['sentAt'].getTime();
      }
      return null;
    };

    // Static methods
    sentEmailSchema.statics['findByCampaignId'] = function(campaignId: string): Promise<ISentEmailDocument[]> {
      return this.find({ campaignId }).sort({ sentAt: -1 });
    };

    sentEmailSchema.statics['findByBotId'] = function(botId: string): Promise<ISentEmailDocument[]> {
      return this.find({ botId }).sort({ sentAt: -1 });
    };

    sentEmailSchema.statics['findByRecipientEmail'] = function(email: string): Promise<ISentEmailDocument[]> {
      return this.find({ recipientEmail: email.toLowerCase() }).sort({ sentAt: -1 });
    };

    sentEmailSchema.statics['findByStatus'] = function(status: EmailStatus): Promise<ISentEmailDocument[]> {
      return this.find({ status }).sort({ sentAt: -1 });
    };

    sentEmailSchema.statics['getDeliveryStats'] = async function(campaignId: string): Promise<{
      total: number;
      sent: number;
      delivered: number;
      opened: number;
      replied: number;
      failed: number;
      bounced: number;
      deliveryRate: number;
      openRate: number;
      replyRate: number;
    }> {
      const stats = await this.aggregate([
        { $match: { campaignId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', EmailStatus.SENT] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$status', EmailStatus.DELIVERED] }, 1, 0] } },
            opened: { $sum: { $cond: [{ $eq: ['$status', EmailStatus.OPENED] }, 1, 0] } },
            replied: { $sum: { $cond: [{ $eq: ['$status', EmailStatus.REPLIED] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', EmailStatus.FAILED] }, 1, 0] } },
            bounced: { $sum: { $cond: [{ $eq: ['$status', EmailStatus.BOUNCED] }, 1, 0] } }
          }
        }
      ]);

      const result = stats[0] || {
        total: 0, sent: 0, delivered: 0, opened: 0, replied: 0, failed: 0, bounced: 0
      };

      return {
        ...result,
        deliveryRate: result.total > 0 ? Math.round((result.delivered / result.total) * 100) : 0,
        openRate: result.delivered > 0 ? Math.round((result.opened / result.delivered) * 100) : 0,
        replyRate: result.opened > 0 ? Math.round((result.replied / result.opened) * 100) : 0
      };
    };

    return mongoose.model<ISentEmailDocument, ISentEmailModel>('SentEmail', sentEmailSchema);
  }
}

export default SentEmailModel.getInstance();
