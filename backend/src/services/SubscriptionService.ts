import SubscriptionModel, { ISubscriptionDocument } from '../models/Subscription';
import UserModel, { IUserDocument } from '../models/User';
import { ApiResponse, CreateSubscriptionRequest, SubscriptionStatus, SubscriptionTier, BillingCycle, SubscriptionUpgradeRequest, ChangeBillingCycleRequest } from '../types';
import { Logger } from '../utils/Logger';
import { PaginationParams, PaginationResult, PaginationUtils } from '../utils/PaginationUtils';

export class SubscriptionService {
  private static logger: Logger = new Logger();

  public static async createSubscription(userId: string, subscriptionData: CreateSubscriptionRequest): Promise<ApiResponse<ISubscriptionDocument>> {
    try {
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Check if user already has an active subscription
      const existingSubscription = await SubscriptionModel.findActiveByUserId(userId);
      if (existingSubscription) {
        return {
          success: false,
          message: 'User already has an active subscription',
          timestamp: new Date()
        };
      }

      // Calculate end date based on duration
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + subscriptionData.duration);

      // Create subscription
      const subscription = new SubscriptionModel({
        ...subscriptionData,
        userId,
        startDate,
        endDate,
        status: SubscriptionStatus.ACTIVE,
        isActive: true
      });

      await subscription.save();

      // Update user's subscription info
      user.subscription = subscriptionData.tier;
      user.subscriptionExpiresAt = endDate;
      await user.save();

      SubscriptionService.logger.info('Subscription created successfully', {
        subscriptionId: subscription._id,
        userId,
        tier: subscription.tier,
        amount: subscription.amount,
        duration: subscriptionData.duration
      });

      return {
        success: true,
        message: 'Subscription created successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  public static async getSubscriptionsByUserId(userId: string): Promise<ApiResponse<ISubscriptionDocument[]>> {
    try {
      const subscriptions = await SubscriptionModel.findByUserId(userId);
      
      return {
        success: true,
        message: 'Subscriptions retrieved successfully',
        data: subscriptions,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving subscriptions:', error);
      throw error;
    }
  }

  public static async getSubscriptionsByUserIdWithPagination(
    userId: string, 
    paginationParams: PaginationParams
  ): Promise<ApiResponse<PaginationResult<ISubscriptionDocument>>> {
    try {
      // Build query
      const query: any = { userId };
      
      // Add search filter if provided
      if (paginationParams.search) {
        const searchRegex = PaginationUtils.createSearchRegex(paginationParams.search);
        query.$or = [
          { tier: searchRegex },
          { status: searchRegex }
        ];
      }

      // Build sort object
      const sortBy = paginationParams.sortBy || 'createdAt';
      const sortOrder = paginationParams.sortOrder || 'desc';
      const sort = PaginationUtils.createSortObject(sortBy, sortOrder);

      // Get total count
      const total = await SubscriptionModel.countDocuments(query);

      // Get paginated results
      const subscriptions = await SubscriptionModel.find(query)
        .sort(sort)
        .skip(paginationParams.offset)
        .limit(paginationParams.limit);

      // Create pagination result
      const paginationResult = PaginationUtils.createPaginationResult(
        subscriptions,
        total,
        paginationParams.page,
        paginationParams.limit
      );
      
      return {
        success: true,
        message: 'Subscriptions retrieved successfully',
        data: paginationResult,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving subscriptions with pagination:', error);
      throw error;
    }
  }

  public static async getActiveSubscriptionByUserId(userId: string): Promise<ApiResponse<ISubscriptionDocument | null>> {
    try {
      const subscription = await SubscriptionModel.findActiveByUserId(userId);
      
      return {
        success: true,
        message: subscription ? 'Active subscription found' : 'No active subscription found',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving active subscription:', error);
      throw error;
    }
  }

  public static async getSubscriptionById(subscriptionId: string, userId: string): Promise<ApiResponse<ISubscriptionDocument>> {
    try {
      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found',
          timestamp: new Date()
        };
      }

      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'Subscription retrieved successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  public static async updateSubscription(subscriptionId: string, userId: string, updateData: Partial<ISubscriptionDocument>): Promise<ApiResponse<ISubscriptionDocument>> {
    try {
      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found',
          timestamp: new Date()
        };
      }

      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Update subscription data
      Object.assign(subscription, updateData);
      await subscription.save();

      SubscriptionService.logger.info('Subscription updated successfully', {
        subscriptionId: subscription._id,
        userId,
        tier: subscription.tier
      });

      return {
        success: true,
        message: 'Subscription updated successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  public static async renewSubscription(subscriptionId: string, userId: string, duration: number): Promise<ApiResponse<ISubscriptionDocument>> {
    try {
      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found',
          timestamp: new Date()
        };
      }

      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Renew subscription
      await subscription.renew(duration);

      // Update user's subscription expiry
      const user = await UserModel.findById(userId);
      if (user) {
        user.subscriptionExpiresAt = subscription.endDate;
        await user.save();
      }

      SubscriptionService.logger.info('Subscription renewed successfully', {
        subscriptionId: subscription._id,
        userId,
        newEndDate: subscription.endDate,
        duration
      });

      return {
        success: true,
        message: 'Subscription renewed successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error renewing subscription:', error);
      throw error;
    }
  }

  public static async cancelSubscription(subscriptionId: string, userId: string): Promise<ApiResponse<ISubscriptionDocument>> {
    try {
      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found',
          timestamp: new Date()
        };
      }

      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Cancel subscription
      await subscription.cancel();

      // Update user's subscription info
      const user = await UserModel.findById(userId);
      if (user) {
        user.subscription = SubscriptionTier.FREE;
        user.subscriptionExpiresAt = new Date();
        await user.save();
      }

      SubscriptionService.logger.info('Subscription cancelled successfully', {
        subscriptionId: subscription._id,
        userId,
        tier: subscription.tier
      });

      return {
        success: true,
        message: 'Subscription cancelled successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  public static async suspendSubscription(subscriptionId: string, userId: string): Promise<ApiResponse<ISubscriptionDocument>> {
    try {
      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found',
          timestamp: new Date()
        };
      }

      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Suspend subscription
      await subscription.suspend();

      SubscriptionService.logger.info('Subscription suspended successfully', {
        subscriptionId: subscription._id,
        userId,
        tier: subscription.tier
      });

      return {
        success: true,
        message: 'Subscription suspended successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error suspending subscription:', error);
      throw error;
    }
  }

  public static async activateSubscription(subscriptionId: string, userId: string): Promise<ApiResponse<ISubscriptionDocument>> {
    try {
      const subscription = await SubscriptionModel.findById(subscriptionId);
      if (!subscription) {
        return {
          success: false,
          message: 'Subscription not found',
          timestamp: new Date()
        };
      }

      // Check if subscription belongs to user
      if (subscription.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Activate subscription
      await subscription.activate();

      SubscriptionService.logger.info('Subscription activated successfully', {
        subscriptionId: subscription._id,
        userId,
        tier: subscription.tier
      });

      return {
        success: true,
        message: 'Subscription activated successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error activating subscription:', error);
      throw error;
    }
  }

  public static async getSubscriptionsByStatus(status: SubscriptionStatus): Promise<ApiResponse<ISubscriptionDocument[]>> {
    try {
      const subscriptions = await SubscriptionModel.findByStatus(status);
      
      return {
        success: true,
        message: `Subscriptions with status ${status} retrieved successfully`,
        data: subscriptions,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving subscriptions by status:', error);
      throw error;
    }
  }

  public static async getSubscriptionsByTier(tier: SubscriptionTier): Promise<ApiResponse<ISubscriptionDocument[]>> {
    try {
      const subscriptions = await SubscriptionModel.findByTier(tier);
      
      return {
        success: true,
        message: `Subscriptions with tier ${tier} retrieved successfully`,
        data: subscriptions,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving subscriptions by tier:', error);
      throw error;
    }
  }

  public static async getActiveSubscriptions(): Promise<ApiResponse<ISubscriptionDocument[]>> {
    try {
      const subscriptions = await SubscriptionModel.getActiveSubscriptions();
      
      return {
        success: true,
        message: 'Active subscriptions retrieved successfully',
        data: subscriptions,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving active subscriptions:', error);
      throw error;
    }
  }

  public static async getExpiredSubscriptions(): Promise<ApiResponse<ISubscriptionDocument[]>> {
    try {
      const subscriptions = await SubscriptionModel.getExpiredSubscriptions();
      
      return {
        success: true,
        message: 'Expired subscriptions retrieved successfully',
        data: subscriptions,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving expired subscriptions:', error);
      throw error;
    }
  }

  public static async getRevenueStats(startDate: Date, endDate: Date): Promise<ApiResponse<{
    totalRevenue: number;
    subscriptionCount: number;
    averageRevenue: number;
    revenueByTier: Record<SubscriptionTier, number>;
  }>> {
    try {
      const stats = await SubscriptionModel.getRevenueStats(startDate, endDate);
      
      return {
        success: true,
        message: 'Revenue stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving revenue stats:', error);
      throw error;
    }
  }

  public static async checkSubscriptionExpiry(): Promise<void> {
    try {
      const expiredSubscriptions = await SubscriptionModel.getExpiredSubscriptions();
      
      for (const subscription of expiredSubscriptions) {
        if (subscription.status === SubscriptionStatus.ACTIVE) {
          subscription.status = SubscriptionStatus.EXPIRED;
          subscription.isActive = false;
          await subscription.save();

          // Update user's subscription info
          const user = await UserModel.findById(subscription.userId);
          if (user) {
            user.subscription = SubscriptionTier.FREE;
            user.subscriptionExpiresAt = new Date();
            await user.save();
            
            // Deactivate excess bots for FREE plan
            await user.deactivateExcessBots();
          }

          SubscriptionService.logger.info('Subscription expired and updated', {
            subscriptionId: subscription._id,
            userId: subscription.userId,
            tier: subscription.tier
          });
        }
      }

      SubscriptionService.logger.info('Subscription expiry check completed', {
        expiredCount: expiredSubscriptions.length
      });
    } catch (error) {
      SubscriptionService.logger.error('Error checking subscription expiry:', error);
    }
  }

  // New methods for User-based subscription management with billing cycles
  public static async upgradeUserSubscription(userId: string, upgradeData: SubscriptionUpgradeRequest): Promise<ApiResponse<IUserDocument>> {
    try {
      const user = await UserModel.findById(userId) as IUserDocument;
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Update user's subscription and billing cycle
      await user.updateSubscription(upgradeData.subscription, upgradeData.billingCycle);
      
      // Reactivate bots for the new subscription tier
      await user.reactivateBotsForSubscription();

      SubscriptionService.logger.info('User subscription upgraded successfully', {
        userId,
        newSubscription: upgradeData.subscription,
        newBillingCycle: upgradeData.billingCycle,
        expiresAt: user.subscriptionExpiresAt
      });

      return {
        success: true,
        message: 'Subscription upgraded successfully',
        data: user,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error upgrading user subscription:', error);
      throw error;
    }
  }

  public static async changeUserBillingCycle(userId: string, billingData: ChangeBillingCycleRequest): Promise<ApiResponse<IUserDocument>> {
    try {
      const user = await UserModel.findById(userId) as IUserDocument;
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Check if user has a paid subscription
      if (user.subscription === SubscriptionTier.FREE) {
        return {
          success: false,
          message: 'Cannot change billing cycle for FREE subscription',
          timestamp: new Date()
        };
      }

      // Update billing cycle and recalculate expiration
      await user.updateSubscription(user.subscription, billingData.billingCycle);

      SubscriptionService.logger.info('User billing cycle changed successfully', {
        userId,
        subscription: user.subscription,
        newBillingCycle: billingData.billingCycle,
        expiresAt: user.subscriptionExpiresAt
      });

      return {
        success: true,
        message: 'Billing cycle changed successfully',
        data: user,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error changing user billing cycle:', error);
      throw error;
    }
  }

  public static async getUserSubscriptionInfo(userId: string): Promise<ApiResponse<{
    subscription: SubscriptionTier;
    billingCycle: BillingCycle;
    expiresAt: Date;
    isActive: boolean;
    daysRemaining: number;
  }>> {
    try {
      const user = await UserModel.findById(userId) as IUserDocument;
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      const now = new Date();
      const isActive = user.subscriptionExpiresAt > now;
      const daysRemaining = Math.max(0, Math.ceil((user.subscriptionExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const subscriptionInfo = {
        subscription: user.subscription,
        billingCycle: user.billingCycle,
        expiresAt: user.subscriptionExpiresAt,
        isActive,
        daysRemaining
      };

      return {
        success: true,
        message: 'Subscription info retrieved successfully',
        data: subscriptionInfo,
        timestamp: new Date()
      };
    } catch (error) {
      SubscriptionService.logger.error('Error retrieving user subscription info:', error);
      throw error;
    }
  }
}
