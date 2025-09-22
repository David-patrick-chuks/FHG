import CampaignModel from '../models/Campaign';
import SentEmailModel from '../models/SentEmail';
import UserModel from '../models/User';
import { ApiResponse, SubscriptionTier } from '../types';
import { Logger } from '../utils/Logger';

export interface AnalyticsMetrics {
  totalEmails: number;
  totalOpened: number;
  totalDelivered: number;
  totalFailed: number;
  averageOpenRate: number;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  topPerformingCampaign: {
    campaignId: string;
    campaignName: string;
    openRate: number;
    totalEmails: number;
  } | null;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  status: string;
  totalEmails: number;
  delivered: number;
  opened: number;
  failed: number;
  openRate: number;
  createdAt: string;
  completedAt?: string;
}

export interface EmailTrends {
  date: string;
  emailsSent: number;
  emailsOpened: number;
  openRate: number;
}

export interface UserAnalytics {
  metrics: AnalyticsMetrics;
  campaignPerformance: CampaignPerformance[];
  emailTrends: EmailTrends[];
  subscriptionTier: SubscriptionTier;
  hasAccess: boolean;
}

export class AnalyticsService {
  private static logger: Logger = new Logger();

  /**
   * Check if user has access to analytics based on subscription
   */
  public static async checkAnalyticsAccess(userId: string): Promise<{
    hasAccess: boolean;
    subscriptionTier: SubscriptionTier;
    message?: string;
  }> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          hasAccess: false,
          subscriptionTier: 'free' as SubscriptionTier,
          message: 'User not found'
        };
      }

      // Free users have limited analytics access
      if (user.subscription === 'free') {
        return {
          hasAccess: false,
          subscriptionTier: 'free' as SubscriptionTier,
          message: 'Analytics requires a paid subscription. Upgrade to Basic or Premium to access detailed analytics.'
        };
      }

      // Basic and Premium users have full analytics access
      return {
        hasAccess: true,
        subscriptionTier: user.subscription as SubscriptionTier
      };
    } catch (error) {
      AnalyticsService.logger.error('Error checking analytics access:', error);
      return {
        hasAccess: false,
        subscriptionTier: 'free' as SubscriptionTier,
        message: 'Error checking subscription status'
      };
    }
  }

  /**
   * Get comprehensive analytics for a user
   */
  public static async getUserAnalytics(userId: string): Promise<ApiResponse<UserAnalytics>> {
    try {
      // Check subscription access first
      const accessCheck = await this.checkAnalyticsAccess(userId);
      if (!accessCheck.hasAccess) {
        return {
          success: false,
          message: accessCheck.message || 'Analytics access denied',
          timestamp: new Date()
        };
      }

      // Get user's campaigns
      const campaigns = await CampaignModel.find({ userId }).sort({ createdAt: -1 });
      
      if (campaigns.length === 0) {
        return {
          success: true,
          message: 'No campaigns found',
          data: {
            metrics: this.getEmptyMetrics(),
            campaignPerformance: [],
            emailTrends: [],
            subscriptionTier: accessCheck.subscriptionTier,
            hasAccess: true
          },
          timestamp: new Date()
        };
      }

      // Get campaign IDs
      const campaignIds = campaigns.map(c => (c._id as any).toString());

      // Get comprehensive email statistics
      const emailStats = await SentEmailModel.aggregate([
        { $match: { campaignId: { $in: campaignIds } } },
        {
          $group: {
            _id: null,
            totalEmails: { $sum: 1 },
            totalDelivered: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['DELIVERED', 'OPENED', 'REPLIED']] },
                  1,
                  0
                ]
              }
            },
            totalOpened: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['OPENED', 'REPLIED']] },
                  1,
                  0
                ]
              }
            },
            totalFailed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0]
              }
            }
          }
        }
      ]);

      const stats = emailStats[0] || {
        totalEmails: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalFailed: 0
      };

      // Calculate average open rate
      const averageOpenRate = stats.totalDelivered > 0 
        ? Math.round((stats.totalOpened / stats.totalDelivered) * 100 * 100) / 100
        : 0;

      // Get campaign performance data
      const campaignPerformance = await this.getCampaignPerformance(campaignIds);

      // Get top performing campaign
      const topPerformingCampaign = campaignPerformance.length > 0
        ? campaignPerformance.reduce((top, current) => 
            current.openRate > top.openRate ? current : top
          )
        : null;

      // Get email trends (last 30 days)
      const emailTrends = await this.getEmailTrends(campaignIds);

      // Count campaign statuses
      const activeCampaigns = campaigns.filter(c => 
        ['RUNNING', 'PAUSED'].includes(c.status)
      ).length;
      const completedCampaigns = campaigns.filter(c => 
        c.status === 'COMPLETED' as any
      ).length;

      const metrics: AnalyticsMetrics = {
        totalEmails: stats.totalEmails,
        totalOpened: stats.totalOpened,
        totalDelivered: stats.totalDelivered,
        totalFailed: stats.totalFailed,
        averageOpenRate,
        totalCampaigns: campaigns.length,
        activeCampaigns,
        completedCampaigns,
        topPerformingCampaign: topPerformingCampaign ? {
          campaignId: topPerformingCampaign.campaignId,
          campaignName: topPerformingCampaign.campaignName,
          openRate: topPerformingCampaign.openRate,
          totalEmails: topPerformingCampaign.totalEmails
        } : null
      };

      return {
        success: true,
        message: 'Analytics data retrieved successfully',
        data: {
          metrics,
          campaignPerformance,
          emailTrends,
          subscriptionTier: accessCheck.subscriptionTier,
          hasAccess: true
        },
        timestamp: new Date()
      };
    } catch (error) {
      AnalyticsService.logger.error('Error getting user analytics:', error);
      return {
        success: false,
        message: 'Failed to retrieve analytics data',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get campaign performance data
   */
  private static async getCampaignPerformance(campaignIds: string[]): Promise<CampaignPerformance[]> {
    try {
      const performanceData = await SentEmailModel.aggregate([
        { $match: { campaignId: { $in: campaignIds } } },
        {
          $group: {
            _id: '$campaignId',
            totalEmails: { $sum: 1 },
            delivered: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['DELIVERED', 'OPENED', 'REPLIED']] },
                  1,
                  0
                ]
              }
            },
            opened: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['OPENED', 'REPLIED']] },
                  1,
                  0
                ]
              }
            },
            failed: {
              $sum: {
                $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0]
              }
            }
          }
        }
      ]);

      // Get campaign details
      const campaigns = await CampaignModel.find({ 
        _id: { $in: campaignIds } 
      }).select('_id name status createdAt completedAt');

      return performanceData.map(perf => {
        const campaign = campaigns.find(c => (c._id as any).toString() === perf._id);
        const openRate = perf.delivered > 0 
          ? Math.round((perf.opened / perf.delivered) * 100 * 100) / 100
          : 0;

        return {
          campaignId: perf._id,
          campaignName: campaign?.name || 'Unknown Campaign',
          status: campaign?.status || 'UNKNOWN',
          totalEmails: perf.totalEmails,
          delivered: perf.delivered,
          opened: perf.opened,
          failed: perf.failed,
          openRate,
          createdAt: campaign?.createdAt?.toISOString() || new Date().toISOString(),
          completedAt: campaign?.completedAt?.toISOString()
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      AnalyticsService.logger.error('Error getting campaign performance:', error);
      return [];
    }
  }

  /**
   * Get email trends for the last 30 days
   */
  private static async getEmailTrends(campaignIds: string[]): Promise<EmailTrends[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendsData = await SentEmailModel.aggregate([
        {
          $match: {
            campaignId: { $in: campaignIds },
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            emailsSent: { $sum: 1 },
            emailsOpened: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['OPENED', 'REPLIED']] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      return trendsData.map(trend => {
        const openRate = trend.emailsSent > 0 
          ? Math.round((trend.emailsOpened / trend.emailsSent) * 100 * 100) / 100
          : 0;

        const date = new Date(trend._id.year, trend._id.month - 1, trend._id.day);
        
        return {
          date: date.toISOString().split('T')[0],
          emailsSent: trend.emailsSent,
          emailsOpened: trend.emailsOpened,
          openRate
        };
      });
    } catch (error) {
      AnalyticsService.logger.error('Error getting email trends:', error);
      return [];
    }
  }

  /**
   * Get empty metrics for users with no campaigns
   */
  private static getEmptyMetrics(): AnalyticsMetrics {
    return {
      totalEmails: 0,
      totalOpened: 0,
      totalDelivered: 0,
      totalFailed: 0,
      averageOpenRate: 0,
      totalCampaigns: 0,
      activeCampaigns: 0,
      completedCampaigns: 0,
      topPerformingCampaign: null
    };
  }

  /**
   * Get analytics summary for dashboard (limited data for free users)
   */
  public static async getAnalyticsSummary(userId: string): Promise<ApiResponse<{
    totalEmails: number;
    totalCampaigns: number;
    hasAccess: boolean;
    subscriptionTier: SubscriptionTier;
    upgradeMessage?: string;
  }>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      // Get basic stats for all users
      const campaigns = await CampaignModel.find({ userId });
      const campaignIds = campaigns.map(c => (c._id as any).toString());
      
      const emailCount = await SentEmailModel.countDocuments({
        campaignId: { $in: campaignIds }
      });

      const accessCheck = await this.checkAnalyticsAccess(userId);

      return {
        success: true,
        message: 'Analytics summary retrieved successfully',
        data: {
          totalEmails: emailCount,
          totalCampaigns: campaigns.length,
          hasAccess: accessCheck.hasAccess,
          subscriptionTier: accessCheck.subscriptionTier,
          upgradeMessage: !accessCheck.hasAccess ? accessCheck.message : undefined
        },
        timestamp: new Date()
      };
    } catch (error) {
      AnalyticsService.logger.error('Error getting analytics summary:', error);
      return {
        success: false,
        message: 'Failed to retrieve analytics summary',
        timestamp: new Date()
      };
    }
  }
}
