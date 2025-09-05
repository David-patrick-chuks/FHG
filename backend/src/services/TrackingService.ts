import SentEmailModel from '../models/SentEmail';
import { EmailStatus, TrackingLog, TrackingLogsResponse, TrackingStats, UserTrackingSummary } from '../types';
import { Logger } from '../utils/Logger';

export class TrackingService {
  private static logger: Logger = new Logger();

  /**
   * Track email open event
   */
  public static async trackEmailOpen(campaignId: string, emailId: string): Promise<{
    success: boolean;
    message: string;
    data?: { recipientEmail: string; wasAlreadyOpened: boolean };
  }> {
    try {
      if (!campaignId || !emailId) {
        return {
          success: false,
          message: 'Campaign ID and Email ID are required'
        };
      }

      // Find the sent email record
      const sentEmail = await SentEmailModel.findOne({
        campaignId,
        _id: emailId
      });

      if (!sentEmail) {
        TrackingService.logger.warn('Sent email not found for tracking', { campaignId, emailId });
        return {
          success: false,
          message: 'Email record not found'
        };
      }

      const wasAlreadyOpened = sentEmail.status === EmailStatus.OPENED || sentEmail.status === EmailStatus.REPLIED;

      // Mark email as opened if it hasn't been opened yet
      if (sentEmail.status === EmailStatus.SENT || sentEmail.status === EmailStatus.DELIVERED) {
        await sentEmail.markAsOpened();
        TrackingService.logger.info('Email marked as opened', {
          campaignId,
          emailId,
          recipientEmail: sentEmail.recipientEmail
        });
      }

      return {
        success: true,
        message: 'Email tracking updated successfully',
        data: {
          recipientEmail: sentEmail.recipientEmail,
          wasAlreadyOpened
        }
      };
    } catch (error) {
      TrackingService.logger.error('Error tracking email open:', error);
      return {
        success: false,
        message: 'Failed to track email open'
      };
    }
  }

  /**
   * Get tracking statistics for a campaign
   */
  public static async getCampaignStats(campaignId: string): Promise<{
    success: boolean;
    message: string;
    data?: TrackingStats;
  }> {
    try {
      if (!campaignId) {
        return {
          success: false,
          message: 'Campaign ID is required'
        };
      }

      const stats = await SentEmailModel.getDeliveryStats(campaignId);
      const openRate = stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100) : 0;

      const trackingStats: TrackingStats = {
        campaignId,
        ...stats,
        openRate
      };

      return {
        success: true,
        message: 'Tracking statistics retrieved successfully',
        data: trackingStats
      };
    } catch (error) {
      TrackingService.logger.error('Error getting tracking stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve tracking statistics'
      };
    }
  }

  /**
   * Get detailed tracking logs for a campaign
   */
  public static async getCampaignLogs(
    campaignId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ): Promise<{
    success: boolean;
    message: string;
    data?: TrackingLogsResponse;
  }> {
    try {
      if (!campaignId) {
        return {
          success: false,
          message: 'Campaign ID is required'
        };
      }

      const { limit = 50, offset = 0, status } = options;

      // Build query
      const query: any = { campaignId };
      if (status) {
        query.status = status;
      }

      // Get tracking logs
      const emails = await SentEmailModel.find(query)
        .sort({ sentAt: -1 })
        .limit(limit)
        .skip(offset);

      const trackingLogs: TrackingLog[] = emails.map(email => ({
        emailId: (email._id as any).toString(),
        recipientEmail: email.recipientEmail,
        status: email.status,
        sentAt: email.sentAt,
        deliveredAt: email.deliveredAt,
        openedAt: email.openedAt,
        repliedAt: email.repliedAt,
        errorMessage: email.errorMessage
      }));

      const response: TrackingLogsResponse = {
        campaignId,
        logs: trackingLogs,
        total: trackingLogs.length,
        limit,
        offset
      };

      return {
        success: true,
        message: 'Tracking logs retrieved successfully',
        data: response
      };
    } catch (error) {
      TrackingService.logger.error('Error getting tracking logs:', error);
      return {
        success: false,
        message: 'Failed to retrieve tracking logs'
      };
    }
  }

  /**
   * Get tracking statistics for multiple campaigns
   */
  public static async getMultipleCampaignStats(campaignIds: string[]): Promise<{
    success: boolean;
    message: string;
    data?: TrackingStats[];
  }> {
    try {
      if (!campaignIds || campaignIds.length === 0) {
        return {
          success: false,
          message: 'Campaign IDs are required'
        };
      }

      const statsPromises = campaignIds.map(campaignId => this.getCampaignStats(campaignId));
      const results = await Promise.all(statsPromises);

      const successfulStats = results
        .filter(result => result.success && result.data)
        .map(result => result.data!);

      return {
        success: true,
        message: 'Multiple campaign statistics retrieved successfully',
        data: successfulStats
      };
    } catch (error) {
      TrackingService.logger.error('Error getting multiple campaign stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve multiple campaign statistics'
      };
    }
  }

  /**
   * Get tracking summary for a user's campaigns
   */
  public static async getUserTrackingSummary(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: UserTrackingSummary;
  }> {
    try {
      if (!userId) {
        return {
          success: false,
          message: 'User ID is required'
        };
      }

      // This would need to be implemented based on your campaign model
      // For now, returning a placeholder structure
      return {
        success: true,
        message: 'User tracking summary retrieved successfully',
        data: {
          totalCampaigns: 0,
          totalEmails: 0,
          totalOpened: 0,
          averageOpenRate: 0,
          topPerformingCampaigns: []
        }
      };
    } catch (error) {
      TrackingService.logger.error('Error getting user tracking summary:', error);
      return {
        success: false,
        message: 'Failed to retrieve user tracking summary'
      };
    }
  }
}

export default TrackingService;
