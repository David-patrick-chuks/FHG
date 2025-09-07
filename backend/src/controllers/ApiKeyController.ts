import { Request, Response } from 'express';
import UserModel from '../models/User';
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

      ApiKeyController.logger.info('API key generated', { userId, apiKeyCreatedAt: user.apiKeyCreatedAt });

      res.status(200).json({
        success: true,
        message: 'API key generated successfully',
        data: {
          apiKey: apiKey,
          createdAt: user.apiKeyCreatedAt,
          lastUsed: user.apiKeyLastUsed
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

      res.status(200).json({
        success: true,
        message: 'API key information retrieved successfully',
        data: {
          hasApiKey: !!user.apiKey,
          apiKey: user.apiKey ? `${user.apiKey.substring(0, 8)}...${user.apiKey.substring(user.apiKey.length - 8)}` : null,
          createdAt: user.apiKeyCreatedAt,
          lastUsed: user.apiKeyLastUsed
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
