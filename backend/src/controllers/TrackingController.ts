import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { TrackingService } from '../services/TrackingService';
import { Logger } from '../utils/Logger';

export class TrackingController {
  private static logger: Logger = new Logger();

  /**
   * Handle email open tracking
   */
  public static async trackEmailOpen(req: Request, res: Response): Promise<void> {
    try {
      const { cid, tid } = req.query; // campaignId, transactionId (emailId)

      TrackingController.logger.info('Email open tracking request', {
        campaignId: cid,
        emailId: tid,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const result = await TrackingService.trackEmailOpen(
        cid as string,
        tid as string
      );

      if (result.success) {
        TrackingController.logger.info('Email tracking successful', {
          campaignId: cid,
          emailId: tid,
          wasAlreadyOpened: result.data?.wasAlreadyOpened
        });
      } else {
        TrackingController.logger.warn('Email tracking failed', {
          campaignId: cid,
          emailId: tid,
          error: result.message
        });
      }

      // Always send the tracking pixel regardless of success/failure
      this.sendTrackingPixel(res);
    } catch (error) {
      TrackingController.logger.error('Error in email open tracking:', error);
      this.sendTrackingPixel(res);
    }
  }

  /**
   * Get tracking statistics for a campaign
   */
  public static async getCampaignStats(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;

      TrackingController.logger.info('Campaign tracking stats request', {
        campaignId,
        ip: req.ip
      });

      const result = await TrackingService.getCampaignStats(campaignId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          timestamp: new Date()
        });
      }
    } catch (error) {
      TrackingController.logger.error('Error getting campaign tracking stats:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get detailed tracking logs for a campaign
   */
  public static async getCampaignLogs(req: Request, res: Response): Promise<void> {
    try {
      const { campaignId } = req.params;
      const { limit = 50, offset = 0, status } = req.query;

      TrackingController.logger.info('Campaign tracking logs request', {
        campaignId,
        limit,
        offset,
        status,
        ip: req.ip
      });

      const result = await TrackingService.getCampaignLogs(campaignId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as string
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          timestamp: new Date()
        });
      }
    } catch (error) {
      TrackingController.logger.error('Error getting campaign tracking logs:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get tracking statistics for multiple campaigns
   */
  public static async getMultipleCampaignStats(req: Request, res: Response): Promise<void> {
    try {
      const { campaignIds } = req.body;

      if (!campaignIds || !Array.isArray(campaignIds)) {
        res.status(400).json({
          success: false,
          message: 'Campaign IDs array is required',
          timestamp: new Date()
        });
        return;
      }

      TrackingController.logger.info('Multiple campaign tracking stats request', {
        campaignIds,
        count: campaignIds.length,
        ip: req.ip
      });

      const result = await TrackingService.getMultipleCampaignStats(campaignIds);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          timestamp: new Date()
        });
      }
    } catch (error) {
      TrackingController.logger.error('Error getting multiple campaign tracking stats:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get tracking summary for a user's campaigns
   */
  public static async getUserTrackingSummary(req: Request, res: Response): Promise<void> {
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

      TrackingController.logger.info('User tracking summary request', {
        userId,
        ip: req.ip
      });

      const result = await TrackingService.getUserTrackingSummary(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          timestamp: new Date()
        });
      }
    } catch (error) {
      TrackingController.logger.error('Error getting user tracking summary:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Send a transparent 1x1 GIF pixel for tracking
   */
  private static sendTrackingPixel(res: Response): void {
    // Transparent 1x1 GIF pixel (base64 encoded)
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
      'base64'
    );

    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
  }
}

export default TrackingController;
