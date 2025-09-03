import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { SubscriptionService } from '../services/SubscriptionService';
import { Logger } from '../utils/Logger';

export class SubscriptionController {
  private static logger: Logger = new Logger();

  public static async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      SubscriptionController.logger.info('Subscription creation request', {
        userId,
        tier: req.body.tier,
        duration: req.body.duration,
        amount: req.body.amount,
        ip: req.ip
      });

      const result = await SubscriptionService.createSubscription(userId, req.body);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Subscription created successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Subscription creation error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      SubscriptionController.logger.info('User subscriptions retrieval request', {
        userId,
        ip: req.ip
      });

      const result = await SubscriptionService.getSubscriptionsByUserId(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscriptions retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('User subscriptions retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getActiveSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;

      SubscriptionController.logger.info('Active subscription retrieval request', {
        userId,
        ip: req.ip
      });

      const result = await SubscriptionService.getActiveSubscriptionByUserId(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message,
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Active subscription retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getSubscriptionById(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const subscriptionId = req.params['id'];
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required',
          timestamp: new Date()
        });
        return;
      }

      SubscriptionController.logger.info('Subscription retrieval request', {
        userId,
        subscriptionId,
        ip: req.ip
      });

      const result = await SubscriptionService.getSubscriptionById(subscriptionId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscription retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Subscription retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async updateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const subscriptionId = req.params['id'];
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required',
          timestamp: new Date()
        });
        return;
      }
      const updateData = req.body;

      // Remove fields that shouldn't be updated via this endpoint
      delete updateData.userId;
      delete updateData.startDate;
      delete updateData.endDate;

      SubscriptionController.logger.info('Subscription update request', {
        userId,
        subscriptionId,
        updateFields: Object.keys(updateData),
        ip: req.ip
      });

      const result = await SubscriptionService.updateSubscription(subscriptionId, userId, updateData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscription updated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Subscription update error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async renewSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const subscriptionId = req.params['id'];
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required',
          timestamp: new Date()
        });
        return;
      }
      const { duration } = req.body;

      if (!duration || duration < 1 || duration > 12) {
        res.status(400).json({
          success: false,
          message: 'Duration must be between 1 and 12 months',
          timestamp: new Date()
        });
        return;
      }

      SubscriptionController.logger.info('Subscription renewal request', {
        userId,
        subscriptionId,
        duration,
        ip: req.ip
      });

      const result = await SubscriptionService.renewSubscription(subscriptionId, userId, duration);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscription renewed successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Subscription renewal error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const subscriptionId = req.params['id'];
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required',
          timestamp: new Date()
        });
        return;
      }

      SubscriptionController.logger.info('Subscription cancellation request', {
        userId,
        subscriptionId,
        ip: req.ip
      });

      const result = await SubscriptionService.cancelSubscription(subscriptionId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscription cancelled successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Subscription cancellation error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async suspendSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const subscriptionId = req.params['id'];
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required',
          timestamp: new Date()
        });
        return;
      }

      SubscriptionController.logger.info('Subscription suspension request', {
        userId,
        subscriptionId,
        ip: req.ip
      });

      const result = await SubscriptionService.suspendSubscription(subscriptionId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscription suspended successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Subscription suspension error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async activateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const subscriptionId = req.params['id'];
      if (!subscriptionId) {
        res.status(400).json({
          success: false,
          message: 'Subscription ID is required',
          timestamp: new Date()
        });
        return;
      }

      SubscriptionController.logger.info('Subscription activation request', {
        userId,
        subscriptionId,
        ip: req.ip
      });

      const result = await SubscriptionService.activateSubscription(subscriptionId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscription activated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      SubscriptionController.logger.error('Subscription activation error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }
}
