import BotModel from '../models/Bot';
import CampaignModel, { ICampaignDocument } from '../models/Campaign';
import UserModel from '../models/User';
import { ApiResponse, CampaignStatus, CreateCampaignRequest } from '../types';
import { Logger } from '../utils/Logger';
import { PaginationParams, PaginationResult, PaginationUtils } from '../utils/PaginationUtils';
import { AIService } from './AIService';
import { QueueService } from './QueueService';

export class CampaignService {
  private static logger: Logger = new Logger();

  /**
   * Helper function to serialize campaign document to JSON
   */
  private static serializeCampaign(campaign: ICampaignDocument): any {
    const campaignObj = campaign.toObject();
    return {
      _id: campaignObj._id.toString(),
      userId: campaignObj.userId.toString(),
      name: campaignObj.name,
      description: campaignObj.description,
      emailList: campaignObj.emailList,
      botId: campaignObj.botId.toString(),
      aiMessages: campaignObj.aiMessages,
      status: campaignObj.status,
      selectedMessageIndex: campaignObj.selectedMessageIndex,
      scheduledFor: campaignObj.scheduledFor?.toISOString(),
      isScheduled: campaignObj.isScheduled,
      emailInterval: campaignObj.emailInterval,
      emailIntervalUnit: campaignObj.emailIntervalUnit,
      startedAt: campaignObj.startedAt?.toISOString(),
      completedAt: campaignObj.completedAt?.toISOString(),
      createdAt: campaignObj.createdAt?.toISOString(),
      updatedAt: campaignObj.updatedAt?.toISOString()
    };
  }

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

      if (bot.userId.toString() !== userId.toString()) {
        return {
          success: false,
          message: 'Bot does not belong to user',
          timestamp: new Date()
        };
      }

      // Generate AI messages
      const aiResult = await AIService.generateEmailMessages(
        'Generate professional email content for this campaign',
        user.getMaxAIMessageVariations()
      );

      if (!aiResult.success) {
        return {
          success: false,
          message: 'Failed to generate AI messages',
          timestamp: new Date()
        };
      }

      // Create campaign with optional scheduling and interval settings
      const campaign = new CampaignModel({
        ...campaignData,
        userId,
        aiMessages: aiResult.data,
        status: CampaignStatus.DRAFT,
        // Handle optional scheduling
        scheduledFor: campaignData.scheduledFor,
        isScheduled: !!campaignData.scheduledFor,
        // Handle optional email intervals
        emailInterval: campaignData.emailInterval || 0,
        emailIntervalUnit: campaignData.emailIntervalUnit || 'minutes'
      });

      await campaign.save();

