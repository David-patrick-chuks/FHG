import { Router } from 'express';
import { QueueController } from '../controllers/QueueController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class QueueRoutes {
  public static getRouter(): Router {
    const router = Router();

    // Apply global middleware
    router.use(ValidationMiddleware.sanitizeRequestBody);

    // All queue routes require authentication and admin privileges
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAdmin);
    router.use(AuthMiddleware.rateLimitByUser);

    // Queue management
    router.get('/status', 
      QueueController.getQueueStatus
    );

    router.post('/pause', 
      QueueController.pauseQueue
    );

    router.post('/resume', 
      QueueController.resumeQueue
    );

    router.post('/clear', 
      QueueController.clearQueue
    );

    // Job management
    router.get('/jobs/:jobId', 
      QueueController.getJobById
    );

    router.delete('/jobs/:jobId', 
      QueueController.removeJob
    );

    router.get('/jobs/campaign/:campaignId', 
      QueueController.getJobsByCampaign
    );

    router.get('/jobs/bot/:botId', 
      QueueController.getJobsByBot
    );

    return router;
  }

  public static getBasePath(): string {
    return '/queue';
  }
}
