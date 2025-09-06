import { ActivityModel, ActivityType, IActivityDocument } from '../models/Activity';
import { ApiResponse } from '../types';
import { Logger } from '../utils/Logger';

export class ActivityService {
  private static logger: Logger = new Logger();

  /**
   * Create a new activity record
   */
  public static async createActivity(
    userId: string,
    type: ActivityType,
    title: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<ApiResponse<IActivityDocument>> {
    try {
      const activity = await ActivityModel.logActivity(
        userId,
        type,
        title,
        description,
        metadata
      );

      ActivityService.logger.info('Activity created', {
        userId,
        type,
        title,
        activityId: activity._id
      });

      return {
        success: true,
        data: activity,
        message: 'Activity created successfully',
        timestamp: new Date()
      };
    } catch (error) {
      ActivityService.logger.error('Error creating activity:', error);
      return {
        success: false,
        message: 'Failed to create activity',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get user's recent activities
   */
  public static async getUserActivities(
    userId: string,
    limit: number = 50,
    skip: number = 0,
    types?: ActivityType[]
  ): Promise<ApiResponse<IActivityDocument[]>> {
    try {
      const activities = await ActivityModel.getUserActivities(
        userId,
        limit,
        skip,
        types
      );

      return {
        success: true,
        data: activities,
        message: 'Activities retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      ActivityService.logger.error('Error fetching user activities:', error);
      return {
        success: false,
        message: 'Failed to fetch activities',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get activity statistics for a user
   */
  public static async getActivityStats(
    userId: string,
    days: number = 30
  ): Promise<ApiResponse<Record<string, number>>> {
    try {
      const stats = await ActivityModel.getActivityStats(userId, days);

      return {
        success: true,
        data: stats,
        message: 'Activity statistics retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      ActivityService.logger.error('Error fetching activity stats:', error);
      return {
        success: false,
        message: 'Failed to fetch activity statistics',
        timestamp: new Date()
      };
    }
  }

  /**
   * Log bot-related activities
   */
  public static async logBotActivity(
    userId: string,
    type: ActivityType,
    botName: string,
    botId: string,
    additionalInfo?: string
  ): Promise<void> {
    const activityMap = {
      [ActivityType.BOT_CREATED]: {
        title: `Bot "${botName}" created`,
        description: `New AI bot "${botName}" has been created and is ready to use.`
      },
      [ActivityType.BOT_UPDATED]: {
        title: `Bot "${botName}" updated`,
        description: `Bot "${botName}" configuration has been updated.`
      },
      [ActivityType.BOT_DELETED]: {
        title: `Bot "${botName}" deleted`,
        description: `Bot "${botName}" has been permanently deleted.`
      },
      [ActivityType.BOT_ACTIVATED]: {
        title: `Bot "${botName}" activated`,
        description: `Bot "${botName}" is now active and ready to send emails.`
      },
      [ActivityType.BOT_DEACTIVATED]: {
        title: `Bot "${botName}" deactivated`,
        description: `Bot "${botName}" has been deactivated and will not send emails.`
      },
      [ActivityType.BOT_CREDENTIALS_TESTED]: {
        title: `Bot "${botName}" credentials tested`,
        description: `Bot "${botName}" email credentials have been successfully tested.`
      }
    };

    const activity = activityMap[type];
    if (activity) {
      await ActivityService.createActivity(
        userId,
        type,
        activity.title,
        additionalInfo ? `${activity.description} ${additionalInfo}` : activity.description,
        { botId, botName }
      );
    }
  }

  /**
   * Log campaign-related activities
   */
  public static async logCampaignActivity(
    userId: string,
    type: ActivityType,
    campaignName: string,
    campaignId: string,
    additionalInfo?: string
  ): Promise<void> {
    const activityMap = {
      [ActivityType.CAMPAIGN_CREATED]: {
        title: `Campaign "${campaignName}" created`,
        description: `New email campaign "${campaignName}" has been created.`
      },
      [ActivityType.CAMPAIGN_UPDATED]: {
        title: `Campaign "${campaignName}" updated`,
        description: `Campaign "${campaignName}" configuration has been updated.`
      },
      [ActivityType.CAMPAIGN_DELETED]: {
        title: `Campaign "${campaignName}" deleted`,
        description: `Campaign "${campaignName}" has been permanently deleted.`
      },
      [ActivityType.CAMPAIGN_STARTED]: {
        title: `Campaign "${campaignName}" started`,
        description: `Campaign "${campaignName}" is now running and sending emails.`
      },
      [ActivityType.CAMPAIGN_PAUSED]: {
        title: `Campaign "${campaignName}" paused`,
        description: `Campaign "${campaignName}" has been paused.`
      },
      [ActivityType.CAMPAIGN_RESUMED]: {
        title: `Campaign "${campaignName}" resumed`,
        description: `Campaign "${campaignName}" has been resumed and is running again.`
      },
      [ActivityType.CAMPAIGN_COMPLETED]: {
        title: `Campaign "${campaignName}" completed`,
        description: `Campaign "${campaignName}" has finished successfully.`
      },
      [ActivityType.CAMPAIGN_CANCELLED]: {
        title: `Campaign "${campaignName}" cancelled`,
        description: `Campaign "${campaignName}" has been cancelled.`
      },
      [ActivityType.CAMPAIGN_FAILED]: {
        title: `Campaign "${campaignName}" failed`,
        description: `Campaign "${campaignName}" encountered an error and stopped.`
      }
    };

    const activity = activityMap[type];
    if (activity) {
      await ActivityService.createActivity(
        userId,
        type,
        activity.title,
        additionalInfo ? `${activity.description} ${additionalInfo}` : activity.description,
        { campaignId, campaignName }
      );
    }
  }

  /**
   * Log email-related activities
   */
  public static async logEmailActivity(
    userId: string,
    type: ActivityType,
    recipientEmail: string,
    campaignId?: string,
    additionalInfo?: string
  ): Promise<void> {
    const activityMap = {
      [ActivityType.EMAIL_SENT]: {
        title: `Email sent to ${recipientEmail}`,
        description: `Email has been sent to ${recipientEmail}.`
      },
      [ActivityType.EMAIL_DELIVERED]: {
        title: `Email delivered to ${recipientEmail}`,
        description: `Email has been successfully delivered to ${recipientEmail}.`
      },
      [ActivityType.EMAIL_OPENED]: {
        title: `Email opened by ${recipientEmail}`,
        description: `Email has been opened by ${recipientEmail}.`
      },
      [ActivityType.EMAIL_CLICKED]: {
        title: `Email clicked by ${recipientEmail}`,
        description: `Link in email has been clicked by ${recipientEmail}.`
      },
      [ActivityType.EMAIL_REPLIED]: {
        title: `Email replied by ${recipientEmail}`,
        description: `Email has been replied to by ${recipientEmail}.`
      },
      [ActivityType.EMAIL_BOUNCED]: {
        title: `Email bounced from ${recipientEmail}`,
        description: `Email to ${recipientEmail} has bounced.`
      }
    };

    const activity = activityMap[type];
    if (activity) {
      await ActivityService.createActivity(
        userId,
        type,
        activity.title,
        additionalInfo ? `${activity.description} ${additionalInfo}` : activity.description,
        { recipientEmail, campaignId }
      );
    }
  }

  /**
   * Log user-related activities
   */
  public static async logUserActivity(
    userId: string,
    type: ActivityType,
    additionalInfo?: string
  ): Promise<void> {
    const activityMap = {
      [ActivityType.USER_REGISTERED]: {
        title: 'Account created',
        description: 'New user account has been created successfully.'
      },
      [ActivityType.USER_LOGIN]: {
        title: 'User logged in',
        description: 'User has successfully logged into their account.'
      },
      [ActivityType.USER_LOGOUT]: {
        title: 'User logged out',
        description: 'User has logged out of their account.'
      },
      [ActivityType.USER_PROFILE_UPDATED]: {
        title: 'Profile updated',
        description: 'User profile information has been updated.'
      },
      [ActivityType.USER_PASSWORD_CHANGED]: {
        title: 'Password changed',
        description: 'User password has been successfully changed.'
      }
    };

    const activity = activityMap[type];
    if (activity) {
      await ActivityService.createActivity(
        userId,
        type,
        activity.title,
        additionalInfo ? `${activity.description} ${additionalInfo}` : activity.description,
        {}
      );
    }
  }

  /**
   * Log subscription-related activities
   */
  public static async logSubscriptionActivity(
    userId: string,
    type: ActivityType,
    subscriptionTier: string,
    additionalInfo?: string
  ): Promise<void> {
    const activityMap = {
      [ActivityType.SUBSCRIPTION_CREATED]: {
        title: `Subscription created - ${subscriptionTier}`,
        description: `New ${subscriptionTier} subscription has been created.`
      },
      [ActivityType.SUBSCRIPTION_UPDATED]: {
        title: `Subscription updated - ${subscriptionTier}`,
        description: `Subscription has been updated to ${subscriptionTier} plan.`
      },
      [ActivityType.SUBSCRIPTION_CANCELLED]: {
        title: `Subscription cancelled - ${subscriptionTier}`,
        description: `${subscriptionTier} subscription has been cancelled.`
      },
      [ActivityType.SUBSCRIPTION_EXPIRED]: {
        title: `Subscription expired - ${subscriptionTier}`,
        description: `${subscriptionTier} subscription has expired.`
      }
    };

    const activity = activityMap[type];
    if (activity) {
      await ActivityService.createActivity(
        userId,
        type,
        activity.title,
        additionalInfo ? `${activity.description} ${additionalInfo}` : activity.description,
        { subscriptionTier }
      );
    }
  }

  /**
   * Get unread activity count for a user
   */
  public static async getUnreadCount(
    userId: string
  ): Promise<ApiResponse<number>> {
    try {
      const count = await ActivityModel.getUnreadCount(userId);

      return {
        success: true,
        data: count,
        message: 'Unread count retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      ActivityService.logger.error('Error fetching unread count:', error);
      return {
        success: false,
        message: 'Failed to fetch unread count',
        timestamp: new Date()
      };
    }
  }

  /**
   * Mark all activities as read for a user
   */
  public static async markAllAsRead(
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      await ActivityModel.markAllAsRead(userId);

      ActivityService.logger.info('All activities marked as read', { userId });

      return {
        success: true,
        message: 'All activities marked as read',
        timestamp: new Date()
      };
    } catch (error) {
      ActivityService.logger.error('Error marking all activities as read:', error);
      return {
        success: false,
        message: 'Failed to mark activities as read',
        timestamp: new Date()
      };
    }
  }

  /**
   * Mark a specific activity as read
   */
  public static async markAsRead(
    activityId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const success = await ActivityModel.markAsRead(activityId, userId);

      return {
        success: true,
        data: success,
        message: success ? 'Activity marked as read' : 'Activity not found',
        timestamp: new Date()
      };
    } catch (error) {
      ActivityService.logger.error('Error marking activity as read:', error);
      return {
        success: false,
        message: 'Failed to mark activity as read',
        timestamp: new Date()
      };
    }
  }
}
