import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { Logger } from '../utils/Logger';

export class AuthMiddleware {
  private static logger: Logger = new Logger();

  public static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = AuthMiddleware.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
          timestamp: new Date()
        });
        return;
      }

      const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as { userId: string };
      const user = await UserModel.findById(decoded.userId);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          timestamp: new Date()
        });
        return;
      }

      // Add user to request object
      (req as any).user = {
        id: user._id,
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscription,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        isAdmin: user.isAdmin
      };

      AuthMiddleware.logger.info('User authenticated successfully', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });

      next();
    } catch (error) {
      AuthMiddleware.logger.error('Authentication error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          timestamp: new Date()
        });
      } else if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Token expired',
          timestamp: new Date()
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Authentication failed',
          timestamp: new Date()
        });
      }
    }
  }

  public static requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (!(req as any).user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date()
      });
      return;
    }
    next();
  }

  public static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!(req as any).user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date()
      });
      return;
    }

    if (!(req as any).user.isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date()
      });
      return;
    }

    next();
  }

  public static requireSubscription(req: Request, res: Response, next: NextFunction): void {
    if (!(req as any).user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date()
      });
      return;
    }

    const user = (req as any).user;
    
    if (user.subscriptionTier === 'FREE') {
      res.status(403).json({
        success: false,
        message: 'Active subscription required',
        timestamp: new Date()
      });
      return;
    }

    if (user.subscriptionExpiresAt && new Date() > new Date(user.subscriptionExpiresAt)) {
      res.status(403).json({
        success: false,
        message: 'Subscription expired',
        timestamp: new Date()
      });
      return;
    }

    next();
  }

  public static requireSubscriptionTier(minTier: string, req: Request, res: Response, next: NextFunction): void {
    if (!(req as any).user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date()
      });
      return;
    }

    const user = (req as any).user;
    const tierHierarchy = {
      'FREE': 0,
      'PRO': 1,
      'ENTERPRISE': 2
    };

    const userTierLevel = tierHierarchy[user.subscriptionTier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[minTier as keyof typeof tierHierarchy] || 0;

    if (userTierLevel < requiredTierLevel) {
      res.status(403).json({
        success: false,
        message: `Subscription tier ${minTier} or higher required`,
        timestamp: new Date()
      });
      return;
    }

    if (user.subscriptionExpiresAt && new Date() > new Date(user.subscriptionExpiresAt)) {
      res.status(403).json({
        success: false,
        message: 'Subscription expired',
        timestamp: new Date()
      });
      return;
    }

    next();
  }

  public static requireProOrHigher(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireSubscriptionTier('PRO', req, res, next);
  }

  public static requireEnterprise(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireSubscriptionTier('ENTERPRISE', req, res, next);
  }

  public static optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    try {
      const token = AuthMiddleware.extractToken(req);
      
      if (token) {
        const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as { userId: string };
        UserModel.findById(decoded.userId).then(user => {
          if (user && user.isActive) {
            (req as any).user = {
              id: user._id,
              email: user.email,
              username: user.username,
              subscriptionTier: user.subscription,
              subscriptionExpiresAt: user.subscriptionExpiresAt,
              isAdmin: user.isAdmin
            };
          }
          next();
        }).catch(() => next());
      } else {
        next();
      }
    } catch (error) {
      // If token is invalid, continue without authentication
      next();
    }
  }

  public static rateLimitByUser(req: Request, res: Response, next: NextFunction): void {
    if (!(req as any).user) {
      next();
      return;
    }

    const userId = (req as any).user.id;
    const now = Date.now();
    // More lenient rate limits for development
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    const windowMs = isDevelopment ? 5 * 60 * 1000 : 15 * 60 * 1000; // 5 min dev, 15 min prod
    const maxRequests = isDevelopment ? 1000 : 100; // 1000 dev, 100 prod

    // Initialize rate limit storage if not exists
    if (!(AuthMiddleware as any).rateLimitStore) {
      (AuthMiddleware as any).rateLimitStore = new Map();
    }

    const userLimits = (AuthMiddleware as any).rateLimitStore.get(userId) || {
      count: 0,
      resetTime: now + windowMs
    };

    // Reset counter if window has passed
    if (now > userLimits.resetTime) {
      userLimits.count = 0;
      userLimits.resetTime = now + windowMs;
    }

    // Check if limit exceeded
    if (userLimits.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        timestamp: new Date(),
        retryAfter: Math.ceil((userLimits.resetTime - now) / 1000)
      });
      return;
    }

    // Increment counter
    userLimits.count++;
    (AuthMiddleware as any).rateLimitStore.set(userId, userLimits);

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - userLimits.count).toString(),
      'X-RateLimit-Reset': new Date(userLimits.resetTime).toISOString()
    });

    next();
  }

  public static validateOwnership(resourceType: string, resourceIdField: string = 'id'): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!(req as any).user) {
          res.status(401).json({
            success: false,
            message: 'Authentication required',
            timestamp: new Date()
          });
          return;
        }

        const userId = (req as any).user.id;
        const resourceId = req.params[resourceIdField] || req.body[resourceIdField];

        if (!resourceId) {
          res.status(400).json({
            success: false,
            message: `${resourceType} ID required`,
            timestamp: new Date()
          });
          return;
        }

        // Check ownership based on resource type
        let isOwner: boolean = false;

        switch (resourceType.toLowerCase()) {
          case 'user':
            isOwner = userId === resourceId;
            break;
          case 'bot':
            const BotModel = await import('../models/Bot');
            const bot = await BotModel.default.findById(resourceId);
            isOwner = !!(bot && bot.userId === userId);
            break;
          case 'campaign':
            const CampaignModel = await import('../models/Campaign');
            const campaign = await CampaignModel.default.findById(resourceId);
            isOwner = !!(campaign && campaign.userId === userId);
            break;
          case 'subscription':
            const SubscriptionModel = await import('../models/Subscription');
            const subscription = await SubscriptionModel.default.findById(resourceId);
            isOwner = !!(subscription && subscription.userId === userId);
            break;
          default:
            isOwner = false;
        }

        if (!isOwner) {
          res.status(403).json({
            success: false,
            message: `Access denied to ${resourceType}`,
            timestamp: new Date()
          });
          return;
        }

        next();
      } catch (error) {
        AuthMiddleware.logger.error(`Error validating ${resourceType} ownership:`, error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          timestamp: new Date()
        });
      }
    };
  }

  public static validateSubscriptionLimits(limitType: 'bots' | 'campaigns' | 'emails' | 'aiVariations'): (req: Request, res: Response, next: NextFunction) => void {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!(req as any).user) {
          res.status(401).json({
            success: false,
            message: 'Authentication required',
            timestamp: new Date()
          });
          return;
        }

        const userId = (req as any).user.id;
        const user = await UserModel.findById(userId);

        if (!user) {
          res.status(404).json({
            success: false,
            message: 'User not found',
            timestamp: new Date()
          });
          return;
        }

        // Check subscription limits
        let canProceed = true;
        let message = '';

        switch (limitType) {
          case 'bots':
            const BotModel = await import('../models/Bot');
            const botCount = await BotModel.default.countDocuments({ userId });
            const maxBots = user.getMaxBots();
            canProceed = botCount < maxBots;
            message = `Maximum bot limit (${maxBots}) reached for your subscription tier`;
            break;
          case 'campaigns':
            const CampaignModel = await import('../models/Campaign');
            const campaignCount = await CampaignModel.default.countDocuments({ userId });
            const maxCampaigns = user.getMaxCampaigns();
            canProceed = campaignCount < maxCampaigns;
            message = `Maximum campaign limit (${maxCampaigns}) reached for your subscription tier`;
            break;
          case 'emails':
            const dailyEmailLimit = user.getDailyEmailLimit();
            // Check if user has an active subscription and daily email limit
            canProceed = user.hasActiveSubscription() && dailyEmailLimit > 0;
            message = 'Daily email limit reached for your subscription tier';
            break;
          case 'aiVariations':
            // For now, assume AI variations are available for all subscription tiers
            canProceed = user.hasActiveSubscription();
            message = 'AI message variations not available for your subscription tier';
            break;
        }

        if (!canProceed) {
          res.status(403).json({
            success: false,
            message,
            timestamp: new Date()
          });
          return;
        }

        next();
      } catch (error) {
        AuthMiddleware.logger.error(`Error validating ${limitType} limits:`, error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          timestamp: new Date()
        });
      }
    };
  }

  private static extractToken(req: Request): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check query parameter
    if (req.query['token']) {
      return req.query['token'] as string;
    }

    // Check cookie
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return null;
  }

  public static cleanupRateLimitStore(): void {
    const now = Date.now();
    if ((AuthMiddleware as any).rateLimitStore) {
      for (const [userId, limits] of (AuthMiddleware as any).rateLimitStore.entries()) {
        if (now > limits.resetTime) {
          (AuthMiddleware as any).rateLimitStore.delete(userId);
        }
      }
    }
  }

  /**
   * Clear rate limit store (useful for development/testing)
   */
  public static clearRateLimitStore(): void {
    if ((AuthMiddleware as any).rateLimitStore) {
      (AuthMiddleware as any).rateLimitStore.clear();
      AuthMiddleware.logger.info('Rate limit store cleared');
    }
  }
}
