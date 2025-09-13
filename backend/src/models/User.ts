import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Schema } from 'mongoose';
import { BillingCycle, IUser, SubscriptionTier } from '../types';
import BotModel from './Bot';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
  hasActiveSubscription(): boolean;
  canCreateBot(): boolean;
  getDailyEmailLimit(): number;
  getMaxBots(): number;
  getMaxCampaigns(): number;
  getMaxTemplates(): number;
  getMaxAIMessageVariations(): number;
  calculateSubscriptionExpiration(billingCycle: BillingCycle): Date;
  updateSubscription(subscription: SubscriptionTier, billingCycle: BillingCycle): Promise<void>;
  deactivateExcessBots(): Promise<void>;
  reactivateBotsForSubscription(): Promise<void>;
  generateApiKey(): Promise<string>;
  revokeApiKey(): Promise<void>;
  updateApiKeyLastUsed(): Promise<void>;
}

export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  createUser(userData: Partial<IUser>): Promise<IUserDocument>;
  findByApiKey(apiKey: string): Promise<IUserDocument | null>;
}

export class UserModel {
  private static instance: IUserModel;

  public static getInstance(): IUserModel {
    if (!UserModel.instance) {
      UserModel.instance = UserModel.createModel();
    }
    return UserModel.instance;
  }

