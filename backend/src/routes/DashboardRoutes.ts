import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { DashboardController } from '../controllers/DashboardController';

export class DashboardRoutes {
  private static readonly basePath = '/dashboard';

  public static getBasePath(): string {
    return DashboardRoutes.basePath;
  }

  public static getRouter(): Router {
    const router = Router();

    // All dashboard routes require authentication
    router.use(AuthMiddleware.authenticate);

    // Get dashboard statistics and overview
    router.get('/stats', DashboardController.getDashboardStats);

    // Get user's recent activity
    router.get('/activity', DashboardController.getRecentActivity);

    // Get unread activity count
    router.get('/activity/unread-count', DashboardController.getUnreadCount);

    // Mark all activities as read
    router.post('/activity/mark-all-read', DashboardController.markAllAsRead);

    // Get quick overview data
    router.get('/overview', DashboardController.getQuickOverview);

    return router;
  }
}
