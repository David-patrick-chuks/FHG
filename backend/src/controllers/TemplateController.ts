import { Request, Response } from 'express';
import { ActivityService } from '../services/ActivityService';
import { TemplateService } from '../services/TemplateService';
import { ActivityType } from '../types';
import { Logger } from '../utils/Logger';

export class TemplateController {
  private static logger: Logger = new Logger();

  public static async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      TemplateController.logger.info('Template creation request', {
        userId,
        templateName: req.body.name,
        category: req.body.category,
        variableCount: req.body.variables?.length || 0,
        isPublic: req.body.isPublic,
        ip: req.ip
      });

      const result = await TemplateService.createTemplate(userId, req.body);

      if (result.success && result.data) {
        // Log template creation activity
        await ActivityService.logUserActivity(
          userId,
          ActivityType.TEMPLATE_CREATED,
          `Created template "${result.data.name}" with ${req.body.variables?.length || 0} variables`
        );

        res.status(201).json({
          success: true,
          message: 'Template created successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to create template',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in createTemplate controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getMyTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      const result = await TemplateService.getTemplatesByUserId(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Templates retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve templates',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getMyTemplates controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getCommunityTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { category, search, limit, offset } = req.query;

      const params: any = {};
      if (category) params.category = category;
      if (search) params.search = search as string;
      if (limit) params.limit = parseInt(limit as string);
      if (offset) params.offset = parseInt(offset as string);

      const result = await TemplateService.getPublishedTemplates(params);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Community templates retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve community templates',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getCommunityTemplates controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.['id'];

      const result = await TemplateService.getTemplateById(id, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(result.message === 'Template not found' ? 404 : 403).json({
          success: false,
          message: result.message || 'Failed to retrieve template',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getTemplate controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user['id'];

      TemplateController.logger.info('Template update request', {
        templateId: id,
        userId,
        ip: req.ip
      });

      const result = await TemplateService.updateTemplate(id, userId, req.body);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template updated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to update template',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in updateTemplate controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user['id'];

      TemplateController.logger.info('Template deletion request', {
        templateId: id,
        userId,
        ip: req.ip
      });

      const result = await TemplateService.deleteTemplate(id, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template deleted successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to delete template',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in deleteTemplate controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async approveTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).user['id'];

      TemplateController.logger.info('Template approval request', {
        templateId: id,
        adminUserId,
        approved: req.body.approved,
        ip: req.ip
      });

      const result = await TemplateService.approveTemplate(id, adminUserId, req.body);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template approval processed successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to process template approval',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in approveTemplate controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async reviewTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user['id'];

      // Validate template ID parameter
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Template ID is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate user ID
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate request body
      const { rating, comment } = req.body;
      
      // Check if request body exists
      if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({
          success: false,
          message: 'Request body is required',
          timestamp: new Date()
        });
        return;
      }
      
      if (rating === undefined || rating === null || typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating is required and must be a number between 1 and 5',
          timestamp: new Date()
        });
        return;
      }

      if (comment !== undefined && comment !== null && typeof comment !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Comment must be a string',
          timestamp: new Date()
        });
        return;
      }

      if (comment && comment.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Comment must be no more than 500 characters',
          timestamp: new Date()
        });
        return;
      }

      TemplateController.logger.info('Template review request', {
        templateId: id,
        userId,
        rating: req.body.rating,
        ip: req.ip
      });

      const result = await TemplateService.reviewTemplate(id, userId, req.body);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Review added successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to add review',
          timestamp: new Date()
        });
      }
    } catch (error: any) {
      TemplateController.logger.error('Error in reviewTemplate controller:', {
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        templateId: req.params.id,
        userId: (req as any).user?.id,
        requestBody: req.body
      });
      
      // Provide more specific error messages based on error type
      let message = 'Internal server error';
      if (error?.name === 'ValidationError') {
        message = 'Validation error: ' + error.message;
      } else if (error?.name === 'CastError') {
        message = 'Invalid data format';
      } else if (error?.code === 11000) {
        message = 'Duplicate entry error';
      }
      
      res.status(500).json({
        success: false,
        message,
        timestamp: new Date()
      });
    }
  }

  public static async useTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user['id'];

      TemplateController.logger.info('Template usage request', {
        templateId: id,
        userId,
        ip: req.ip
      });

      const result = await TemplateService.useTemplate(id, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template used successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to use template',
          timestamp: new Date()
        });
      }
    } catch (error: any) {
      TemplateController.logger.error('Error in useTemplate controller:', {
        error: error?.message || 'Unknown error',
        stack: error?.stack,
        templateId: req.params.id,
        userId: (req as any).user?.id,
        requestBody: req.body
      });
      
      // Provide more specific error messages based on error type
      let message = 'Internal server error';
      if (error?.name === 'ValidationError') {
        message = 'Validation error: ' + error.message;
      } else if (error?.name === 'CastError') {
        message = 'Invalid data format';
      } else if (error?.code === 11000) {
        message = 'Template already exists in your collection';
      } else if (error?.message?.includes('Template not found')) {
        message = 'Template not found';
      } else if (error?.message?.includes('not available for use')) {
        message = 'Template is not available for use';
      }
      
      res.status(500).json({
        success: false,
        message,
        timestamp: new Date()
      });
    }
  }

  public static async getPendingApprovals(req: Request, res: Response): Promise<void> {
    try {
      const result = await TemplateService.getPendingApprovals();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Pending approvals retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve pending approvals',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getPendingApprovals controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  // public static async getAllTemplatesForAdmin(req: Request, res: Response): Promise<void> {
  //   try {
  //     const result = await TemplateService.getAllTemplatesForAdmin();

  //     if (result.success) {
  //       res.status(200).json({
  //         success: true,
  //         message: 'All templates retrieved successfully',
  //         data: result.data,
  //         timestamp: new Date()
  //       });
  //     } else {
  //       res.status(400).json({
  //         success: false,
  //         message: result.message || 'Failed to retrieve all templates',
  //         timestamp: new Date()
  //       });
  //     }
  //   } catch (error) {
  //     TemplateController.logger.error('Error in getAllTemplatesForAdmin controller:', error);
  //     res.status(500).json({
  //       success: false,
  //       message: 'Internal server error',
  //       timestamp: new Date()
  //     });
  //   }
  // }

  public static async getPopularTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 10;

      const result = await TemplateService.getPopularTemplates(limitNum);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Popular templates retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve popular templates',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getPopularTemplates controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getTemplateCounts(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      const result = await TemplateService.getTemplateCounts(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template counts retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve template counts',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getTemplateCounts controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getTemplateStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      const result = await TemplateService.getTemplateStats(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve template stats',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getTemplateStats controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getClonedTemplates(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      const result = await TemplateService.getClonedTemplates(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Cloned templates retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve cloned templates',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getClonedTemplates controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getTemplatesWithUpdates(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      const result = await TemplateService.getTemplatesWithUpdates(userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Templates with updates retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve templates with updates',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getTemplatesWithUpdates controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async markTemplateUpdateAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const templateId = req.params.id;

      const result = await TemplateService.markTemplateUpdateAsRead(templateId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Template update marked as read',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to mark template update as read',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in markTemplateUpdateAsRead controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }

  public static async getAllTemplatesForAdmin(req: Request, res: Response): Promise<void> {
    try {
      const result = await TemplateService.getAllTemplatesForAdmin();

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message || 'Templates for admin approval retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Failed to retrieve templates for admin approval',
          timestamp: new Date()
        });
      }
    } catch (error) {
      TemplateController.logger.error('Error in getAllTemplatesForAdmin controller:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date()
      });
    }
  }
}
