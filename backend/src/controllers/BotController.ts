import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { ActivityType } from '../models/Activity';
import BotModel from '../models/Bot';
import { ActivityService } from '../services/ActivityService';
import { BotService } from '../services/BotService';
import { EmailService } from '../services/EmailService';
import { Logger } from '../utils/Logger';
import { PaginationUtils } from '../utils/PaginationUtils';

export class BotController {
  private static logger: Logger = new Logger();

  public static async createBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      BotController.logger.info('Bot creation request', {
        userId,
        botName: req.body.name,
        botEmail: req.body.email,
        ip: req.ip
      });

             const result = await BotService.createBot(userId, req.body);

       if (result.success && result.data) {
         // Remove sensitive data from response and properly serialize MongoDB objects
         const botData = { ...result.data.toObject() };
         delete botData.password;

         // Get daily email limit from user subscription
         const UserModel = await import('../models/User');
         const user = await UserModel.default.findById(botData.userId);
         const dailyEmailLimit = user ? user.getDailyEmailLimit() : 500;

         // Properly serialize MongoDB objects to JSON
         const serializedBotData = {
           _id: botData._id.toString(),
           userId: botData.userId.toString(),
           name: botData.name,
           description: botData.description,
           email: botData.email,
           isActive: botData.isActive,
           dailyEmailCount: botData.dailyEmailCount,
           dailyEmailLimit: dailyEmailLimit,
           emailsSentToday: botData.dailyEmailCount,
           profileImage: botData.profileImage,
           createdAt: botData.createdAt?.toISOString(),
           updatedAt: botData.updatedAt?.toISOString(),
           __v: botData.__v
         };

         // Log bot creation activity
         await ActivityService.logBotActivity(
           userId,
           ActivityType.BOT_CREATED,
           result.data.name,
           (result.data._id as any).toString()
         );

        res.status(201).json({
          success: true,
          message: 'Bot created successfully',
          data: serializedBotData,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot creation error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getBots(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      // Extract pagination parameters
      const paginationParams = PaginationUtils.extractPaginationParams(req);
      
      // Validate pagination parameters
      const validation = PaginationUtils.validatePaginationParams(paginationParams);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.error,
          timestamp: new Date()
        });
        return;
      }

      BotController.logger.info('Bots retrieval request', {
        userId,
        pagination: paginationParams,
        ip: req.ip
      });

      // Check if user wants to include inactive bots
      const includeInactive = req.query.includeInactive === 'true';
      
      const result = await BotService.getBotsByUserIdWithPagination(userId, paginationParams, includeInactive);

      if (result.success && result.data) {
        // Remove sensitive data from response and properly serialize MongoDB objects
        const botsData = await Promise.all(result.data.data.map(async (bot) => {
          const botData = { ...bot.toObject() };
          delete botData.password;
          
          // Get daily email limit from user subscription
          const UserModel = await import('../models/User');
          const user = await UserModel.default.findById(botData.userId);
          const dailyEmailLimit = user ? user.getDailyEmailLimit() : 500;
          
          // Properly serialize MongoDB objects to JSON
          return {
            _id: botData._id.toString(),
            userId: botData.userId.toString(),
            name: botData.name,
            description: botData.description,
            email: botData.email,
            isActive: botData.isActive,
            dailyEmailCount: botData.dailyEmailCount,
            dailyEmailLimit: dailyEmailLimit,
            emailsSentToday: botData.dailyEmailCount,
            profileImage: botData.profileImage,
            createdAt: botData.createdAt?.toISOString(),
            updatedAt: botData.updatedAt?.toISOString(),
            __v: botData.__v
          };
        }));

        res.status(200).json({
          success: true,
          message: 'Bots retrieved successfully',
          data: {
            data: botsData,
            pagination: result.data.pagination
          },
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bots retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];
      if (!botId) {
        res.status(400).json({
          success: false,
          message: 'Bot ID is required',
          timestamp: new Date()
        });
        return;
      }

      BotController.logger.info('Bot retrieval request', {
        userId,
        botId,
        ip: req.ip
      });

             const result = await BotService.getBotById(botId, userId);

       if (result.success && result.data) {
         // Remove sensitive data from response
         const botData = { ...result.data.toObject() };
         delete botData.password;

        res.status(200).json({
          success: true,
          message: 'Bot retrieved successfully',
          data: botData,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async updateBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.userId;
      delete updateData.dailyEmailCount;
      delete updateData.lastEmailSentAt;

      BotController.logger.info('Bot update request', {
        userId,
        botId,
        updateFields: Object.keys(updateData),
        ip: req.ip
      });

             if (!botId) {
         res.status(400).json({
           success: false,
           message: 'Bot ID is required',
           timestamp: new Date()
         });
         return;
       }

       const result = await BotService.updateBot(botId, userId, updateData);

       if (result.success && result.data) {
         // Remove sensitive data from response
         const botData = { ...result.data.toObject() };
         delete botData.password;

        res.status(200).json({
          success: true,
          message: 'Bot updated successfully',
          data: botData,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot update error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async deleteBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];

      BotController.logger.info('Bot deletion request', {
        userId,
        botId,
        ip: req.ip
      });

             if (!botId) {
         res.status(400).json({
           success: false,
           message: 'Bot ID is required',
           timestamp: new Date()
         });
         return;
       }

       const result = await BotService.deleteBot(botId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Bot deleted successfully',
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot deletion error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async toggleBotStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];

      BotController.logger.info('Bot status toggle request', {
        userId,
        botId,
        ip: req.ip
      });

             if (!botId) {
         res.status(400).json({
           success: false,
           message: 'Bot ID is required',
           timestamp: new Date()
         });
         return;
       }

       const result = await BotService.toggleBotStatus(botId, userId);

       if (result.success && result.data) {
         // Remove sensitive data from response
         const botData = { ...result.data.toObject() };
         delete botData.password;

         // Log bot status change activity
         const activityType = result.data.isActive ? ActivityType.BOT_ACTIVATED : ActivityType.BOT_DEACTIVATED;
         await ActivityService.logBotActivity(
           userId,
           activityType,
           result.data.name,
           (result.data._id as any).toString()
         );

        res.status(200).json({
          success: true,
          message: result.message,
          data: botData,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot status toggle error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }


  public static async getBotStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];

      BotController.logger.info('Bot stats request', {
        userId,
        botId,
        ip: req.ip
      });

             if (!botId) {
         res.status(400).json({
           success: false,
           message: 'Bot ID is required',
           timestamp: new Date()
         });
         return;
       }

       if (!botId) {
         res.status(400).json({
           success: false,
           message: 'Bot ID is required',
           timestamp: new Date()
         });
         return;
       }

       const result = await BotService.getBotStats(botId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Bot stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async testBotConnection(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];

      BotController.logger.info('Bot connection test request', {
        userId,
        botId,
        ip: req.ip
      });

             if (!botId) {
         res.status(400).json({
           success: false,
           message: 'Bot ID is required',
           timestamp: new Date()
         });
         return;
       }

       const result = await EmailService.testBotConnection(botId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Bot connection test completed',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot connection test error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getBotEmailStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];
             const days = parseInt(req.query['days'] as string) || 30;

      if (!botId) {
        res.status(400).json({
          success: false,
          message: 'Bot ID is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate days parameter
      if (days < 1 || days > 365) {
        res.status(400).json({
          success: false,
          message: 'Days parameter must be between 1 and 365',
          timestamp: new Date()
        });
        return;
      }

      BotController.logger.info('Bot email stats request', {
        userId,
        botId,
        days,
        ip: req.ip
      });

      const result = await EmailService.getEmailStats(botId, days);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Bot email stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot email stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }


  /**
   * Test bot credentials before creation/update
   */
  public static async testBotCredentials(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
          timestamp: new Date()
        });
        return;
      }

      BotController.logger.info('Bot credentials test request', {
        userId,
        botEmail: email,
        ip: req.ip
      });

      // Check if email is already used by another bot (global uniqueness)
      const existingBot = await BotModel.findOne({ email: email });
      if (existingBot) {
        // Check if the existing bot belongs to the current user
        if (existingBot.userId.toString() === userId.toString()) {
          res.status(400).json({
            success: false,
            message: 'You already have a bot with this email address',
            data: {
              verified: false,
              message: 'You already have a bot with this email address'
            },
            timestamp: new Date()
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Bot email is already used by another account',
            data: {
              verified: false,
              message: 'Bot email is already used by another account'
            },
            timestamp: new Date()
          });
        }
        return;
      }

      const result = await EmailService.verifyBotCredentials(email, password);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Bot credentials test completed',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot credentials test error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async checkActiveCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];

      if (!botId) {
        res.status(400).json({
          success: false,
          message: 'Bot ID is required',
          timestamp: new Date()
        });
        return;
      }

      BotController.logger.info('Check active campaigns request', {
        userId,
        botId,
        ip: req.ip
      });

      const result = await BotService.hasActiveCampaigns(botId, userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Check active campaigns error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }
}
