import mongoose, { Document, Model, Schema } from 'mongoose';
import { ISubscription, PaymentMethod, SubscriptionStatus, SubscriptionTier } from '../types';

export interface ISubscriptionDocument extends Omit<ISubscription, '_id'>, Document {
  isActive: boolean; // Property for the boolean value
  isActiveMethod(): boolean; // Method that returns boolean (renamed to avoid conflict)
  isExpired(): boolean;
  daysUntilExpiry(): number;
  renew(duration: number): Promise<void>;
  cancel(): Promise<void>;
  suspend(): Promise<void>;
  activate(): Promise<void>;
}

export interface ISubscriptionModel extends Model<ISubscriptionDocument> {
  findByUserId(userId: string): Promise<ISubscriptionDocument[]>;
  findActiveByUserId(userId: string): Promise<ISubscriptionDocument | null>;
  findByStatus(status: SubscriptionStatus): Promise<ISubscriptionDocument[]>;
  findByTier(tier: SubscriptionTier): Promise<ISubscriptionDocument[]>;
  getActiveSubscriptions(): Promise<ISubscriptionDocument[]>;
  getExpiredSubscriptions(): Promise<ISubscriptionDocument[]>;
  getRevenueStats(startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    subscriptionCount: number;
    averageRevenue: number;
    revenueByTier: Record<SubscriptionTier, number>;
  }>;
}

export class SubscriptionModel {
  private static instance: ISubscriptionModel;

  public static getInstance(): ISubscriptionModel {
    if (!SubscriptionModel.instance) {
      SubscriptionModel.instance = SubscriptionModel.createModel();
    }
    return SubscriptionModel.instance;
  }

