import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { AdminService } from '../services/AdminService';
import { SystemActivityService } from '../services/SystemActivityService';
import { IncidentService } from '../services/IncidentService';
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

      const result = await SystemActivityService.getSystemActivityStats(days);

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

  /**
   * Get system activities with filtering
   */
  public static async getSystemActivities(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const {
        limit = 50,
        skip = 0,
        days = 7,
        type,
        severity,
        category,
        resolved
      } = req.query;

      // Validate parameters
      const limitNum = parseInt(limit as string);
      const skipNum = parseInt(skip as string);
      const daysNum = parseInt(days as string);

      if (limitNum < 1 || limitNum > 100) {
        res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100',
          timestamp: new Date()
        });
        return;
      }

      if (skipNum < 0) {
        res.status(400).json({
          success: false,
          message: 'Skip must be 0 or greater',
          timestamp: new Date()
        });
        return;
      }

      if (daysNum < 1 || daysNum > 365) {
        res.status(400).json({
          success: false,
          message: 'Days must be between 1 and 365',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('System activities request', {
        adminId,
        limit: limitNum,
        skip: skipNum,
        days: daysNum,
        type,
        severity,
        category,
        resolved,
        ip: req.ip
      });

      const result = await SystemActivityService.getSystemActivities({
        limit: limitNum,
        skip: skipNum,
        days: daysNum,
        type: type as any,
        severity: severity as string,
        category: category as string,
        resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'System activities retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('System activities error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Resolve a system activity
   */
  public static async resolveSystemActivity(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const { activityId } = req.params;

      if (!activityId) {
        res.status(400).json({
          success: false,
          message: 'Activity ID is required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Resolve system activity request', {
        adminId,
        activityId,
        ip: req.ip
      });

      const result = await SystemActivityService.resolveActivity(activityId, adminId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'System activity resolved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Resolve system activity error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get critical system activities
   */
  public static async getCriticalSystemActivities(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const hours = parseInt(req.query['hours'] as string) || 24;

      // Validate hours parameter
      if (hours < 1 || hours > 168) { // Max 1 week
        res.status(400).json({
          success: false,
          message: 'Hours must be between 1 and 168',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Critical system activities request', {
        adminId,
        hours,
        ip: req.ip
      });

      const result = await SystemActivityService.getCriticalActivities(hours);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Critical system activities retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Critical system activities error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get all incidents
   */
  public static async getAllIncidents(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];

      AdminController.logger.info('Get all incidents request', {
        adminId,
        ip: req.ip
      });

      const result = await IncidentService.getAllIncidents();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Incidents retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Get all incidents error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get active incidents
   */
  public static async getActiveIncidents(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];

      AdminController.logger.info('Get active incidents request', {
        adminId,
        ip: req.ip
      });

      const result = await IncidentService.getActiveIncidents();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Active incidents retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Get active incidents error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get incident by ID
   */
  public static async getIncidentById(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const { incidentId } = req.params;

      if (!incidentId) {
        res.status(400).json({
          success: false,
          message: 'Incident ID is required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Get incident by ID request', {
        adminId,
        incidentId,
        ip: req.ip
      });

      const result = await IncidentService.getIncidentById(incidentId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Incident retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Get incident by ID error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Create new incident
   */
  public static async createIncident(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const incidentData = req.body;

      // Validate required fields
      if (!incidentData.title || !incidentData.description || !incidentData.impact) {
        res.status(400).json({
          success: false,
          message: 'Title, description, and impact are required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Create incident request', {
        adminId,
        title: incidentData.title,
        impact: incidentData.impact,
        ip: req.ip
      });

      const result = await IncidentService.createIncident(incidentData);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Incident created successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Create incident error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Update incident
   */
  public static async updateIncident(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const { incidentId } = req.params;
      const updateData = req.body;

      if (!incidentId) {
        res.status(400).json({
          success: false,
          message: 'Incident ID is required',
          timestamp: new Date()
        });
        return;
      }

      if (!updateData.message || !updateData.status) {
        res.status(400).json({
          success: false,
          message: 'Message and status are required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Update incident request', {
        adminId,
        incidentId,
        status: updateData.status,
        ip: req.ip
      });

      const result = await IncidentService.updateIncident(incidentId, {
        ...updateData,
        author: adminId
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Incident updated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Update incident error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Resolve incident
   */
  public static async resolveIncident(req: Request, res: Response): Promise<void> {
    try {
      const adminId = (req as any).user['id'];
      const { incidentId } = req.params;

      if (!incidentId) {
        res.status(400).json({
          success: false,
          message: 'Incident ID is required',
          timestamp: new Date()
        });
        return;
      }

      AdminController.logger.info('Resolve incident request', {
        adminId,
        incidentId,
        ip: req.ip
      });

      const result = await IncidentService.resolveIncident(incidentId, adminId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Incident resolved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      AdminController.logger.error('Resolve incident error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }


}
