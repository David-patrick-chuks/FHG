import { Logger } from '../utils/Logger';
import CampaignModel, { ICampaignDocument } from '../models/Campaign';
import BotModel from '../models/Bot';
import UserModel from '../models/User';
import { EmailService } from './EmailService';
import { QueueService } from './QueueService';
import { CreateCampaignRequest, CampaignStatus, ApiResponse } from '../types';

export class CampaignService {
  private static logger: Logger = new Logger();

  public static async createCampaign(userId: string, campaignData: CreateCampaignRequest): Promise<ApiResponse<ICampaignDocument>> {
    try {
      // Check if user exists and has active subscription
      const user = await UserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      if (!user.hasActiveSubscription()) {
        return {
          success: false,
          message: 'Active subscription required to create campaigns',
          timestamp: new Date()
        };
      }

      // Check campaign limit based on subscription
      const userCampaigns = await CampaignModel.findByUserId(userId);
      const maxCampaigns = user.getMaxCampaigns();
      
      if (userCampaigns.length >= maxCampaigns) {
        return {
          success: false,
          message: `Maximum campaign limit (${maxCampaigns}) reached for your subscription tier`,
          timestamp: new Date()
        };
      }

      // Check if bot belongs to user
      const bot = await BotModel.findById(campaignData.botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      if (bot.userId !== userId) {
        return {
          success: false,
          message: 'Bot does not belong to user',
          timestamp: new Date()
        };
      }

      // Generate AI messages
      const aiResult = await EmailService.generateAIMessages(
        campaignData.prompt || bot.prompt,
        user.getMaxAIMessageVariations()
      );

      if (!aiResult.success) {
        return {
          success: false,
          message: 'Failed to generate AI messages',
          timestamp: new Date()
        };
      }

      // Create campaign
      const campaign = new CampaignModel({
        ...campaignData,
        userId,
        aiMessages: aiResult.data,
        status: CampaignStatus.DRAFT
      });

      await campaign.save();

      this.logger.info('Campaign created successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name,
        emailCount: campaign.emailList.length,
        aiMessageCount: campaign.aiMessages.length
      });

      return {
        success: true,
        message: 'Campaign created successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  public static async getCampaignsByUserId(userId: string): Promise<ApiResponse<ICampaignDocument[]>> {
    try {
      const campaigns = await CampaignModel.findByUserId(userId);
      
      return {
        success: true,
        message: 'Campaigns retrieved successfully',
        data: campaigns,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error retrieving campaigns:', error);
      throw error;
    }
  }

  public static async getCampaignById(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'Campaign retrieved successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error retrieving campaign:', error);
      throw error;
    }
  }

  public static async updateCampaign(campaignId: string, userId: string, updateData: Partial<ICampaignDocument>): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be updated
      if (campaign.status === CampaignStatus.RUNNING) {
        return {
          success: false,
          message: 'Cannot update running campaign',
          timestamp: new Date()
        };
      }

      // Update campaign data
      Object.assign(campaign, updateData);
      await campaign.save();

      this.logger.info('Campaign updated successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign updated successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error updating campaign:', error);
      throw error;
    }
  }

  public static async deleteCampaign(campaignId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be deleted
      if (campaign.status === CampaignStatus.RUNNING) {
        return {
          success: false,
          message: 'Cannot delete running campaign',
          timestamp: new Date()
        };
      }

      await CampaignModel.findByIdAndDelete(campaignId);

      this.logger.info('Campaign deleted successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign deleted successfully',
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error deleting campaign:', error);
      throw error;
    }
  }

  public static async startCampaign(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be started
      if (campaign.status !== CampaignStatus.READY) {
        return {
          success: false,
          message: 'Campaign must be in READY status to start',
          timestamp: new Date()
        };
      }

      // Check if bot is active
      const bot = await BotModel.findById(campaign.botId);
      if (!bot || !bot.isActive) {
        return {
          success: false,
          message: 'Bot is not active',
          timestamp: new Date()
        };
      }

      // Start campaign
      await campaign.startCampaign();

      // Add email jobs to queue
      const emailJobs = campaign.emailList.map((email, index) => ({
        email,
        message: campaign.aiMessages[campaign.selectedMessageIndex]
      }));

      await QueueService.addBulkEmailJobs(
        campaignId,
        campaign.botId,
        emailJobs,
        60000 // 1 minute delay between emails
      );

      this.logger.info('Campaign started successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name,
        emailCount: campaign.emailList.length
      });

      return {
        success: true,
        message: 'Campaign started successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error starting campaign:', error);
      throw error;
    }
  }

  public static async pauseCampaign(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be paused
      if (campaign.status !== CampaignStatus.RUNNING) {
        return {
          success: false,
          message: 'Campaign must be RUNNING to pause',
          timestamp: new Date()
        };
      }

      // Pause campaign
      await campaign.pauseCampaign();

      this.logger.info('Campaign paused successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign paused successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error pausing campaign:', error);
      throw error;
    }
  }

  public static async resumeCampaign(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be resumed
      if (campaign.status !== CampaignStatus.PAUSED) {
        return {
          success: false,
          message: 'Campaign must be PAUSED to resume',
          timestamp: new Date()
        };
      }

      // Resume campaign
      await campaign.resumeCampaign();

      this.logger.info('Campaign resumed successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign resumed successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error resuming campaign:', error);
      throw error;
    }
  }

  public static async completeCampaign(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be completed
      if (campaign.status !== CampaignStatus.RUNNING && campaign.status !== CampaignStatus.PAUSED) {
        return {
          success: false,
          message: 'Campaign must be RUNNING or PAUSED to complete',
          timestamp: new Date()
        };
      }

      // Complete campaign
      await campaign.completeCampaign();

      this.logger.info('Campaign completed successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign completed successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error completing campaign:', error);
      throw error;
    }
  }

  public static async cancelCampaign(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be cancelled
      if (campaign.status === CampaignStatus.COMPLETED) {
        return {
          success: false,
          message: 'Cannot cancel completed campaign',
          timestamp: new Date()
        };
      }

      // Cancel campaign
      await campaign.cancelCampaign();

      this.logger.info('Campaign cancelled successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign cancelled successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error cancelling campaign:', error);
      throw error;
    }
  }

  public static async regenerateAIMessages(campaignId: string, userId: string, prompt?: string): Promise<ApiResponse<ICampaignDocument>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if campaign can be updated
      if (campaign.status === CampaignStatus.RUNNING) {
        return {
          success: false,
          message: 'Cannot regenerate messages for running campaign',
          timestamp: new Date()
        };
      }

      // Get bot for prompt
      const bot = await BotModel.findById(campaign.botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Generate new AI messages
      const user = await UserModel.findById(userId);
      const aiResult = await EmailService.generateAIMessages(
        prompt || bot.prompt,
        user?.getMaxAIMessageVariations() || 20
      );

      if (!aiResult.success) {
        return {
          success: false,
          message: 'Failed to generate AI messages',
          timestamp: new Date()
        };
      }

      // Update campaign with new messages
      campaign.aiMessages = aiResult.data;
      campaign.selectedMessageIndex = 0;
      await campaign.save();

      this.logger.info('AI messages regenerated successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name,
        newMessageCount: campaign.aiMessages.length
      });

      return {
        success: true,
        message: 'AI messages regenerated successfully',
        data: campaign,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error regenerating AI messages:', error);
      throw error;
    }
  }

  public static async getCampaignStats(campaignId: string, userId: string): Promise<ApiResponse<{
    progress: { sent: number; total: number; percentage: number };
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
  }>> {
    try {
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        return {
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        };
      }

      // Check if campaign belongs to user
      if (campaign.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      const stats = {
        progress: campaign.getProgress(),
        status: campaign.status,
        startedAt: campaign.startedAt,
        completedAt: campaign.completedAt
      };

      return {
        success: true,
        message: 'Campaign stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error getting campaign stats:', error);
      throw error;
    }
  }
}
