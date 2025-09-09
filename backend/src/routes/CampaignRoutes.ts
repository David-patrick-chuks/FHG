import { Router } from 'express';
import multer from 'multer';
import { CampaignController } from '../controllers/CampaignController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class CampaignRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Configure multer for file uploads
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'text/plain') {
          cb(null, true);
        } else {
          cb(new Error('Only CSV and text files are allowed'));
        }
      }
    });

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All campaign routes require authentication
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);
    router.use(AuthMiddleware.rateLimitByUser);

    // Campaign management
    router.post('/', 
      AuthMiddleware.validateSubscriptionLimits('campaigns'),
      ValidationMiddleware.validateCreateCampaign,
      CampaignController.createCampaign
    );

    // File upload for email lists
    router.post('/upload-emails', 
      upload.single('file'),
      ValidationMiddleware.validateFileUpload,
      CampaignController.uploadEmailFile
    );

    router.get('/', 
      ValidationMiddleware.validatePagination,
      CampaignController.getCampaigns
    );

    router.get('/:id', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.getCampaign
    );

    router.put('/:id', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      ValidationMiddleware.validateUpdateCampaign,
      CampaignController.updateCampaign
    );

    router.delete('/:id', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.deleteCampaign
    );

    // Campaign lifecycle management
    router.post('/:id/prepare', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.prepareCampaign
    );

    router.post('/:id/schedule', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.scheduleCampaign
    );

    router.post('/:id/start', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.startCampaign
    );

    router.post('/:id/pause', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.pauseCampaign
    );

    router.post('/:id/resume', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.resumeCampaign
    );

    router.post('/:id/complete', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.completeCampaign
    );

    router.post('/:id/cancel', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.cancelCampaign
    );

    // Campaign content management
    router.post('/:id/regenerate-messages', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.regenerateAIMessages
    );

    // Campaign statistics
    router.get('/:id/stats', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.getCampaignStats
    );

    // Campaign tracking
    router.get('/:id/tracking/stats', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.getCampaignTrackingStats
    );

    router.get('/:id/tracking/logs', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.getCampaignTrackingLogs
    );

    return router;
  }

  public static getBasePath(): string {
    return '/campaigns';
  }
}
