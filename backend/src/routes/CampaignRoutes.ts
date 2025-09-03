import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class CampaignRoutes {
  public static getRouter(): Router {
    const router = Router();

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

    return router;
  }

  public static getBasePath(): string {
    return '/campaigns';
  }
}
