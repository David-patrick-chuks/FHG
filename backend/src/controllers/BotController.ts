import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { BotService } from '../services/BotService';
import { EmailService } from '../services/EmailService';
import { Logger } from '../utils/Logger';

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
         // Remove sensitive data from response
         const botData = { ...result.data.toObject() };
         delete botData.password;

        res.status(201).json({
          success: true,
          message: 'Bot created successfully',
          data: botData,
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

      BotController.logger.info('Bots retrieval request', {
        userId,
        ip: req.ip
      });

      const result = await BotService.getBotsByUserId(userId);

             if (result.success && result.data) {
         // Remove sensitive data from response
         const botsData = result.data.map(bot => {
           const botData = { ...bot.toObject() };
           delete botData.password;
           return botData;
         });

        res.status(200).json({
          success: true,
          message: 'Bots retrieved successfully',
          data: botsData,
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

  public static async updateBotPrompt(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];
      const { prompt } = req.body;

      if (!prompt) {
        res.status(400).json({
          success: false,
          message: 'Prompt is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate prompt
      if (prompt.trim().length < 10) {
        res.status(400).json({
          success: false,
          message: 'Prompt must be at least 10 characters long',
          timestamp: new Date()
        });
        return;
      }

      if (prompt.trim().length > 1000) {
        res.status(400).json({
          success: false,
          message: 'Prompt must be no more than 1000 characters long',
          timestamp: new Date()
        });
        return;
      }

      BotController.logger.info('Bot prompt update request', {
        userId,
        botId,
        promptLength: prompt.length,
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

       const result = await BotService.updateBotPrompt(botId, userId, prompt);

             if (result.success && result.data) {
         // Remove sensitive data from response
         const botData = { ...result.data.toObject() };
         delete botData.password;

        res.status(200).json({
          success: true,
          message: 'Bot prompt updated successfully',
          data: botData,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      BotController.logger.error('Bot prompt update error:', error);
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

  public static async regenerateBotPrompt(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const botId = req.params['id'];
      const { prompt } = req.body;

      if (!botId) {
        res.status(400).json({
          success: false,
          message: 'Bot ID is required',
          timestamp: new Date()
        });
        return;
      }

      if (!prompt) {
        res.status(400).json({
          success: false,
          message: 'Prompt is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate prompt
      if (prompt.trim().length < 10) {
        res.status(400).json({
          success: false,
          message: 'Prompt must be at least 10 characters long',
          timestamp: new Date()
        });
        return;
      }

      if (prompt.trim().length > 1000) {
        res.status(400).json({
          success: false,
          message: 'Prompt must be no more than 1000 characters long',
          timestamp: new Date()
        });
        return;
      }

      BotController.logger.info('Bot prompt regeneration request', {
        userId,
        botId,
        promptLength: prompt.length,
        ip: req.ip
      });

      // Update the bot's prompt
      const updateResult = await BotService.updateBotPrompt(botId, userId, prompt);

      if (!updateResult.success) {
        res.status(400).json(updateResult);
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Bot prompt regenerated successfully',
        data: {
          botId,
          newPrompt: prompt
        },
        timestamp: new Date()
      });
    } catch (error) {
      BotController.logger.error('Bot prompt regeneration error:', error);
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
}
