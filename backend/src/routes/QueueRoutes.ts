import { Router } from 'express';
import { QueueController } from '../controllers/QueueController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class QueueRoutes {
  private static router: Router = Router();

  public static getRouter(): Router {
    // Apply global middleware
    this.router.use(ValidationMiddleware.sanitizeRequestBody);

    // All queue routes require authentication and admin privileges
    this.router.use(AuthMiddleware.authenticate);
    this.router.use(AuthMiddleware.requireAdmin);
    this.router.use(AuthMiddleware.rateLimitByUser);

    // Queue management
    this.router.get('/status', 
      QueueController.getQueueStatus
    );

    this.router.post('/pause', 
      QueueController.pauseQueue
    );

    this.router.post('/resume', 
      QueueController.resumeQueue
    );

    this.router.post('/clear', 
      QueueController.clearQueue
    );

    // Job management
    this.router.get('/jobs/:jobId', 
      QueueController.getJobById
    );

    this.router.delete('/jobs/:jobId', 
      QueueController.removeJob
    );

    this.router.get('/jobs/campaign/:campaignId', 
      QueueController.getJobsByCampaign
    );

    this.router.get('/jobs/bot/:botId', 
      QueueController.getJobsByBot
    );

    return this.router;
  }

  public static getBasePath(): string {
    return '/queue';
  }
}
