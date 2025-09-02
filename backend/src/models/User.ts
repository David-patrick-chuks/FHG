import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, SubscriptionTier } from '../types';

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
  hasActiveSubscription(): boolean;
  canCreateBot(): boolean;
  getDailyEmailLimit(): number;
  getMaxBots(): number;
}

export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  createUser(userData: Partial<IUser>): Promise<IUserDocument>;
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
      }
    }, {
      timestamps: true,
      toJSON: {
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        }
      }
    });

    // Indexes
    userSchema.index({ email: 1 });
    userSchema.index({ username: 1 });
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
    userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
      return bcrypt.compare(candidatePassword, this.password);
    };

    userSchema.methods.updateLastLogin = async function(): Promise<void> {
      this.lastLoginAt = new Date();
      await this.save();
    };

    userSchema.methods.hasActiveSubscription = function(): boolean {
      return this.subscriptionExpiresAt > new Date();
    };

    userSchema.methods.canCreateBot = function(): boolean {
      const maxBots = this.getMaxBots();
      // This will be checked against actual bot count in the service layer
      return this.hasActiveSubscription();
    };

    userSchema.methods.getDailyEmailLimit = function(): number {
      const limits = {
        [SubscriptionTier.FREE]: 500,
        [SubscriptionTier.PRO]: 1500,
        [SubscriptionTier.ENTERPRISE]: 3000
      };
      return limits[this.subscription] || 500;
    };

    userSchema.methods.getMaxBots = function(): number {
      const maxBots = {
        [SubscriptionTier.FREE]: 1,
        [SubscriptionTier.PRO]: 3,
        [SubscriptionTier.ENTERPRISE]: 5
      };
      return maxBots[this.subscription] || 1;
    };

    // Static methods
    userSchema.statics.findByEmail = function(email: string): Promise<IUserDocument | null> {
      return this.findOne({ email: email.toLowerCase() });
    };

    userSchema.statics.createUser = async function(userData: Partial<IUser>): Promise<IUserDocument> {
      const user = new this(userData);
      return user.save();
    };

    return mongoose.model<IUserDocument, IUserModel>('User', userSchema);
  }
}

export default UserModel.getInstance();
