import { UserService } from './UserService';
import { Logger } from '../utils/Logger';
import { EmailExtractorActivityService } from './EmailExtractorActivityService';

export interface SubscriptionLimits {
  dailyExtractionLimit: number;
  canUseCsvUpload: boolean;
  planName: string;
  isUnlimited: boolean;
}

export interface UsageStats {
  used: number;
  remaining: number;
  resetTime: Date;
  limit: number;
}

export class SubscriptionLimitsService {
  private static logger = new Logger();

  /**
   * Get subscription limits for a user
   */
  public static async getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
    try {
      const userResult = await UserService.getUserById(userId);
      
      if (!userResult.success || !userResult.data) {
        // Default to free plan if user not found
        return this.getFreePlanLimits();
      }

      const user = userResult.data;
      const subscription = user.subscription;

      // Check if user has an active subscription
      if (!user.hasActiveSubscription()) {
        return this.getFreePlanLimits();
      }

      switch (subscription) {
        case 'free':
          return this.getFreePlanLimits();
        case 'pro':
          return this.getProPlanLimits();
        case 'enterprise':
          return this.getEnterprisePlanLimits();
        default:
          return this.getFreePlanLimits();
      }
    } catch (error) {
      this.logger.error('Error getting subscription limits:', error);
      return this.getFreePlanLimits();
    }
  }

  /**
   * Check if user can perform extraction
   */
  public static async canPerformExtraction(
    userId: string,
    urlCount: number,
    isCsvUpload: boolean = false
  ): Promise<{ canExtract: boolean; reason?: string; limits: SubscriptionLimits; usage: UsageStats }> {
    try {
      const limits = await this.getSubscriptionLimits(userId);
      const usage = await this.getDailyUsage(userId);

      // Check CSV upload permission
      if (isCsvUpload && !limits.canUseCsvUpload) {
        return {
          canExtract: false,
          reason: 'CSV upload is not available in your current plan. Please upgrade to Pro or Enterprise.',
          limits,
          usage
        };
      }

      // Check daily limit
      if (!limits.isUnlimited && usage.used + urlCount > limits.dailyExtractionLimit) {
        return {
          canExtract: false,
          reason: `You have reached your daily limit of ${limits.dailyExtractionLimit} URLs. You have ${usage.remaining} URLs remaining.`,
          limits,
          usage
        };
      }

      return {
        canExtract: true,
        limits,
        usage
      };
    } catch (error) {
      this.logger.error('Error checking extraction permission:', error);
      return {
        canExtract: false,
        reason: 'Error checking extraction limits',
        limits: this.getFreePlanLimits(),
        usage: { used: 0, remaining: 0, resetTime: new Date(), limit: 0 }
      };
    }
  }

  /**
   * Get daily usage statistics for a user
   */
  public static async getDailyUsage(userId: string): Promise<UsageStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Count extraction activities from today
      const { ActivityService } = await import('./ActivityService');
      const { ActivityType } = await import('../models/Activity');
      
      const activitiesResponse = await ActivityService.getUserActivities(
        userId,
        1000, // Get a large number to count all today's activities
        0,
        [
          ActivityType.EMAIL_EXTRACTION_STARTED,
          ActivityType.EMAIL_EXTRACTION_SINGLE_URL,
          ActivityType.EMAIL_EXTRACTION_MULTIPLE_URLS,
          ActivityType.EMAIL_EXTRACTION_CSV_UPLOAD
        ]
      );

      // Check if activities were retrieved successfully
      if (!activitiesResponse.success || !activitiesResponse.data) {
        this.logger.warn('Failed to retrieve activities for usage calculation', { userId });
        return {
          used: 0,
          remaining: 0,
          resetTime: tomorrow,
          limit: 10 // Default to free plan limit
        };
      }

      const activities = activitiesResponse.data;

      // Filter activities from today and count URLs
      const todayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= today && activityDate < tomorrow;
      });

      let totalUrlsUsed = 0;
      todayActivities.forEach(activity => {
        if (activity.metadata?.urlCount) {
          totalUrlsUsed += activity.metadata.urlCount;
        } else if (activity.metadata?.totalUrls) {
          totalUrlsUsed += activity.metadata.totalUrls;
        } else {
          // If no URL count in metadata, assume 1 URL per activity
          totalUrlsUsed += 1;
        }
      });

      const limits = await this.getSubscriptionLimits(userId);
      const remaining = limits.isUnlimited ? Infinity : Math.max(0, limits.dailyExtractionLimit - totalUrlsUsed);
      const resetTime = tomorrow;

      return {
        used: totalUrlsUsed,
        remaining,
        resetTime,
        limit: limits.dailyExtractionLimit
      };
    } catch (error) {
      this.logger.error('Error getting daily usage:', error);
      return {
        used: 0,
        remaining: 0,
        resetTime: new Date(),
        limit: 0
      };
    }
  }

  /**
   * Log extraction usage
   */
  public static async logExtractionUsage(
    userId: string,
    urlCount: number,
    extractionType: 'single' | 'multiple' | 'csv'
  ): Promise<void> {
    try {
      // This will be called by the EmailExtractorActivityService when logging extraction started
      // The actual logging is handled there, this is just for tracking usage
      this.logger.info(`Extraction usage logged: ${urlCount} URLs for user ${userId}, type: ${extractionType}`);
    } catch (error) {
      this.logger.error('Error logging extraction usage:', error);
    }
  }

  /**
   * Check if user needs to upgrade for CSV upload
   */
  public static async needsUpgradeForCsv(userId: string): Promise<boolean> {
    try {
      const limits = await this.getSubscriptionLimits(userId);
      return !limits.canUseCsvUpload;
    } catch (error) {
      this.logger.error('Error checking CSV upgrade requirement:', error);
      return true; // Default to requiring upgrade if error
    }
  }

  /**
   * Get upgrade recommendations based on current usage
   */
  public static async getUpgradeRecommendations(userId: string): Promise<{
    needsUpgrade: boolean;
    reason: string;
    recommendedPlan: string;
    currentPlan: string;
  }> {
    try {
      const limits = await this.getSubscriptionLimits(userId);
      const usage = await this.getDailyUsage(userId);

      // Check if user is close to their limit
      const usagePercentage = (usage.used / limits.dailyExtractionLimit) * 100;
      
      if (limits.planName === 'free' && usagePercentage > 80) {
        return {
          needsUpgrade: true,
          reason: `You've used ${usage.used}/${limits.dailyExtractionLimit} URLs today (${Math.round(usagePercentage)}%). Upgrade to Pro for 50 URLs per day.`,
          recommendedPlan: 'pro',
          currentPlan: limits.planName
        };
      }

      if (limits.planName === 'pro' && usagePercentage > 80) {
        return {
          needsUpgrade: true,
          reason: `You've used ${usage.used}/${limits.dailyExtractionLimit} URLs today (${Math.round(usagePercentage)}%). Upgrade to Enterprise for unlimited extractions.`,
          recommendedPlan: 'enterprise',
          currentPlan: limits.planName
        };
      }

      return {
        needsUpgrade: false,
        reason: '',
        recommendedPlan: '',
        currentPlan: limits.planName
      };
    } catch (error) {
      this.logger.error('Error getting upgrade recommendations:', error);
      return {
        needsUpgrade: false,
        reason: '',
        recommendedPlan: '',
        currentPlan: 'free'
      };
    }
  }

  /**
   * Free plan limits
   */
  private static getFreePlanLimits(): SubscriptionLimits {
    return {
      dailyExtractionLimit: 10,
      canUseCsvUpload: false,
      planName: 'free',
      isUnlimited: false
    };
  }

  /**
   * Pro plan limits
   */
  private static getProPlanLimits(): SubscriptionLimits {
    return {
      dailyExtractionLimit: 50,
      canUseCsvUpload: true,
      planName: 'pro',
      isUnlimited: false
    };
  }

  /**
   * Enterprise plan limits
   */
  private static getEnterprisePlanLimits(): SubscriptionLimits {
    return {
      dailyExtractionLimit: -1, // Unlimited
      canUseCsvUpload: true,
      planName: 'enterprise',
      isUnlimited: true
    };
  }
}
