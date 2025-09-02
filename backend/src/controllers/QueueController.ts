import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { QueueService } from '../services/QueueService';
import { Logger } from '../utils/Logger';

export class QueueController {
  private static logger: Logger = new Logger();

  public static async getQueueStatus(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];

      this.logger.info('Queue status request', {
        adminId,
        ip: req.ip
      });

      const result = await QueueService.getQueueStatus();

      res.status(200).json({
        success: true,
        message: 'Queue status retrieved successfully',
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Queue status error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async pauseQueue(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];

      this.logger.info('Queue pause request', {
        adminId,
        ip: req.ip
      });

      await QueueService.pauseQueue();

      res.status(200).json({
        success: true,
        message: 'Queue paused successfully',
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Queue pause error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async resumeQueue(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];

      this.logger.info('Queue resume request', {
        adminId,
        ip: req.ip
      });

      await QueueService.resumeQueue();

      res.status(200).json({
        success: true,
        message: 'Queue resumed successfully',
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Queue resume error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async clearQueue(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];

      this.logger.info('Queue clear request', {
        adminId,
        ip: req.ip
      });

      await QueueService.clearQueue();

      res.status(200).json({
        success: true,
        message: 'Queue cleared successfully',
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Queue clear error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const jobId = req.params['jobId'];
      if (!jobId) {
        res.status(400).json({
          success: false,
          message: 'Job ID is required',
          timestamp: new Date()
        });
        return;
      }

      this.logger.info('Job retrieval request', {
        adminId,
        jobId,
        ip: req.ip
      });

      const result = await QueueService.getJobById(jobId);

      if (result) {
        res.status(200).json({
          success: true,
          message: 'Job retrieved successfully',
          data: result,
          timestamp: new Date()
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Job not found',
          timestamp: new Date()
        });
      }
    } catch (error) {
      this.logger.error('Job retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async removeJob(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const jobId = req.params['jobId'];
      if (!jobId) {
        res.status(400).json({
          success: false,
          message: 'Job ID is required',
          timestamp: new Date()
        });
        return;
      }

      this.logger.info('Job removal request', {
        adminId,
        jobId,
        ip: req.ip
      });

      await QueueService.removeJob(jobId);

      res.status(200).json({
        success: true,
        message: 'Job removed successfully',
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Job removal error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getJobsByCampaign(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.id;
      const campaignId = req.params['campaignId'];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      this.logger.info('Campaign jobs retrieval request', {
        adminId,
        campaignId,
        ip: req.ip
      });

      const result = await QueueService.getJobsByCampaign(campaignId);

      res.status(200).json({
        success: true,
        message: 'Campaign jobs retrieved successfully',
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Campaign jobs retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getJobsByBot(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.id;
      const botId = req.params['botId'];

      if (!botId) {
        res.status(400).json({
          success: false,
          message: 'Bot ID is required',
          timestamp: new Date()
        });
        return;
      }

      this.logger.info('Bot jobs retrieval request', {
        adminId,
        botId,
        ip: req.ip
      });

      const result = await QueueService.getJobsByBot(botId);

      res.status(200).json({
        success: true,
        message: 'Bot jobs retrieved successfully',
        data: result,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Bot jobs retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }
}
