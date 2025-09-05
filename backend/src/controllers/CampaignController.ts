import { Request, Response } from 'express';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import SentEmailModel from '../models/SentEmail';
import { CampaignService } from '../services/CampaignService';
import { FileUploadService } from '../services/FileUploadService';
import { Logger } from '../utils/Logger';
import { PaginationUtils } from '../utils/PaginationUtils';

export class CampaignController {
  private static logger: Logger = new Logger();

  public static async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      CampaignController.logger.info('Campaign creation request', {
        userId,
        campaignName: req.body.name,
        emailCount: req.body.emailList?.length || 0,
        botId: req.body.botId,
        ip: req.ip
      });

      const result = await CampaignService.createCampaign(userId, req.body);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Campaign created successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign creation error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async uploadEmailFile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const file = (req as any).file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Email file upload request', {
        userId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        ip: req.ip
      });

      // Parse the uploaded file
      const parsedResult = await FileUploadService.parseFile(file.buffer, file.mimetype);

      if (parsedResult.emails.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid email addresses found in the uploaded file',
          timestamp: new Date()
        });
        return;
      }

      res.status(200).json({
        success: true,
          message: 'Email file uploaded and parsed successfully',
          data: {
            emails: parsedResult.emails,
            totalCount: parsedResult.totalCount,
            validCount: parsedResult.validCount,
            invalidEmails: parsedResult.invalidEmails,
            fileName: file.originalname
          },
          timestamp: new Date()
        });

    } catch (error) {
      CampaignController.logger.error('Email file upload error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];

      // Extract pagination parameters
      const paginationParams = PaginationUtils.extractPaginationParams(req);
      
      // Validate pagination parameters
      const validation = PaginationUtils.validatePaginationParams(paginationParams);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.error,
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaigns retrieval request', {
        userId,
        pagination: paginationParams,
        ip: req.ip
      });

      const result = await CampaignService.getCampaignsByUserIdWithPagination(userId, paginationParams);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaigns retrieved successfully',
          data: {
            data: result.data?.data || [],
            pagination: result.data?.pagination
          },
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaigns retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign retrieval request', {
        userId,
        campaignId,
        ip: req.ip
      });

      const result = await CampaignService.getCampaignById(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign retrieval error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async updateCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }
      const updateData = req.body;

      // Remove fields that shouldn't be updated via this endpoint
      delete updateData.userId;
      delete updateData.botId;
      delete updateData.status;
      delete updateData.startedAt;
      delete updateData.completedAt;
      delete updateData.sentEmails;

      CampaignController.logger.info('Campaign update request', {
        userId,
        campaignId,
        updateFields: Object.keys(updateData),
        ip: req.ip
      });

      const result = await CampaignService.updateCampaign(campaignId, userId, updateData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign updated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign update error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async deleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign deletion request', {
        userId,
        campaignId,
        ip: req.ip
      });

      const result = await CampaignService.deleteCampaign(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign deleted successfully',
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign deletion error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async startCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign start request', {
        userId,
        campaignId,
        ip: req.ip
      });

      const result = await CampaignService.startCampaign(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign started successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign start error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async pauseCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];

      CampaignController.logger.info('Campaign pause request', {
        userId,
        campaignId,
        ip: req.ip
      });

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      const result = await CampaignService.pauseCampaign(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign paused successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign pause error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async resumeCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign resume request', {
        userId,
        campaignId,
        ip: req.ip
      });

      const result = await CampaignService.resumeCampaign(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign resumed successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign resume error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async completeCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign completion request', {
        userId,
        campaignId,
        ip: req.ip
      });

      const result = await CampaignService.completeCampaign(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign completed successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign completion error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async cancelCampaign(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign cancellation request', {
        userId,
        campaignId,
        ip: req.ip
      });

      const result = await CampaignService.cancelCampaign(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign cancelled successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign cancellation error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async regenerateAIMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      const { prompt } = req.body;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      // Validate prompt if provided
      if (prompt && prompt.trim().length > 1000) {
        res.status(400).json({
          success: false,
          message: 'Prompt must be no more than 1000 characters long',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('AI message regeneration request', {
        userId,
        campaignId,
        hasCustomPrompt: !!prompt,
        ip: req.ip
      });

      const result = await CampaignService.regenerateAIMessages(campaignId, userId, prompt);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'AI messages regenerated successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('AI message regeneration error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async getCampaignStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign stats request', {
        userId,
        campaignId,
        ip: req.ip
      });

      const result = await CampaignService.getCampaignStats(campaignId, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Campaign stats retrieved successfully',
          data: result.data,
          timestamp: new Date()
        });
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Campaign stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async uploadEmailList(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      const { emailList } = req.body;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Email list is required and must contain at least one email',
          timestamp: new Date()
        });
        return;
      }

      if (emailList.length > 10000) {
        res.status(400).json({
          success: false,
          message: 'Email list cannot exceed 10,000 emails',
          timestamp: new Date()
        });
        return;
      }

      // Validate all emails
      const invalidEmails: string[] = [];
      emailList.forEach((email: string, index: number) => {
        if (!ValidationMiddleware.validateEmail(email)) {
          invalidEmails.push(`Position ${index + 1}: ${email}`);
        }
      });

      if (invalidEmails.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid emails found',
          errors: invalidEmails,
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Email list upload request', {
        userId,
        campaignId,
        emailCount: emailList.length,
        ip: req.ip
      });

      // Sanitize emails
      const sanitizedEmails = emailList.map((email: string) => 
        ValidationMiddleware.sanitizeEmail(email)
      );

      // Update campaign with new email list
      const result = await CampaignService.updateCampaign(campaignId, userId, {
        emailList: sanitizedEmails
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Email list uploaded successfully',
          data: {
            campaignId,
            emailCount: sanitizedEmails.length
          },
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Email list upload error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  public static async selectMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      const { messageIndex } = req.body;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      if (messageIndex === undefined || messageIndex < 0) {
        res.status(400).json({
          success: false,
          message: 'Valid message index is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Message selection request', {
        userId,
        campaignId,
        messageIndex,
        ip: req.ip
      });

      // Get campaign to validate message index
      const campaign = await CampaignService.getCampaignById(campaignId, userId);
      if (!campaign.success) {
        res.status(404).json(campaign);
        return;
      }

      if (campaign.data && messageIndex >= campaign.data.aiMessages.length) {
        res.status(400).json({
          success: false,
          message: 'Message index is out of range',
          timestamp: new Date()
        });
        return;
      }

      // Update campaign with selected message
      const result = await CampaignService.updateCampaign(campaignId, userId, {
        selectedMessageIndex: messageIndex
      });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Message selected successfully',
          data: {
            campaignId,
            selectedMessageIndex: messageIndex,
                         selectedMessage: result.data?.aiMessages?.[messageIndex]
          },
          timestamp: new Date()
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      CampaignController.logger.error('Message selection error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get tracking statistics for a campaign
   */
  public static async getCampaignTrackingStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign tracking stats request', {
        userId,
        campaignId,
        ip: req.ip
      });

      // Verify user owns the campaign
      const campaign = await CampaignService.getCampaignById(campaignId, userId);
      if (!campaign.success) {
        res.status(404).json({
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        });
        return;
      }

      // Get tracking statistics
      const stats = await SentEmailModel.getDeliveryStats(campaignId);

      res.status(200).json({
        success: true,
        message: 'Campaign tracking statistics retrieved successfully',
        data: {
          campaignId,
          ...stats,
          openRate: stats.delivered > 0 ? Math.round((stats.opened / stats.delivered) * 100) : 0
        },
        timestamp: new Date()
      });
    } catch (error) {
      CampaignController.logger.error('Campaign tracking stats error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }

  /**
   * Get detailed tracking logs for a campaign
   */
  public static async getCampaignTrackingLogs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user['id'];
      const campaignId = req.params['id'];
      const { limit = 50, offset = 0, status } = req.query;

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: 'Campaign ID is required',
          timestamp: new Date()
        });
        return;
      }

      CampaignController.logger.info('Campaign tracking logs request', {
        userId,
        campaignId,
        limit,
        offset,
        status,
        ip: req.ip
      });

      // Verify user owns the campaign
      const campaign = await CampaignService.getCampaignById(campaignId, userId);
      if (!campaign.success) {
        res.status(404).json({
          success: false,
          message: 'Campaign not found',
          timestamp: new Date()
        });
        return;
      }

      // Build query
      const query: any = { campaignId };
      if (status) {
        query.status = status;
      }

      // Get tracking logs
      const emails = await SentEmailModel.find(query)
        .sort({ sentAt: -1 })
        .limit(parseInt(limit as string))
        .skip(parseInt(offset as string));

      const trackingLogs = emails.map(email => ({
        emailId: email._id,
        recipientEmail: email.recipientEmail,
        status: email.status,
        sentAt: email.sentAt,
        deliveredAt: email.deliveredAt,
        openedAt: email.openedAt,
        repliedAt: email.repliedAt,
        errorMessage: email.errorMessage
      }));

      res.status(200).json({
        success: true,
        message: 'Campaign tracking logs retrieved successfully',
        data: {
          campaignId,
          logs: trackingLogs,
          total: trackingLogs.length,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string)
        },
        timestamp: new Date()
      });
    } catch (error) {
      CampaignController.logger.error('Campaign tracking logs error:', error);
      ErrorHandler.handle(error, req, res, () => {});
    }
  }
}
