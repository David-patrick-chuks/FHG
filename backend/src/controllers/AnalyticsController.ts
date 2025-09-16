import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { AnalyticsService } from '../services/AnalyticsService';
import { Logger } from '../utils/Logger';

export class AnalyticsController {
  private static logger: Logger = new Logger();

  /**
   * Get comprehensive analytics for authenticated user
   */
  public static async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date()
        });
        return;
      }

      AnalyticsController.logger.info('User analytics request', {
        userId,
        ip: req.ip
      });

      const result = await AnalyticsService.getUserAnalytics(userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(403).json(result);
      }
    } catch (error) {
      AnalyticsController.logger.error('Error getting user analytics:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get analytics summary for dashboard (available to all users)
   */
  public static async getAnalyticsSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date()
        });
        return;
      }

      AnalyticsController.logger.info('Analytics summary request', {
        userId,
        ip: req.ip
      });

      const result = await AnalyticsService.getAnalyticsSummary(userId);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AnalyticsController.logger.error('Error getting analytics summary:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Check analytics access for user
   */
  public static async checkAnalyticsAccess(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User authentication required',
          timestamp: new Date()
        });
        return;
      }

      AnalyticsController.logger.info('Analytics access check request', {
        userId,
        ip: req.ip
      });

      const accessCheck = await AnalyticsService.checkAnalyticsAccess(userId);

      res.status(200).json({
        success: true,
        message: 'Analytics access check completed',
        data: accessCheck,
        timestamp: new Date()
      });
    } catch (error) {
      AnalyticsController.logger.error('Error checking analytics access:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }
}

export default AnalyticsController;