      CampaignService.logger.info('Campaign created successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name,
        emailCount: campaign.emailList.length,
        aiMessageCount: campaign.aiMessages.length
      });

      return {
        success: true,
        message: 'Campaign created successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error creating campaign:', error);
      throw error;
    }
  }

  public static async getCampaignsByUserId(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const campaigns = await CampaignModel.findByUserId(userId);
      
      // Properly serialize MongoDB documents to JSON
      const serializedCampaigns = campaigns.map(campaign => CampaignService.serializeCampaign(campaign));
      
      return {
        success: true,
        message: 'Campaigns retrieved successfully',
        data: serializedCampaigns,
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error retrieving campaigns:', error);
      throw error;
    }
  }

  public static async getCampaignsByUserIdWithPagination(
    userId: string, 
    paginationParams: PaginationParams
  ): Promise<ApiResponse<PaginationResult<ICampaignDocument>>> {
    try {
      // Build query
      const query: any = { userId };
      
      // Add search filter if provided
      if (paginationParams.search) {
        const searchRegex = PaginationUtils.createSearchRegex(paginationParams.search);
        query.$or = [
          { name: searchRegex },
          { description: searchRegex }
        ];
      }

      // Build sort object
      const sortBy = paginationParams.sortBy || 'createdAt';
      const sortOrder = paginationParams.sortOrder || 'desc';
      const sort = PaginationUtils.createSortObject(sortBy, sortOrder);

      // Get total count
      const total = await CampaignModel.countDocuments(query);

      // Get paginated results
      const campaigns = await CampaignModel.find(query)
        .sort(sort)
        .skip(paginationParams.offset)
        .limit(paginationParams.limit);

      // Serialize campaigns before creating pagination result
      const serializedCampaigns = campaigns.map(campaign => CampaignService.serializeCampaign(campaign));
      
      // Create pagination result
      const paginationResult = PaginationUtils.createPaginationResult(
        serializedCampaigns,
        total,
        paginationParams.page,
        paginationParams.limit
      );
      
      return {
        success: true,
        message: 'Campaigns retrieved successfully',
        data: paginationResult,
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error retrieving campaigns with pagination:', error);
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
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error retrieving campaign:', error);
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

      CampaignService.logger.info('Campaign updated successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign updated successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error updating campaign:', error);
      throw error;
    }
  }

  public static async deleteCampaign(campaignId: string, userId: string): Promise<ApiResponse<{ name: string }>> {
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

      CampaignService.logger.info('Campaign deleted successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        data: { name: campaign.name },
        message: 'Campaign deleted successfully',
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error deleting campaign:', error);
      throw error;
    }
  }

  public static async prepareCampaign(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
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

      // Check if campaign can be prepared
      if (campaign.status !== CampaignStatus.DRAFT) {
        return {
          success: false,
          message: 'Campaign must be in DRAFT status to prepare',
          timestamp: new Date()
        };
      }

      // Validate campaign has required data
      if (campaign.emailList.length === 0) {
        return {
          success: false,
          message: 'Campaign must have at least one email address',
          timestamp: new Date()
        };
      }

      if (campaign.aiMessages.length === 0) {
        return {
          success: false,
          message: 'Campaign must have AI-generated messages',
          timestamp: new Date()
        };
      }

      // Prepare campaign
      await campaign.prepareCampaign();

      CampaignService.logger.info('Campaign prepared successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign prepared successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error preparing campaign:', error);
      throw error;
    }
  }

  public static async scheduleCampaign(campaignId: string, userId: string, scheduledFor: Date): Promise<ApiResponse<ICampaignDocument>> {
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

      // Validate scheduled time
      if (scheduledFor <= new Date()) {
        return {
          success: false,
          message: 'Scheduled time must be in the future',
          timestamp: new Date()
        };
      }

      // Schedule campaign
      await campaign.scheduleCampaign(scheduledFor);

      CampaignService.logger.info('Campaign scheduled successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name,
        scheduledFor
      });

      return {
        success: true,
        message: 'Campaign scheduled successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error scheduling campaign:', error);
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
      const selectedMessage = campaign.aiMessages[campaign.selectedMessageIndex];
      if (!selectedMessage) {
        return {
          success: false,
          message: 'No AI message selected for campaign',
          timestamp: new Date()
        };
      }

      const emailJobs = campaign.emailList.map((email) => ({
        email,
        message: selectedMessage
      }));

      // Use scheduled time if campaign is scheduled, otherwise start immediately
      const startTime = campaign.isScheduled && campaign.scheduledFor ? campaign.scheduledFor : new Date();
      
      // Calculate email interval in milliseconds
      let emailIntervalMs = 0; // Default: send all at once
      if (campaign.emailInterval > 0) {
        switch (campaign.emailIntervalUnit) {
          case 'seconds':
            emailIntervalMs = campaign.emailInterval * 1000;
            break;
          case 'minutes':
            emailIntervalMs = campaign.emailInterval * 60 * 1000;
            break;
          case 'hours':
            emailIntervalMs = campaign.emailInterval * 60 * 60 * 1000;
            break;
        }
      }
      
      await QueueService.addBulkEmailJobs(
        campaignId,
        campaign.botId,
        emailJobs,
        emailIntervalMs,
        startTime
      );

      CampaignService.logger.info('Campaign started successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name,
        emailCount: campaign.emailList.length,
        isScheduled: campaign.isScheduled,
        scheduledFor: campaign.scheduledFor,
        emailInterval: campaign.emailInterval,
        emailIntervalUnit: campaign.emailIntervalUnit,
        emailIntervalMs
      });

      return {
        success: true,
        message: 'Campaign started successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error starting campaign:', error);
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

      CampaignService.logger.info('Campaign paused successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign paused successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error pausing campaign:', error);
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

      CampaignService.logger.info('Campaign resumed successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign resumed successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error resuming campaign:', error);
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

      CampaignService.logger.info('Campaign completed successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign completed successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error completing campaign:', error);
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

      CampaignService.logger.info('Campaign cancelled successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name
      });

      return {
        success: true,
        message: 'Campaign cancelled successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error cancelling campaign:', error);
      throw error;
    }
  }

  public static async regenerateAIMessages(campaignId: string, userId: string): Promise<ApiResponse<ICampaignDocument>> {
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
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          timestamp: new Date()
        };
      }

      const aiResult = await AIService.generateEmailMessages(
        'Generate professional email content for this campaign',
        user.getMaxAIMessageVariations()
      );

      if (!aiResult.success) {
        return {
          success: false,
          message: 'Failed to generate AI messages',
          timestamp: new Date()
        };
      }

      // Update campaign with new messages
      if (!aiResult.data) {
        return {
          success: false,
          message: 'Failed to generate AI messages',
          timestamp: new Date()
        };
      }

      campaign.aiMessages = aiResult.data;
      campaign.selectedMessageIndex = 0;
      await campaign.save();

      CampaignService.logger.info('AI messages regenerated successfully', {
        campaignId: campaign._id,
        userId,
        campaignName: campaign.name,
        newMessageCount: campaign.aiMessages.length
      });

      return {
        success: true,
        message: 'AI messages regenerated successfully',
        data: CampaignService.serializeCampaign(campaign),
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error regenerating AI messages:', error);
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
        startedAt: campaign.startedAt || null,
        completedAt: campaign.completedAt || null
      };

      return {
        success: true,
        message: 'Campaign stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      CampaignService.logger.error('Error getting campaign stats:', error);
      throw error;
    }
  }
}
