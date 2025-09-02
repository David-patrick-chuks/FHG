import { Router } from 'express';
import { AuthRoutes } from './AuthRoutes';
import { BotRoutes } from './BotRoutes';
import { CampaignRoutes } from './CampaignRoutes';
import { SubscriptionRoutes } from './SubscriptionRoutes';
import { AdminRoutes } from './AdminRoutes';
import { QueueRoutes } from './QueueRoutes';

export class Routes {
  private static router: Router = Router();

  public static getRouter(): Router {
    // Health check endpoint
    this.router.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Service is healthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development'
      });
    });

    // API version endpoint
    this.router.get('/version', (_req, res) => {
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
    this.router.use(AuthRoutes.getBasePath(), AuthRoutes.getRouter());
    this.router.use(BotRoutes.getBasePath(), BotRoutes.getRouter());
    this.router.use(CampaignRoutes.getBasePath(), CampaignRoutes.getRouter());
    this.router.use(SubscriptionRoutes.getBasePath(), SubscriptionRoutes.getRouter());
    this.router.use(AdminRoutes.getBasePath(), AdminRoutes.getRouter());
    this.router.use(QueueRoutes.getBasePath(), QueueRoutes.getRouter());

    // 404 handler for undefined routes
    this.router.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date()
      });
    });

    return this.router;
  }

  public static getRegisteredRoutes(): string[] {
    return [
      AuthRoutes.getBasePath(),
      BotRoutes.getBasePath(),
      CampaignRoutes.getBasePath(),
      SubscriptionRoutes.getBasePath(),
      AdminRoutes.getBasePath(),
      QueueRoutes.getBasePath()
    ];
  }
}

export default Routes;