  private static createModel(): IUserModel {
    const userSchema = new Schema<IUserDocument>({
      email: {
        type: String,
        required: true,
        unique: true,
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
      username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        validate: {
          validator: (username: string) => {
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            return usernameRegex.test(username);
          },
          message: 'Username can only contain letters, numbers, and underscores'
        }
      },
      password: {
        type: String,
        required: true,
        minlength: 8
      },
      subscription: {
        type: String,
        enum: Object.values(SubscriptionTier),
        default: SubscriptionTier.FREE
      },
      billingCycle: {
        type: String,
        enum: Object.values(BillingCycle),
        default: BillingCycle.MONTHLY
      },
      subscriptionExpiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      },
      isActive: {
        type: Boolean,
        default: true
      },
      isAdmin: {
        type: Boolean,
        default: false
      },
      lastLoginAt: {
        type: Date
      },
      passwordResetToken: {
        type: String,
        sparse: true
      },
      passwordResetExpires: {
        type: Date
      },
      apiKey: {
        type: String,
        unique: true,
        sparse: true
      },
      apiKeyCreatedAt: {
        type: Date
      },
      apiKeyLastUsed: {
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

    // Indexes (email and username are automatically indexed due to unique: true)
    userSchema.index({ subscription: 1 });
    userSchema.index({ isActive: 1 });

    // Pre-save middleware
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();

      try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (error) {
        next(error as Error);
      }
    });

    // Instance methods
    userSchema.methods['comparePassword'] = async function(candidatePassword: string): Promise<boolean> {
      return bcrypt.compare(candidatePassword, this['password']);
    };

    userSchema.methods['updateLastLogin'] = async function(): Promise<void> {
      this['lastLoginAt'] = new Date();
      await this['save']();
    };

    userSchema.methods['hasActiveSubscription'] = function(): boolean {
      return this['subscriptionExpiresAt'] > new Date();
    };

    userSchema.methods['canCreateBot'] = function(): boolean {
      // This will be checked against actual bot count in the service layer
      return this['hasActiveSubscription']();
    };

    userSchema.methods['getDailyEmailLimit'] = function(): number {
      const limits: Record<SubscriptionTier, number> = {
        [SubscriptionTier.FREE]: 500,
        [SubscriptionTier.BASIC]: 500,
        [SubscriptionTier.PREMIUM]: 500,
        [SubscriptionTier.PRO]: 500,
        [SubscriptionTier.ENTERPRISE]: 500
      };
      const subscription = this['subscription'] as SubscriptionTier;
      return limits[subscription] || 500;
    };

    userSchema.methods['getMaxBots'] = function(): number {
      const maxBots: Record<SubscriptionTier, number> = {
        [SubscriptionTier.FREE]: 2,
        [SubscriptionTier.BASIC]: 5,
        [SubscriptionTier.PREMIUM]: 10,
        [SubscriptionTier.PRO]: 10,
        [SubscriptionTier.ENTERPRISE]: 50
      };
      const subscription = this['subscription'] as SubscriptionTier;
      return maxBots[subscription] || 1;
    };

    userSchema.methods['getMaxCampaigns'] = function(): number {
      const maxCampaigns: Record<SubscriptionTier, number> = {
        [SubscriptionTier.FREE]: 2,
        [SubscriptionTier.BASIC]: 5,
        [SubscriptionTier.PREMIUM]: 10,
        [SubscriptionTier.PRO]: 10,
        [SubscriptionTier.ENTERPRISE]: 50
      };
      const subscription = this['subscription'] as SubscriptionTier;
      return maxCampaigns[subscription] || 5;
    };

    userSchema.methods['getMaxTemplates'] = function(): number {
      const maxTemplates: Record<SubscriptionTier, number> = {
        [SubscriptionTier.FREE]: 5,
        [SubscriptionTier.BASIC]: 15,
        [SubscriptionTier.PREMIUM]: 30,
        [SubscriptionTier.PRO]: 50,
        [SubscriptionTier.ENTERPRISE]: -1 // Unlimited
      };
      const subscription = this['subscription'] as SubscriptionTier;
      return maxTemplates[subscription] || 5;
    };

    userSchema.methods['getMaxAIMessageVariations'] = function(): number {
      const maxVariations: Record<SubscriptionTier, number> = {
        [SubscriptionTier.FREE]: 10,
        [SubscriptionTier.BASIC]: 15,
        [SubscriptionTier.PREMIUM]: 20,
        [SubscriptionTier.PRO]: 20,
        [SubscriptionTier.ENTERPRISE]: 50
      };
      const subscription = this['subscription'] as SubscriptionTier;
      return maxVariations[subscription] || 10;
    };

    userSchema.methods['calculateSubscriptionExpiration'] = function(billingCycle: BillingCycle): Date {
      const now = new Date();
      if (billingCycle === BillingCycle.YEARLY) {
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
      } else {
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
      }
    };

    userSchema.methods['updateSubscription'] = async function(subscription: SubscriptionTier, billingCycle: BillingCycle): Promise<void> {
      this['subscription'] = subscription;
      this['billingCycle'] = billingCycle;
      this['subscriptionExpiresAt'] = this['calculateSubscriptionExpiration'](billingCycle);
      await this['save']();
    };

    userSchema.methods['deactivateExcessBots'] = async function(): Promise<void> {
      const maxBots = this['getMaxBots']();
      const userBots = await BotModel.findByUserId(this['_id'].toString());
      
      if (userBots.length > maxBots) {
        // Sort bots by creation date (oldest first) to keep the first ones active
        const sortedBots = userBots.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        
        // Deactivate bots beyond the limit
        const botsToDeactivate = sortedBots.slice(maxBots);
        
        for (const bot of botsToDeactivate) {
          bot.isActive = false;
          await bot.save();
        }
      }
    };

    userSchema.methods['reactivateBotsForSubscription'] = async function(): Promise<void> {
      const maxBots = this['getMaxBots']();
      const userBots = await BotModel.findByUserId(this['_id'].toString());
      
      // Sort bots by creation date (oldest first) to reactivate in order
      const sortedBots = userBots.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      // Reactivate bots up to the subscription limit
      const botsToReactivate = sortedBots.slice(0, maxBots);
      
      for (const bot of botsToReactivate) {
        if (!bot.isActive) {
          bot.isActive = true;
          await bot.save();
        }
      }
    };

    userSchema.methods['generateApiKey'] = async function(): Promise<string> {
      const crypto = await import('crypto');
      const apiKey = `mail_quill_${crypto.randomBytes(32).toString('hex')}`;
      
      this['apiKey'] = apiKey;
      this['apiKeyCreatedAt'] = new Date();
      await this['save']();
      
      return apiKey;
    };

    userSchema.methods['updateApiKeyLastUsed'] = async function(): Promise<void> {
      this['apiKeyLastUsed'] = new Date();
      await this['save']();
    };

    userSchema.methods['revokeApiKey'] = async function(): Promise<void> {
      this['apiKey'] = undefined;
      this['apiKeyCreatedAt'] = undefined;
      this['apiKeyLastUsed'] = undefined;
      await this['save']();
    };

    // Static methods
    userSchema.statics['findByEmail'] = function(email: string): Promise<IUserDocument | null> {
      return this.findOne({ email: email.toLowerCase() });
    };

    userSchema.statics['createUser'] = async function(userData: Partial<IUser>): Promise<IUserDocument> {
      const user = new this(userData);
      return user.save();
    };

    userSchema.statics['findByApiKey'] = function(apiKey: string): Promise<IUserDocument | null> {
      return this.findOne({ apiKey, isActive: true });
    };

    return mongoose.model<IUserDocument, IUserModel>('User', userSchema);
  }
}

export default UserModel.getInstance();
