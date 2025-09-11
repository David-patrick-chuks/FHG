import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

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
}