  private static createModel(): ISubscriptionModel {
    const subscriptionSchema = new Schema<ISubscriptionDocument>({
      userId: {
        type: String,
        required: true,
        ref: 'User'
      },
      tier: {
        type: String,
        enum: Object.values(SubscriptionTier),
        required: true
      },
      status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.ACTIVE
      },
      startDate: {
        type: Date,
        required: true,
        default: Date.now
      },
      endDate: {
        type: Date,
        required: true
      },
      paymentMethod: {
        type: String,
        enum: Object.values(PaymentMethod),
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        minlength: 3,
        maxlength: 3
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }, {
      timestamps: true
    });

    // Indexes
    subscriptionSchema.index({ userId: 1 });
    subscriptionSchema.index({ tier: 1 });
    subscriptionSchema.index({ status: 1 });
    subscriptionSchema.index({ startDate: 1 });
    subscriptionSchema.index({ endDate: 1 });
    subscriptionSchema.index({ isActive: 1 });

    // Compound indexes
    subscriptionSchema.index({ userId: 1, status: 1 });
    subscriptionSchema.index({ userId: 1, isActive: 1 });
    subscriptionSchema.index({ status: 1, endDate: 1 });

    // Instance methods
    subscriptionSchema.methods['isActiveMethod'] = function(): boolean {
      return this['status'] === SubscriptionStatus.ACTIVE && 
             this['isActive'] === true && 
             this['endDate'] > new Date();
    };

    subscriptionSchema.methods['isExpired'] = function(): boolean {
      return this['endDate'] <= new Date();
    };

    subscriptionSchema.methods['daysUntilExpiry'] = function(): number {
      const now = new Date();
      const timeDiff = this['endDate'].getTime() - now.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    subscriptionSchema.methods['renew'] = async function(duration: number): Promise<void> {
      const currentEndDate = this['endDate'];
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + duration);
      
      this['endDate'] = newEndDate;
      this['status'] = SubscriptionStatus.ACTIVE;
      this['isActive'] = true;
      await this['save']();
    };

    subscriptionSchema.methods['cancel'] = async function(): Promise<void> {
      this['status'] = SubscriptionStatus.CANCELLED;
      this['isActive'] = false;
      await this['save']();
    };

    subscriptionSchema.methods['suspend'] = async function(): Promise<void> {
      this['status'] = SubscriptionStatus.SUSPENDED;
      this['isActive'] = false;
      await this['save']();
    };

    subscriptionSchema.methods['activate'] = async function(): Promise<void> {
      if (this['isExpired']()) {
        throw new Error('Cannot activate expired subscription');
      }
      
      this['status'] = SubscriptionStatus.ACTIVE;
      this['isActive'] = true;
      await this['save']();
    };

    // Static methods
    subscriptionSchema.statics['findByUserId'] = function(userId: string): Promise<ISubscriptionDocument[]> {
      return this.find({ userId }).sort({ startDate: -1 });
    };

    subscriptionSchema.statics['findActiveByUserId'] = function(userId: string): Promise<ISubscriptionDocument | null> {
      return this.findOne({ 
        userId, 
        status: SubscriptionStatus.ACTIVE, 
        isActive: true,
        endDate: { $gt: new Date() }
      });
    };

    subscriptionSchema.statics['findByStatus'] = function(status: SubscriptionStatus): Promise<ISubscriptionDocument[]> {
      return this.find({ status }).sort({ startDate: -1 });
    };

    subscriptionSchema.statics['findByTier'] = function(tier: SubscriptionTier): Promise<ISubscriptionDocument[]> {
      return this.find({ tier }).sort({ startDate: -1 });
    };

    subscriptionSchema.statics['getActiveSubscriptions'] = function(): Promise<ISubscriptionDocument[]> {
      return this.find({ 
        status: SubscriptionStatus.ACTIVE, 
        isActive: true,
        endDate: { $gt: new Date() }
      }).sort({ startDate: -1 });
    };

    subscriptionSchema.statics['getExpiredSubscriptions'] = function(): Promise<ISubscriptionDocument[]> {
      return this.find({ 
        $or: [
          { endDate: { $lte: new Date() } },
          { status: SubscriptionStatus.EXPIRED }
        ]
      }).sort({ endDate: -1 });
    };

    subscriptionSchema.statics['getRevenueStats'] = async function(startDate: Date, endDate: Date): Promise<{
      totalRevenue: number;
      subscriptionCount: number;
      averageRevenue: number;
      revenueByTier: Record<SubscriptionTier, number>;
    }> {
      const stats = await this.aggregate([
        {
          $match: {
            startDate: { $gte: startDate, $lte: endDate },
            status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            subscriptionCount: { $sum: 1 },
            revenueByTier: {
              $push: {
                tier: '$tier',
                amount: '$amount'
              }
            }
          }
        }
      ]);

      const result = stats[0] || { totalRevenue: 0, subscriptionCount: 0, revenueByTier: [] };
      
      // Calculate revenue by tier
      const revenueByTier: Record<SubscriptionTier, number> = {
        [SubscriptionTier.FREE]: 0,
        [SubscriptionTier.BASIC]: 0,
        [SubscriptionTier.PREMIUM]: 0
      };

      result.revenueByTier.forEach((item: any) => {
        const tier = item.tier as SubscriptionTier;
        if (tier && revenueByTier.hasOwnProperty(tier)) {
          revenueByTier[tier] = (revenueByTier[tier] || 0) + item.amount;
        }
      });

      return {
        totalRevenue: result.totalRevenue,
        subscriptionCount: result.subscriptionCount,
        averageRevenue: result.subscriptionCount > 0 ? result.totalRevenue / result.subscriptionCount : 0,
        revenueByTier
      };
    };

    // Pre-save middleware for validation
    subscriptionSchema.pre('save', function(next) {
      if (this.startDate >= this.endDate) {
        next(new Error('Start date must be before end date'));
      }
      
      if (this.amount < 0) {
        next(new Error('Amount cannot be negative'));
      }
      
      next();
    });

    return mongoose.model<ISubscriptionDocument, ISubscriptionModel>('Subscription', subscriptionSchema);
  }
}

export default SubscriptionModel.getInstance();
