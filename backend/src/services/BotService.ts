import { Logger } from '../utils/Logger';
import BotModel, { IBotDocument } from '../models/Bot';
import UserModel from '../models/User';
import { CreateBotRequest, ApiResponse, SubscriptionTier } from '../types';
import { ErrorHandler } from '../middleware/ErrorHandler';

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

      // Create new bot
      const bot = new BotModel({
        ...botData,
        userId,
        dailyEmailCount: 0
      });

      await bot.save();

      this.logger.info('Bot created successfully', { 
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
      this.logger.error('Error creating bot:', error);
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
      this.logger.error('Error retrieving bots:', error);
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
      this.logger.error('Error retrieving bot:', error);
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

      // Update bot data
      Object.assign(bot, updateData);
      await bot.save();

      this.logger.info('Bot updated successfully', { 
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
      this.logger.error('Error updating bot:', error);
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
      // TODO: Check campaign status before deletion

      await BotModel.findByIdAndDelete(botId);

      this.logger.info('Bot deleted successfully', { 
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
      this.logger.error('Error deleting bot:', error);
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

      this.logger.info('Bot status toggled', { 
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
      this.logger.error('Error toggling bot status:', error);
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

      this.logger.info('Bot prompt updated', { 
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
      this.logger.error('Error updating bot prompt:', error);
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

      const stats = {
        totalEmailsSent: 0, // TODO: Get from SentEmail model
        dailyEmailCount: bot.dailyEmailCount,
        lastEmailSentAt: bot.lastEmailSentAt,
        isActive: bot.isActive,
        canSendEmail: bot.canSendEmail()
      };

      return {
        success: true,
        message: 'Bot stats retrieved successfully',
        data: stats,
        timestamp: new Date()
      };
    } catch (error) {
      this.logger.error('Error getting bot stats:', error);
      throw error;
    }
  }

  public static async resetDailyEmailCounts(): Promise<void> {
    try {
      await BotModel.resetAllDailyCounts();
      this.logger.info('Daily email counts reset for all bots');
    } catch (error) {
      this.logger.error('Error resetting daily email counts:', error);
      throw error;
    }
  }

  public static async canBotSendEmail(botId: string): Promise<boolean> {
    try {
      const bot = await BotModel.findById(botId);
      if (!bot) {
        return false;
      }

      return bot.canSendEmail();
    } catch (error) {
      this.logger.error('Error checking if bot can send email:', error);
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
      this.logger.error('Error incrementing bot email count:', error);
      throw error;
    }
  }
}
