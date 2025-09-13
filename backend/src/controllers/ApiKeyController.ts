import { Request, Response } from 'express';
import { ActivityType } from '../types';
import UserModel from '../models/User';
import { ActivityService } from '../services/ActivityService';
import { Logger } from '../utils/Logger';

export class ApiKeyController {
  private static logger: Logger = new Logger();

  /**
   * Generate a new API key for the user
   */
  public static async generateApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date()
        });
        return;
      }

      // Generate new API key
      const apiKey = await user.generateApiKey();

      // Log API key generation activity
      await ActivityService.logApiKeyActivity(
        userId,
        ActivityType.API_KEY_GENERATED,
        undefined,
        `API key created at ${new Date().toISOString()}`
      );

      ApiKeyController.logger.info('API key generated', { userId, apiKeyCreatedAt: user.apiKeyCreatedAt });

      res.status(200).json({
        success: true,
        message: 'API key generated successfully',
        data: {
          apiKey: apiKey,
          createdAt: user.apiKeyCreatedAt?.toISOString(),
          lastUsed: user.apiKeyLastUsed?.toISOString()
        },
        timestamp: new Date()
      });
    } catch (error) {
      ApiKeyController.logger.error('Error generating API key:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Get current API key information
   */
  public static async getApiKeyInfo(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date()
        });
        return;
      }

      // Log API key viewed activity
      if (user.apiKey) {
        await ActivityService.logApiKeyActivity(
          userId,
          ActivityType.API_KEY_VIEWED,
          '/api/api-keys/info'
        );
      }

      res.status(200).json({
        success: true,
        message: 'API key information retrieved successfully',
        data: {
          hasApiKey: !!user.apiKey,
          apiKey: user.apiKey, // Return full API key for legitimate use
          createdAt: user.apiKeyCreatedAt?.toISOString(),
          lastUsed: user.apiKeyLastUsed?.toISOString()
        },
        timestamp: new Date()
      });
    } catch (error) {
      ApiKeyController.logger.error('Error getting API key info:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Revoke current API key
   */
  public static async revokeApiKey(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date()
        });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          timestamp: new Date()
        });
        return;
      }

      if (!user.apiKey) {
        res.status(400).json({
          success: false,
          message: 'No API key to revoke',
          timestamp: new Date()
        });
        return;
      }

      await user.revokeApiKey();

      // Log API key revocation activity
      await ActivityService.logApiKeyActivity(
        userId,
        ActivityType.API_KEY_REVOKED,
        undefined,
        `API key revoked at ${new Date().toISOString()}`
      );

      ApiKeyController.logger.info('API key revoked', { userId });

      res.status(200).json({
        success: true,
        message: 'API key revoked successfully',
        timestamp: new Date()
      });
    } catch (error) {
      ApiKeyController.logger.error('Error revoking API key:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }
}
