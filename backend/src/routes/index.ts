import { Router } from 'express';
import { AdminRoutes } from './AdminRoutes';
import { AuthRoutes } from './AuthRoutes';
import { BotRoutes } from './BotRoutes';
import { CampaignRoutes } from './CampaignRoutes';
import { DashboardRoutes } from './DashboardRoutes';
import { QueueRoutes } from './QueueRoutes';
import { SubscriptionRoutes } from './SubscriptionRoutes';

export class Routes {
  public static getRouter(): Router {
    const router = Router();

    // Health check endpoint
    router.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Service is healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development'
      });
    });

    // API version endpoint
    router.get('/version', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'API version information',
        data: {
          version: '1.0.0',
          name: 'Email Outreach Bot API',
          description: 'AI-powered email outreach platform with multi-user support and subscription tiers'
        },
        timestamp: new Date()
      });
    });

    // Register all route modules
    router.use(AuthRoutes.getBasePath(), AuthRoutes.getRouter());
    router.use(BotRoutes.getBasePath(), BotRoutes.getRouter());
    router.use(CampaignRoutes.getBasePath(), CampaignRoutes.getRouter());
    router.use(DashboardRoutes.getBasePath(), DashboardRoutes.getRouter());
    router.use(SubscriptionRoutes.getBasePath(), SubscriptionRoutes.getRouter());
    router.use(AdminRoutes.getBasePath(), AdminRoutes.getRouter());
    router.use(QueueRoutes.getBasePath(), QueueRoutes.getRouter());

    // 404 handler for undefined routes
    router.use('/', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date()
      });
    });

    return router;
  }

  public static getRegisteredRoutes(): string[] {
    return [
      AuthRoutes.getBasePath(),
      BotRoutes.getBasePath(),
      CampaignRoutes.getBasePath(),
      DashboardRoutes.getBasePath(),
      SubscriptionRoutes.getBasePath(),
      AdminRoutes.getBasePath(),
      QueueRoutes.getBasePath()
    ];
  }
}

export default Routes;
