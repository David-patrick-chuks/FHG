import { NextFunction, Request, Response } from 'express';
import UserModel from '../models/User';
import { Logger } from '../utils/Logger';
import { JwtService } from '../services/JwtService';
import { DatabaseSecurityService } from '../services/DatabaseSecurityService';

export class AuthMiddleware {
  private static logger: Logger = new Logger();

  public static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = JwtService.extractToken(req);
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token required',
          timestamp: new Date()
        });
        return;
      }

      // Verify token using secure JWT service
      const decoded = JwtService.verifyAccessToken(token);
      
      // Verify user still exists and is active using secure query
      const sanitizedUserId = DatabaseSecurityService.sanitizeObjectId(decoded.userId);
      if (!sanitizedUserId) {
        res.status(401).json({
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date()
        });
        return;
      }

      const user = await UserModel.findById(sanitizedUserId);

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
          timestamp: new Date()
        });
        return;
      }

      // Add user to request object with validated data
      (req as any).user = {
        id: String(user._id),
        email: user.email,
        username: user.username,
        subscriptionTier: user.subscription,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        isAdmin: user.isAdmin
      };

      // Only log authentication for important endpoints or first-time access
      const url = req.originalUrl || req.url;
      const importantEndpoints = ['/api/auth/', '/api/payments/', '/api/admin/'];
      
      if (importantEndpoints.some(endpoint => url.startsWith(endpoint))) {
        AuthMiddleware.logger.info('User authenticated', {
          userId: user._id,
          email: user.email
        });
      }

      next();
    } catch (error: any) {
      AuthMiddleware.logger.error('Authentication error:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      
      // Handle specific JWT errors
      if (error.message === 'Invalid token' || error.message === 'Token has been revoked') {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
          timestamp: new Date()
        });
      } else if (error.message === 'Token expired') {
        res.status(401).json({
          success: false,
          message: 'Token expired',
          timestamp: new Date()
        });
      } else if (error.message === 'Token not active') {
        res.status(401).json({
          success: false,
          message: 'Token not active',
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

    const user = (req as any).user;
    
    if (!user.isAdmin) {
      // Log unauthorized admin access attempt
      AuthMiddleware.logger.warn('Unauthorized admin access attempt', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });
      
      res.status(403).json({
        success: false,
        message: 'Admin access required',
        timestamp: new Date()
      });
      return;
    }

    // Log successful admin access
    AuthMiddleware.logger.info('Admin access granted', {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      path: req.path,
      method: req.method
    });

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
      const token = JwtService.extractToken(req);
      
      if (token) {
        try {
          const decoded = JwtService.verifyAccessToken(token);
          const sanitizedUserId = DatabaseSecurityService.sanitizeObjectId(decoded.userId);
          if (!sanitizedUserId) {
            next();
            return;
          }
          
          UserModel.findById(sanitizedUserId).then(user => {
            if (user && user.isActive) {
              (req as any).user = {
                id: String(user._id),
                email: user.email,
                username: user.username,
                subscriptionTier: user.subscription,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
                isAdmin: user.isAdmin
              };
            }
            next();
          }).catch(() => next());
        } catch (jwtError) {
          // Token is invalid, continue without authentication
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      // If token is invalid, continue without authentication
      next();
    }
  }

  /**
   * Logout user by blacklisting their token
   */
  public static logout(req: Request, res: Response, next: NextFunction): void {
    try {
      const token = JwtService.extractToken(req);
      
      if (token) {
        JwtService.blacklistToken(token);
        
        AuthMiddleware.logger.info('User logged out successfully', {
          userId: (req as any).user?.id,
          email: (req as any).user?.email,
          ip: req.ip
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date()
      });
    } catch (error: any) {
      AuthMiddleware.logger.error('Logout error:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack,
        name: error?.name
      });
      
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        timestamp: new Date()
      });
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
