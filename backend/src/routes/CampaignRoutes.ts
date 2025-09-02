import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';


export class CampaignRoutes {
  private static router: Router = Router();

  public static getRouter(): Router {
    // Apply global middleware
    this.router.use(ValidationMiddleware.sanitizeRequestBody);

    // All campaign routes require authentication
    this.router.use(AuthMiddleware.authenticate);
    this.router.use(AuthMiddleware.requireAuth);
    this.router.use(AuthMiddleware.rateLimitByUser);

    // Campaign management
    this.router.post('/', 
      AuthMiddleware.validateSubscriptionLimits('campaigns'),
      ValidationMiddleware.validateCreateCampaign,
      CampaignController.createCampaign
    );

    this.router.get('/', 
      ValidationMiddleware.validatePagination,
      CampaignController.getCampaigns
    );

    this.router.get('/:id', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.getCampaign
    );

    this.router.put('/:id', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      ValidationMiddleware.validateUpdateCampaign,
      CampaignController.updateCampaign
    );

    this.router.delete('/:id', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.deleteCampaign
    );

    // Campaign lifecycle management
    this.router.post('/:id/start', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.startCampaign
    );

    this.router.post('/:id/pause', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.pauseCampaign
    );

    this.router.post('/:id/resume', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.resumeCampaign
    );

    this.router.post('/:id/complete', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.completeCampaign
    );

    this.router.post('/:id/cancel', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.cancelCampaign
    );

    // Campaign content management
    this.router.post('/:id/regenerate-messages', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.regenerateAIMessages
    );

    // Campaign statistics
    this.router.get('/:id/stats', 
      AuthMiddleware.validateOwnership('campaign', 'id'),
      CampaignController.getCampaignStats
    );

    return this.router;
  }

  public static getBasePath(): string {
    return '/campaigns';
  }
}
