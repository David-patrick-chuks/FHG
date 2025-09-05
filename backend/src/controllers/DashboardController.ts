import { Request, Response } from 'express';
import { BotModel } from '../models/Bot';
import { CampaignModel } from '../models/Campaign';
import { SentEmailModel } from '../models/SentEmail';
import { SubscriptionModel } from '../models/Subscription';
import { ActivityService } from '../services/ActivityService';
import { IUser } from '../types';
import { Logger } from '../utils/Logger';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export class DashboardController {
  private static logger: Logger = new Logger();

  private static formatTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  }

  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }
      
      // Get user's subscription details
      const subscription = await SubscriptionModel.getInstance().findOne({ userId: user._id });
      
      // Get user's bots
      const bots = await BotModel.getInstance().find({ userId: user._id });
      const activeBots = bots.filter(bot => bot.isActive);
      
      // Get user's campaigns
      const campaigns = await CampaignModel.getInstance().find({ userId: user._id });
      const activeCampaigns = campaigns.filter(campaign => campaign.status === 'running');
      
      // Get email statistics for the current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const emailsThisMonth = await SentEmailModel.getInstance().countDocuments({
        userId: user._id,
        sentAt: { $gte: startOfMonth }
      });
      
      // Calculate average open and click rates from user's campaigns
      let totalOpenRate = 0;
      let totalClickRate = 0;
      let totalReplyRate = 0;
      let campaignCount = 0;
      
      // Since campaigns don't have stats property, we'll calculate from sent emails
      campaigns.forEach(campaign => {
        // Count emails for this campaign
        const campaignEmails = campaign.sentEmails || [];
        if (campaignEmails.length > 0) {
          // For now, use placeholder values since we don't have tracking data
          totalOpenRate += 20; // Placeholder 20% open rate
          totalClickRate += 3; // Placeholder 3% click rate
          totalReplyRate += 1; // Placeholder 1% reply rate
          campaignCount++;
        }
      });
      
      const averageOpenRate = campaignCount > 0 ? totalOpenRate / campaignCount : 0;
      const averageClickRate = campaignCount > 0 ? totalClickRate / campaignCount : 0;
      const averageReplyRate = campaignCount > 0 ? totalReplyRate / campaignCount : 0;
      
      const stats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalEmailsSent: emailsThisMonth,
        totalEmailsToday: 0, // Will be calculated separately if needed
        averageOpenRate: Math.round(averageOpenRate * 100) / 100,
        averageClickRate: Math.round(averageClickRate * 100) / 100,
        averageReplyRate: Math.round(averageReplyRate * 100) / 100,
        totalBots: bots.length,
        activeBots: activeBots.length,
        subscription: {
          tier: subscription?.tier || 'FREE',
          status: subscription?.status || 'active',
          expiresAt: subscription?.endDate
        }
      };
      
      res.status(200).json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      DashboardController.logger.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }

  public static async getRecentActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Get query parameters for pagination
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = parseInt(req.query.skip as string) || 0;
      
      // Get recent activities from the ActivityService
      const result = await ActivityService.getUserActivities(
        user._id,
        limit,
        skip
      );

      if (result.success && result.data) {
        // Transform activities to match frontend expectations
        const activities = result.data.map(activity => ({
          id: activity._id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          time: this.formatTimeAgo(activity.timestamp),
          timestamp: activity.timestamp,
          metadata: activity.metadata
        }));

        res.status(200).json({
          success: true,
          data: activities,
          pagination: {
            limit,
            skip,
            total: activities.length
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Failed to fetch recent activity'
        });
      }
      
    } catch (error) {
      DashboardController.logger.error('Error fetching recent activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity'
      });
    }
  }

  public static async getQuickOverview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }
      
      // Get quick counts
      const botCount = await BotModel.getInstance().countDocuments({ userId: user._id });
      const campaignCount = await CampaignModel.getInstance().countDocuments({ userId: user._id });
      const emailCount = await SentEmailModel.getInstance().countDocuments({ userId: user._id });
      
      // Get subscription info
      const subscription = await SubscriptionModel.getInstance().findOne({ userId: user._id });
      
      const overview = {
        botCount,
        campaignCount,
        emailCount,
        subscription: {
          tier: subscription?.tier || 'FREE',
          status: subscription?.status || 'active'
        }
      };
      
      res.status(200).json({
        success: true,
        data: overview
      });
      
    } catch (error) {
      DashboardController.logger.error('Error fetching quick overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quick overview'
      });
    }
  }
}
