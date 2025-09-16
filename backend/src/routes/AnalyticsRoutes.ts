import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

export class AnalyticsRoutes {
  public static getBasePath(): string {
    return '/analytics';
  }

  public static getRouter(): Router {
    const router = Router();

    // All analytics routes require authentication
    router.use(AuthMiddleware.authenticate);
    router.use(AuthMiddleware.requireAuth);

    /**
     * Get comprehensive analytics for authenticated user
     * Requires paid subscription (Basic or Premium)
     */
    router.get('/', AnalyticsController.getUserAnalytics);

    /**
     * Get analytics summary for dashboard
     * Available to all authenticated users (including free)
     */
    router.get('/summary', AnalyticsController.getAnalyticsSummary);

    /**
     * Check if user has access to analytics features
     * Available to all authenticated users
     */
    router.get('/access', AnalyticsController.checkAnalyticsAccess);

    return router;
  }
}

export default AnalyticsRoutes;
