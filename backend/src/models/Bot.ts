import mongoose, { Document, Model, Schema } from 'mongoose';
import { IBot } from '../types';

export interface IBotDocument extends Omit<IBot, '_id'>, Document {
  incrementDailyEmailCount(): Promise<void>;
  resetDailyEmailCount(): Promise<void>;
  canSendEmail(): boolean;
  getDailyEmailLimit(): number;
}

export interface IBotModel extends Model<IBotDocument> {
  findByUserId(userId: string): Promise<IBotDocument[]>;
  findActiveByUserId(userId: string): Promise<IBotDocument[]>;
  resetAllDailyCounts(): Promise<void>;
}

export class BotModel {
  private static instance: IBotModel;

  public static getInstance(): IBotModel {
    if (!BotModel.instance) {
      BotModel.instance = BotModel.createModel();
    }
    return BotModel.instance;
  }

  private static createModel(): IBotModel {
    const botSchema = new Schema<IBotDocument>({
      userId: {
        type: String,
        required: true,
        ref: 'User'
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
        maxlength: 500
      },
      email: {
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
      password: {
        type: String,
        required: true
        // Note: This will be encrypted by the service layer
      },
      prompt: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 2000
      },
      isActive: {
        type: Boolean,
        default: true
      },
      dailyEmailCount: {
        type: Number,
        default: 0,
        min: 0,
        max: 500
      },
      lastEmailSentAt: {
        type: Date
      }
    }, {
      timestamps: true,
      toJSON: {
        transform: (_doc, ret) => {
          const { password, ...rest } = ret;
          return rest;
        }
      }
    });

    // Indexes
    botSchema.index({ userId: 1 });
    botSchema.index({ email: 1 });
    botSchema.index({ isActive: 1 });
    botSchema.index({ dailyEmailCount: 1 });
    botSchema.index({ lastEmailSentAt: 1 });

    // Compound indexes
    botSchema.index({ userId: 1, isActive: 1 });
    botSchema.index({ userId: 1, dailyEmailCount: 1 });

    // Instance methods
    botSchema.methods['incrementDailyEmailCount'] = async function(): Promise<void> {
      this['dailyEmailCount'] += 1;
      this['lastEmailSentAt'] = new Date();
      await this['save']();
    };

    botSchema.methods['resetDailyEmailCount'] = async function(): Promise<void> {
      this['dailyEmailCount'] = 0;
      await this['save']();
    };

    botSchema.methods['canSendEmail'] = function(): boolean {
      return this['isActive'] && this['dailyEmailCount'] < 500;
    };

    botSchema.methods['getDailyEmailLimit'] = function(): number {
      return 500; // Gmail limit per bot
    };

    // Static methods
    botSchema.statics['findByUserId'] = function(userId: string): Promise<IBotDocument[]> {
      return this.find({ userId }).sort({ createdAt: -1 });
    };

    botSchema.statics['findActiveByUserId'] = function(userId: string): Promise<IBotDocument[]> {
      return this.find({ userId, isActive: true }).sort({ createdAt: -1 });
    };

    botSchema.statics['resetAllDailyCounts'] = async function(): Promise<void> {
      await this.updateMany({}, { dailyEmailCount: 0 });
    };

    // Pre-save middleware for validation
    botSchema.pre('save', function(next) {
      if (this.dailyEmailCount > 500) {
        next(new Error('Daily email count cannot exceed 500'));
      }
      next();
    });

    return mongoose.model<IBotDocument, IBotModel>('Bot', botSchema);
  }
}

export default BotModel.getInstance();
