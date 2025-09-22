import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { AdminService } from '../services/AdminService';
import { Logger } from '../utils/Logger';

export class AdminController {
  private static logger: Logger = new Logger();

  public static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.id;

      AdminController.logger.info('Admin users retrieval request', {
        adminId,
        ip: req.ip
      });

      const result = await AdminService.getAllUsers();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Users retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin users retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const userId = req.params['id'];
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Admin user retrieval request', {
        adminId,
        userId,
        ip: req.ip
      });

      const result = await AdminService.getUserById(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'User retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin user retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async updateUserSubscription(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const userId = req.params['id'];
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date()
        });
        return;
      }
      const { tier, duration, amount, paymentMethod } = req.body;

      // Validate required fields
      if (!tier || !duration || !amount || !paymentMethod) {
        res.status(400).json({
          success: false,
          message: 'Tier, duration, amount, and payment method are required',
          timestamp: new Date()
        });
        return;
      }

      // Validate tier (case-insensitive)
      const validTiers = ['FREE', 'PRO', 'ENTERPRISE'];
      const normalizedTier = tier.toUpperCase();
      if (!validTiers.includes(normalizedTier)) {
        res.status(400).json({
          success: false,
          message: 'Valid subscription tier is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate duration
      if (duration < 1 || duration > 12) {
        res.status(400).json({
          success: false,
          message: 'Duration must be between 1 and 12 months',
          timestamp: new Date()
        });
        return;
      }

      // Validate amount
      if (amount < 0) {
        res.status(400).json({
          success: false,
          message: 'Valid amount is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate payment method
      const validPaymentMethods = ['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        res.status(400).json({
          success: false,
          message: 'Valid payment method is required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Admin subscription update request', {
        adminId,
        userId,
        tier,
        duration,
        amount,
        paymentMethod,
        ip: req.ip
      });

      const result = await AdminService.updateUserSubscription(
        userId,
        adminId,
        normalizedTier,
        duration,
        amount,
        paymentMethod,
        req.ip || '',
        req.get('User-Agent') || ''
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'User subscription updated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin subscription update error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async suspendUser(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const userId = req.params['id'];
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date()
        });
        return;
      }
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Reason is required for suspension',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Admin user suspension request', {
        adminId,
        userId,
        reason,
        ip: req.ip
      });

      const result = await AdminService.suspendUser(
        userId,
        adminId,
        reason,
        req.ip || '',
        req.get('User-Agent') || ''
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'User suspended successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin user suspension error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const userId = req.params['id'];
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Admin user activation request', {
        adminId,
        userId,
        ip: req.ip
      });

      const result = await AdminService.activateUser(
        userId,
        adminId,
        req.ip || '',
        req.get('User-Agent') || ''
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'User activated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin user activation error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const userId = req.params['id'];
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Admin user deletion request', {
        adminId,
        userId,
        ip: req.ip
      });

      const result = await AdminService.deleteUser(
        userId,
        adminId,
        req.ip || '',
        req.get('User-Agent') || ''
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'User deleted successfully',
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin user deletion error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getPlatformStats(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.id;

      AdminController.logger.info('Admin platform stats request', {
        adminId,
        ip: req.ip
      });

      const result = await AdminService.getPlatformStats();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Platform stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin platform stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getAdminActions(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.id;
      const { targetAdminId, targetType, days } = req.query;

      AdminController.logger.info('Admin actions retrieval request', {
        adminId,
        targetAdminId: targetAdminId as string,
        targetType: targetType as string,
        days: days as string,
        ip: req.ip
      });

      const result = await AdminService.getAdminActions(
        targetAdminId as string,
        targetType as string,
        parseInt(days as string) || 7
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Admin actions retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin actions retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getGeneralAdminActivityStats(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const days = parseInt(req.query['days'] as string) || 7;

      // Validate days parameter
      if (days < 1 || days > 365) {
        res.status(400).json({
          success: false,
          message: 'Days parameter must be between 1 and 365',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('General admin activity stats request', {
        adminId,
        days,
        ip: req.ip
      });

      const result = await AdminService.getGeneralAdminActivityStats(days);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'General admin activity stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('General admin activity stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getAdminActivityStats(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const targetAdminId = req.params['id'];
      if (!targetAdminId) {
        res.status(400).json({
          success: false,
          message: 'Admin ID is required',
          timestamp: new Date()
        });
        return;
      }
      const days = parseInt(req.query['days'] as string) || 7;

      // Validate days parameter
      if (days < 1 || days > 365) {
        res.status(400).json({
          success: false,
          message: 'Days parameter must be between 1 and 365',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Admin activity stats request', {
        adminId,
        targetAdminId,
        days,
        ip: req.ip
      });

      const result = await AdminService.getAdminActivityStats(targetAdminId, days);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Admin activity stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin activity stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getSystemActivityStats(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const days = parseInt(req.query['days'] as string) || 7;

      // Validate days parameter
      if (days < 1 || days > 365) {
        res.status(400).json({
          success: false,
          message: 'Days parameter must be between 1 and 365',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('System activity stats request', {
        adminId,
        days,
        ip: req.ip
      });

      const result = await AdminService.getSystemActivityStats(days);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'System activity stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('System activity stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getSubscriptionStats(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.id;

      AdminController.logger.info('Admin subscription stats request', {
        adminId,
        ip: req.ip
      });

      const result = await AdminService.getSubscriptionStats();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Subscription stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin subscription stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async cleanupOldData(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user.id;
      const days = parseInt(req.query['days'] as string) || 90;

      // Validate days parameter
      if (days < 30 || days > 365) {
        res.status(400).json({
          success: false,
          message: 'Days parameter must be between 30 and 365',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Admin data cleanup request', {
        adminId,
        days,
        ip: req.ip
      });

      const result = await AdminService.cleanupOldData(days);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Data cleanup completed successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Admin data cleanup error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }


}
