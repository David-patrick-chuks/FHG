import { NextFunction, Request, Response } from 'express';
import { ActivityType } from '../types';
import UserModel from '../models/User';
import { ActivityService } from '../services/ActivityService';
import { Logger } from '../utils/Logger';

export class ApiKeyMiddleware {
  private static logger: Logger = new Logger();

  /**
   * Authenticate using API key
   */
  public static async authenticateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const apiKey = ApiKeyMiddleware.extractApiKey(req);
      
      if (!apiKey) {
        res.status(401).json({
          success: false,
          message: 'API key required',
          timestamp: new Date()
        });
        return;
      }

      const user = await UserModel.findByApiKey(apiKey);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid or inactive API key',
          timestamp: new Date()
        });
        return;
      }

      // Check if user has active subscription
      if (!user.hasActiveSubscription()) {
        res.status(403).json({
          success: false,
          message: 'Subscription expired. Please renew your subscription to use the API.',
          timestamp: new Date()
        });
        return;
      }

      // Update last used timestamp
      await user.updateApiKeyLastUsed();

      // Log API key usage activity
      await ActivityService.logApiKeyActivity(
        String(user._id),
        ActivityType.API_KEY_USED,
        req.path,
        `API key used to access ${req.method} ${req.path}`
      );

      // Add user to request object
      (req as any).user = {
        id: String(user._id),
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscription,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        isAdmin: user.isAdmin,
        apiKey: apiKey
      };

      ApiKeyMiddleware.logger.info('API key authenticated successfully', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });

      next();
    } catch (error) {
      ApiKeyMiddleware.logger.error('API key authentication error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Extract API key from request headers
   */
  private static extractApiKey(req: Request): string | null {
    // Check Authorization header (Bearer token format)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = req.headers['x-api-key'] as string;
    if (apiKeyHeader) {
      return apiKeyHeader;
    }

    // Check query parameter (for simple testing)
    const apiKeyQuery = req.query.api_key as string;
    if (apiKeyQuery) {
      return apiKeyQuery;
    }

    return null;
  }

  /**
   * Rate limiting for API key requests
   */
  public static rateLimitByApiKey(req: Request, res: Response, next: NextFunction): void {
    // This will be implemented with the same rate limiting logic as user-based rate limiting
    // but keyed by API key instead of user ID
    const userId = (req as any).user?.id;
    if (userId) {
      // Use existing rate limiting logic
      const AuthMiddleware = require('./AuthMiddleware').AuthMiddleware;
      AuthMiddleware.rateLimitByUser(req, res, next);
    } else {
      next();
    }
  }
}
