import SentEmailModel from '../models/SentEmail';
import { EmailStatus, TrackingLog, TrackingLogsResponse, TrackingStats, UserTrackingSummary } from '../types';
import { Logger } from '../utils/Logger';

export class TrackingService {
  private static logger: Logger = new Logger();

  /**
   * Track email delivery event
   */
  public static async trackEmailDelivery(campaignId: string, emailId: string): Promise<{
    success: boolean;
    message: string;
    data?: { recipientEmail: string; wasAlreadyDelivered: boolean };
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
        TrackingService.logger.warn('Sent email not found for delivery tracking', { campaignId, emailId });
        return {
          success: false,
          message: 'Email record not found'
        };
      }

      const wasAlreadyDelivered = sentEmail.status === EmailStatus.DELIVERED || 
                                 sentEmail.status === EmailStatus.OPENED || 
                                 sentEmail.status === EmailStatus.REPLIED;

      // Mark email as delivered if it hasn't been delivered yet
      if (sentEmail.status === EmailStatus.SENT) {
        await sentEmail.markAsDelivered();
        TrackingService.logger.info('Email marked as delivered', {
          campaignId,
          emailId,
          recipientEmail: sentEmail.recipientEmail
        });
      }

      return {
        success: true,
        message: 'Email delivery tracking updated successfully',
        data: {
          recipientEmail: sentEmail.recipientEmail,
          wasAlreadyDelivered
        }
      };
    } catch (error) {
      TrackingService.logger.error('Error tracking email delivery:', error);
      return {
        success: false,
        message: 'Failed to track email delivery'
      };
    }
  }

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

        // Also update the campaign's generated message as read
        try {
          const CampaignModel = await import('../models/Campaign');
          const campaign = await CampaignModel.default.findById(campaignId);
          if (campaign) {
            await campaign.markMessageAsRead(sentEmail.recipientEmail);
            TrackingService.logger.info('Campaign message marked as read', {
              campaignId,
              recipientEmail: sentEmail.recipientEmail
            });
          }
        } catch (error) {
          TrackingService.logger.warn('Failed to update campaign message as read', {
            campaignId,
            recipientEmail: sentEmail.recipientEmail,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
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

      // Import Campaign model dynamically to avoid circular dependencies
      const CampaignModel = await import('../models/Campaign');
      
      // Get all campaigns for the user
      const campaigns = await CampaignModel.default.find({ userId });
      const campaignIds = campaigns.map(campaign => (campaign._id as any).toString());

      if (campaignIds.length === 0) {
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
      }

      // Get aggregated stats for all user's campaigns
      const aggregateStats = await SentEmailModel.aggregate([
        {
          $match: {
            campaignId: { $in: campaignIds }
          }
        },
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            totalOpened: {
              $sum: {
                $cond: [
                  { $in: ['$status', [EmailStatus.OPENED, EmailStatus.REPLIED]] },
                  1,
                  0
                ]
              }
            },
            totalDelivered: {
              $sum: {
                $cond: [
                  { $in: ['$status', [EmailStatus.DELIVERED, EmailStatus.OPENED, EmailStatus.REPLIED]] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const stats = aggregateStats[0] || { totalEmails: 0, totalOpened: 0, totalDelivered: 0 };
      const averageOpenRate = stats.totalDelivered > 0 ? Math.round((stats.totalOpened / stats.totalDelivered) * 100) : 0;

      // Get top performing campaigns (by open rate)
      const campaignStats = await Promise.all(
        campaignIds.map(async (campaignId) => {
          const campaignStats = await SentEmailModel.getDeliveryStats(campaignId);
          const campaign = campaigns.find(c => (c._id as any).toString() === campaignId);
          const openRate = campaignStats.delivered > 0 ? Math.round((campaignStats.opened / campaignStats.delivered) * 100) : 0;
          
          return {
            campaignId,
            campaignName: campaign?.name || 'Unknown Campaign',
            totalEmails: campaignStats.total,
            opened: campaignStats.opened,
            openRate
          };
        })
      );

      // Sort by open rate and take top 5
      const topPerformingCampaigns = campaignStats
        .filter(campaign => campaign.totalEmails > 0)
        .sort((a, b) => b.openRate - a.openRate)
        .slice(0, 5);

      const summary: UserTrackingSummary = {
        totalCampaigns: campaigns.length,
        totalEmails: stats.totalEmails,
        totalOpened: stats.totalOpened,
        averageOpenRate,
        topPerformingCampaigns
      };

      return {
        success: true,
        message: 'User tracking summary retrieved successfully',
        data: summary
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
