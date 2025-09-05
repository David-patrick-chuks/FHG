import BotModel, { IBotDocument } from '../models/Bot';
import CampaignModel from '../models/Campaign';
import SentEmailModel from '../models/SentEmail';
import UserModel from '../models/User';
import { ApiResponse, CampaignStatus, CreateBotRequest } from '../types';
import { Logger } from '../utils/Logger';
import { PaginationParams, PaginationResult, PaginationUtils } from '../utils/PaginationUtils';
import { EmailService } from './EmailService';

export class BotService {
  private static logger: Logger = new Logger();

  public static async createBot(userId: string, botData: CreateBotRequest): Promise<ApiResponse<IBotDocument>> {
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
          message: 'Active subscription required to create bots',
          timestamp: new Date()
        };
      }

      // Check bot limit based on subscription
      const userBots = await BotModel.findByUserId(userId);
      const maxBots = user.getMaxBots();
      
      if (userBots.length >= maxBots) {
        return {
          success: false,
          message: `Maximum bot limit (${maxBots}) reached for your subscription tier`,
          timestamp: new Date()
        };
      }

      // Check if email is already used by another bot
      const existingBot = await BotModel.findOne({ email: botData.email });
      if (existingBot) {
        return {
          success: false,
          message: 'Email address is already used by another bot',
          timestamp: new Date()
        };
      }

      // Verify email credentials before creating bot
      try {
        const verificationResult = await EmailService.verifyBotCredentials(
          botData.email, 
          botData.password
        );
        
        if (!verificationResult.success || !verificationResult.data?.verified) {
          return {
            success: false,
            message: `Email verification failed: ${verificationResult.message}`,
            timestamp: new Date()
          };
        }
      } catch (error) {
        BotService.logger.error('Email verification error during bot creation:', error);
        return {
          success: false,
          message: 'Failed to verify email credentials. Please check your email and password.',
          timestamp: new Date()
        };
      }

      // Create new bot
      const bot = new BotModel({
        ...botData,
        userId,
        dailyEmailCount: 0,
        profileImage: botData.profileImage || `https://robohash.org/${encodeURIComponent(botData.name)}?set=set3&size=200x200`
      });

      await bot.save();

      BotService.logger.info('Bot created successfully', { 
        botId: bot._id, 
        userId, 
        botName: bot.name 
      });
      
      return {
        success: true,
        message: 'Bot created successfully',
        data: bot,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error creating bot:', error);
      throw error;
    }
  }

  public static async getBotsByUserId(userId: string): Promise<ApiResponse<IBotDocument[]>> {
    try {
      const bots = await BotModel.findByUserId(userId);
      
      return {
        success: true,
        message: 'Bots retrieved successfully',
        data: bots,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error retrieving bots:', error);
      throw error;
    }
  }

  public static async getBotsByUserIdWithPagination(
    userId: string, 
    paginationParams: PaginationParams
  ): Promise<ApiResponse<PaginationResult<IBotDocument>>> {
    try {
      // Build query
      const query: any = { userId };
      
      // Add search filter if provided
      if (paginationParams.search) {
        const searchRegex = PaginationUtils.createSearchRegex(paginationParams.search);
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { email: searchRegex }
        ];
      }

      // Build sort object
      const sortBy = paginationParams.sortBy || 'createdAt';
      const sortOrder = paginationParams.sortOrder || 'desc';
      const sort = PaginationUtils.createSortObject(sortBy, sortOrder);

      // Get total count
      const total = await BotModel.countDocuments(query);

      // Get paginated results
      const bots = await BotModel.find(query)
        .sort(sort)
        .skip(paginationParams.offset)
        .limit(paginationParams.limit);

      // Create pagination result
      const paginationResult = PaginationUtils.createPaginationResult(
        bots,
        total,
        paginationParams.page,
        paginationParams.limit
      );
      
      return {
        success: true,
        message: 'Bots retrieved successfully',
        data: paginationResult,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error retrieving bots with pagination:', error);
      throw error;
    }
  }

  public static async getBotById(botId: string, userId: string): Promise<ApiResponse<IBotDocument>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Check if bot belongs to user
      if (bot.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: 'Bot retrieved successfully',
        data: bot,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error retrieving bot:', error);
      throw error;
    }
  }

  public static async updateBot(botId: string, userId: string, updateData: Partial<IBotDocument>): Promise<ApiResponse<IBotDocument>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Check if bot belongs to user
      if (bot.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // If email or password is being updated, verify the new credentials
      if (updateData.email || updateData.password) {
        const emailToVerify = updateData.email || bot.email;
        const passwordToVerify = updateData.password || bot.password;
        
        try {
          const verificationResult = await EmailService.verifyBotCredentials(
            emailToVerify, 
            passwordToVerify
          );
          
          if (!verificationResult.success || !verificationResult.data?.verified) {
            return {
              success: false,
              message: `Email verification failed: ${verificationResult.message}`,
              timestamp: new Date()
            };
          }
        } catch (error) {
          BotService.logger.error('Email verification error during bot update:', error);
          return {
            success: false,
            message: 'Failed to verify email credentials. Please check your email and password.',
            timestamp: new Date()
          };
        }
      }

      // Update bot data
      Object.assign(bot, updateData);
      await bot.save();

      BotService.logger.info('Bot updated successfully', { 
        botId: bot._id, 
        userId, 
        botName: bot.name 
      });
      
      return {
        success: true,
        message: 'Bot updated successfully',
        data: bot,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error updating bot:', error);
      throw error;
    }
  }

  public static async deleteBot(botId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Check if bot belongs to user
      if (bot.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Check if bot has active campaigns
      const activeCampaigns = await CampaignModel.findByBotId(botId);
      const hasActiveCampaigns = activeCampaigns.some(campaign => 
        campaign.status === CampaignStatus.RUNNING || 
        campaign.status === CampaignStatus.PAUSED ||
        campaign.status === CampaignStatus.READY
      );

      if (hasActiveCampaigns) {
        return {
          success: false,
          message: 'Cannot delete bot with active campaigns. Please pause or cancel all campaigns first.',
          timestamp: new Date()
        };
      }

      await BotModel.findByIdAndDelete(botId);

      BotService.logger.info('Bot deleted successfully', { 
        botId: bot._id, 
        userId, 
        botName: bot.name 
      });
      
      return {
        success: true,
        message: 'Bot deleted successfully',
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error deleting bot:', error);
      throw error;
    }
  }

  public static async toggleBotStatus(botId: string, userId: string): Promise<ApiResponse<IBotDocument>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Check if bot belongs to user
      if (bot.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Toggle status
      bot.isActive = !bot.isActive;
      await bot.save();

      BotService.logger.info('Bot status toggled', { 
        botId: bot._id, 
        userId, 
        botName: bot.name, 
        newStatus: bot.isActive 
      });
      
      return {
        success: true,
        message: `Bot ${bot.isActive ? 'activated' : 'deactivated'} successfully`,
        data: bot,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error toggling bot status:', error);
      throw error;
    }
  }

  public static async updateBotPrompt(botId: string, userId: string, prompt: string): Promise<ApiResponse<IBotDocument>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Check if bot belongs to user
      if (bot.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Update prompt
      bot.prompt = prompt;
      await bot.save();

      BotService.logger.info('Bot prompt updated', { 
        botId: bot._id, 
        userId, 
        botName: bot.name 
      });
      
      return {
        success: true,
        message: 'Bot prompt updated successfully',
        data: bot,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error updating bot prompt:', error);
      throw error;
    }
  }

  public static async getBotStats(botId: string, userId: string): Promise<ApiResponse<{
    totalEmailsSent: number;
    dailyEmailCount: number;
    lastEmailSentAt: Date | null;
    isActive: boolean;
    canSendEmail: boolean;
  }>> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return {
          success: false,
          message: 'Bot not found',
          timestamp: new Date()
        };
      }

      // Check if bot belongs to user
      if (bot.userId !== userId) {
        return {
          success: false,
          message: 'Access denied',
          timestamp: new Date()
        };
      }

      // Get total emails sent from SentEmail model
      const totalEmailsSent = await SentEmailModel.countDocuments({ botId });

      const canSendEmail = await bot.canSendEmail();
      
      const stats = {
        totalEmailsSent,
        dailyEmailCount: bot.dailyEmailCount,
        lastEmailSentAt: bot.lastEmailSentAt || null,
        isActive: bot.isActive,
        canSendEmail
      };

      return {
        success: true,
        message: 'Bot stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      BotService.logger.error('Error getting bot stats:', error);
      throw error;
    }
  }

  public static async resetDailyEmailCounts(): Promise<void> {
    try {
      await BotModel.resetAllDailyCounts();
      BotService.logger.info('Daily email counts reset for all bots');
    } catch (error) {
      BotService.logger.error('Error resetting daily email counts:', error);
      throw error;
    }
  }

  public static async canBotSendEmail(botId: string): Promise<boolean> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return false;
      }

      return await bot.canSendEmail();
    } catch (error) {
      BotService.logger.error('Error checking if bot can send email:', error);
      return false;
    }
  }

  public static async incrementBotEmailCount(botId: string): Promise<void> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        throw new Error('Bot not found');
      }

      await bot.incrementDailyEmailCount();
    } catch (error) {
      BotService.logger.error('Error incrementing bot email count:', error);
      throw error;
    }
  }
}
