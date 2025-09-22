import { Router } from 'express';
import { TrackingController } from '../controllers/TrackingController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';

export class TrackingRoutes {
  public static getBasePath(): string {
    return '/track';
  }

  public static getRouter(): Router {
    const router = Router();

    // Public tracking endpoints (no authentication required)
    // These are called by email clients when loading tracking pixels

    /**
     * Email open tracking endpoint
     * This endpoint is called when the tracking pixel is loaded
     */
    router.get('/open', TrackingController.trackEmailOpen);

    /**
     * Get tracking statistics for a campaign (public)
     */
    router.get('/stats/:campaignId', TrackingController.getCampaignStats);

    /**
     * Get detailed tracking logs for a campaign (public)
     */
    router.get('/logs/:campaignId', TrackingController.getCampaignLogs);

    // Authenticated endpoints for enhanced functionality
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);

    /**
     * Get tracking statistics for multiple campaigns (authenticated)
     */
    router.post('/stats/multiple', 
      ValidationMiddleware.sanitizeRequestBody,
      TrackingController.getMultipleCampaignStats
    );

    /**
     * Get user tracking summary (authenticated)
     */
    router.get('/summary', TrackingController.getUserTrackingSummary);

    return router;
  }
}

export default TrackingRoutes;
