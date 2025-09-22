import { ActivityType } from '../../types';
import UserModel from '../../models/User';
import { ApiResponse, SubscriptionTier } from '../../types';
import { ActivityService } from '../ActivityService';
import { PaystackCore } from './PaystackCore';

export class PaystackSubscription extends PaystackCore {
  public static async getCurrentSubscription(userId: string): Promise<ApiResponse<any>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      const subscription = {
        tier: user.subscription || SubscriptionTier.FREE,
        status: 'active',
        expiresAt: user.subscriptionExpiresAt,
        features: PaystackSubscription.getSubscriptionFeatures(user.subscription || SubscriptionTier.FREE)
      };

      return {
        success: true,
        message: 'Subscription retrieved successfully',
        data: subscription,
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackSubscription.logger.error('Error getting current subscription:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        userId
      });

      return {
        success: false,
        message: 'Failed to retrieve subscription',
        timestamp: new Date()
      };
    }
  }

  public static async cancelSubscription(
    userId: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      if (user.subscription === SubscriptionTier.FREE) {
        return {
          success: false,
          message: 'No active subscription to cancel',
          timestamp: new Date()
        };
      }

      // Update user subscription to FREE
      user.subscription = SubscriptionTier.FREE;
      user.subscriptionExpiresAt = new Date(); // Set to current date for FREE tier

      await user.save();

      // Log activity
      await ActivityService.logSubscriptionActivity(
        userId,
        ActivityType.SUBSCRIPTION_CANCELLED,
        user.subscription,
        'Subscription has been cancelled successfully'
      );

      return {
        success: true,
        message: 'Subscription cancelled successfully',
        data: { message: 'Your subscription has been cancelled' },
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackSubscription.logger.error('Error cancelling subscription:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        userId
      });

      return {
        success: false,
        message: 'Failed to cancel subscription',
        timestamp: new Date()
      };
    }
  }

  public static async canUpgrade(
    userId: string
  ): Promise<ApiResponse<{ canUpgrade: boolean; currentTier: string; highestTier: string }>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      const currentTier = user.subscription || SubscriptionTier.FREE;
      const tiers = Object.values(SubscriptionTier);
      const currentIndex = tiers.indexOf(currentTier);
      const highestTier = SubscriptionTier.PREMIUM;

      const canUpgrade = currentTier !== highestTier;

      return {
        success: true,
        message: 'Upgrade eligibility checked',
        data: {
          canUpgrade,
          currentTier,
          highestTier
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      PaystackSubscription.logger.error('Error checking upgrade eligibility:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name,
        userId
      });

      return {
        success: false,
        message: 'Failed to check upgrade eligibility',
        timestamp: new Date()
      };
    }
  }

  public static getSubscriptionFeatures(tier: string): string[] {
    const features = {
      [SubscriptionTier.FREE]: [
        'Up to 5 email campaigns per month',
        'Basic email templates',
        'Standard support',
        'Up to 1,000 contacts'
      ],
      [SubscriptionTier.BASIC]: [
        'Unlimited email campaigns',
        'Premium email templates',
        'Advanced analytics',
        'Priority support',
        'Up to 10,000 contacts',
        'A/B testing',
        'Email automation'
      ],
      [SubscriptionTier.PREMIUM]: [
        'Everything in Basic',
        'Unlimited contacts',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        'Advanced reporting',
        'API access',
        'Custom email templates'
      ]
    };

    return features[tier as keyof typeof features] || features[SubscriptionTier.FREE];
  }
}
