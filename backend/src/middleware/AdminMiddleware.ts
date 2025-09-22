import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';
import { SystemActivityService } from '../services/SystemActivityService';
import { ActivityType } from '../types';

export class AdminMiddleware {
  private static logger: Logger = new Logger();

  /**
   * Middleware to require admin privileges
   */
  public static requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          timestamp: new Date()
        });
        return;
      }

      if (!user.isAdmin) {
        AdminMiddleware.logger.warn('Non-admin user attempted admin action', {
          userId: user.id,
          email: user.email,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        // Log unauthorized admin access attempts
        AdminMiddleware.logSystemActivity(
          ActivityType.SECURITY_LOGIN_FAILED,
          'Unauthorized Admin Access Attempt',
          `Non-admin user attempted to access admin endpoint: ${req.originalUrl}`,
          'high',
          'security',
          {
            userId: user.id,
            email: user.email,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            method: req.method
          }
        );

        res.status(403).json({
          success: false,
          message: 'Admin privileges required',
          timestamp: new Date()
        });
        return;
      }

      AdminMiddleware.logger.info('Admin action authorized', {
        adminUserId: user.id,
        adminEmail: user.email,
        action: req.method + ' ' + req.path,
        ip: req.ip
      });

      next();
    } catch (error) {
      AdminMiddleware.logger.error('Error in admin middleware:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  };

  /**
   * Middleware to check if user is admin (doesn't block, just adds flag)
   */
  public static checkAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;
      
      if (user && user.isAdmin) {
        (req as any).isAdmin = true;
      } else {
        (req as any).isAdmin = false;
      }

      next();
    } catch (error) {
      AdminMiddleware.logger.error('Error in admin check middleware:', error);
      (req as any).isAdmin = false;
      next();
    }
  };

  /**
   * Helper method to log system activities
   */
  private static async logSystemActivity(
    type: ActivityType,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    source: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await SystemActivityService.logSystemEvent(
        type,
        title,
        description,
        severity,
        source,
        metadata
      );
    } catch (logError) {
      // Don't let logging errors break admin middleware
      AdminMiddleware.logger.error('Failed to log system activity:', logError);
    }
  }
}
