import { Router } from 'express';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { AdminRoutes } from './AdminRoutes';
import { ApiKeyRoutes } from './ApiKeyRoutes';
import { AuthRoutes } from './AuthRoutes';
import { BotRoutes } from './BotRoutes';
import { CampaignRoutes } from './CampaignRoutes';
import { ContactRoutes } from './ContactRoutes';
import { CookieRoutes } from './CookieRoutes';
import { DashboardRoutes } from './DashboardRoutes';
import { EmailExtractorRoutes } from './EmailExtractorRoutes';
import { IncidentRoutes } from './IncidentRoutes';
import { PublicApiRoutes } from './PublicApiRoutes';
import { QueueRoutes } from './QueueRoutes';
import { SubscriptionRoutes } from './SubscriptionRoutes';
import { TrackingRoutes } from './TrackingRoutes';
import { PaymentRoutes } from './PaymentRoutes';

export class Routes {
  public static getRouter(healthService?: any): Router {
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

    // System status endpoint for detailed monitoring
    router.get('/system-status', async (_req, res) => {
      try {
        if (healthService) {
          // Use the shared health service instance from the server
          const status = await healthService.getHealthStatus(null);
          res.status(200).json(status);
        } else {
          // Fallback: create new instance (should not happen in normal operation)
          const { HealthService } = await import('../services/HealthService');
          const { DatabaseConnection } = await import('../database/DatabaseConnection');
          
          const database = DatabaseConnection.getInstance();
          const fallbackHealthService = new HealthService(database);
          
          const status = await fallbackHealthService.getHealthStatus(null);
          res.status(200).json(status);
        }
      } catch (error) {
        res.status(503).json({
          status: 'ERROR',
          timestamp: new Date().toISOString(),
          error: 'System status check failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    // Root API endpoint
    router.get('/', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Welcome to Email Outreach Bot API',
        data: {
          name: 'Email Outreach Bot API',
          version: '1.0.0',
          description: 'AI-powered email outreach platform with multi-user support and subscription tiers',
          status: 'operational',
          endpoints: {
            health: '/health',
            version: '/version',
            systemStatus: '/system-status',
            auth: '/api/auth',
            dashboard: '/api/dashboard',
            bots: '/api/bots',
            campaigns: '/api/campaigns',
            emailExtractor: '/api/email-extractor',
            payments: '/api/payments',
            admin: '/api/admin',
            apiKeys: '/api/api-keys',
            contacts: '/api/contacts',
            cookies: '/api/cookies',
            incidents: '/api/incidents',
            publicApi: '/api/public',
            subscriptions: '/api/subscriptions',
            tracking: '/api/tracking',
            queue: '/api/queue'
          },
          documentation: 'https://www.agentworld.online/api-docs',
          support: 'support@agentworld.online'
        },
        timestamp: new Date()
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

    // Development endpoint to clear rate limits (only in development)
    if (process.env['NODE_ENV'] === 'development') {
      router.post('/dev/clear-rate-limits', (_req, res) => {
        AuthMiddleware.clearRateLimitStore();
        res.status(200).json({
          success: true,
          message: 'Rate limits cleared for development',
          timestamp: new Date()
        });
      });
    }

    // Register all route modules
    router.use(AuthRoutes.getBasePath(), AuthRoutes.getRouter());
    router.use(ApiKeyRoutes.getBasePath(), ApiKeyRoutes.getRouter());
    router.use(BotRoutes.getBasePath(), BotRoutes.getRouter());
    router.use(CampaignRoutes.getBasePath(), CampaignRoutes.getRouter());
    router.use(ContactRoutes.getBasePath(), ContactRoutes.getRouter());
    router.use(CookieRoutes.getBasePath(), CookieRoutes.getRouter());
    router.use(DashboardRoutes.getBasePath(), DashboardRoutes.getRouter());
    router.use(EmailExtractorRoutes.getBasePath(), EmailExtractorRoutes.getRouter());
    router.use(IncidentRoutes.getBasePath(), IncidentRoutes.getRouter());
    router.use(PaymentRoutes.getBasePath(), PaymentRoutes.getRouter());
    router.use(PublicApiRoutes.getBasePath(), PublicApiRoutes.getRouter());
    router.use(SubscriptionRoutes.getBasePath(), SubscriptionRoutes.getRouter());
    router.use(AdminRoutes.getBasePath(), AdminRoutes.getRouter());
    router.use(QueueRoutes.getBasePath(), QueueRoutes.getRouter());
    router.use(TrackingRoutes.getBasePath(), TrackingRoutes.getRouter());

    // 404 handler for undefined routes (excluding root path)
    router.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date(),
        availableEndpoints: [
          '/',
          '/health',
          '/version',
          '/system-status',
          '/api/auth',
          '/api/dashboard',
          '/api/bots',
          '/api/campaigns',
          '/api/email-extractor',
          '/api/payments',
          '/api/admin',
          '/api/api-keys',
          '/api/contacts',
          '/api/cookies',
          '/api/incidents',
          '/api/public',
          '/api/subscriptions',
          '/api/tracking',
          '/api/queue'
        ]
      });
    });

    return router;
  }

  public static getRegisteredRoutes(): string[] {
    return [
      AuthRoutes.getBasePath(),
      ApiKeyRoutes.getBasePath(),
      BotRoutes.getBasePath(),
      CampaignRoutes.getBasePath(),
      ContactRoutes.getBasePath(),
      CookieRoutes.getBasePath(),
      DashboardRoutes.getBasePath(),
      EmailExtractorRoutes.getBasePath(),
      IncidentRoutes.getBasePath(),
      PaymentRoutes.getBasePath(),
      PublicApiRoutes.getBasePath(),
      SubscriptionRoutes.getBasePath(),
      AdminRoutes.getBasePath(),
      QueueRoutes.getBasePath(),
      TrackingRoutes.getBasePath()
    ];
  }

  /**
   * Get the total count of all registered routes
   */
  public static getRouteCount(): number {
    try {
      let totalRoutes = 0;
      
      // Count routes from each module
      totalRoutes += this.countRoutesInModule(AuthRoutes);
      totalRoutes += this.countRoutesInModule(ApiKeyRoutes);
      totalRoutes += this.countRoutesInModule(BotRoutes);
      totalRoutes += this.countRoutesInModule(CampaignRoutes);
      totalRoutes += this.countRoutesInModule(ContactRoutes);
      totalRoutes += this.countRoutesInModule(CookieRoutes);
      totalRoutes += this.countRoutesInModule(DashboardRoutes);
      totalRoutes += this.countRoutesInModule(EmailExtractorRoutes);
      totalRoutes += this.countRoutesInModule(IncidentRoutes);
      totalRoutes += this.countRoutesInModule(PaymentRoutes);
      totalRoutes += this.countRoutesInModule(PublicApiRoutes);
      totalRoutes += this.countRoutesInModule(SubscriptionRoutes);
      totalRoutes += this.countRoutesInModule(AdminRoutes);
      totalRoutes += this.countRoutesInModule(QueueRoutes);
      totalRoutes += this.countRoutesInModule(TrackingRoutes);
      
      // Add main routes from this class
      totalRoutes += 2; // /health and /version
      
      return totalRoutes;
    } catch (error) {
      console.warn('Could not count routes:', error);
      return -1;
    }
  }

  /**
   * Count routes in a specific route module
   */
  private static countRoutesInModule(routeModule: any): number {
    try {
      const router = routeModule.getRouter();
      if (!router || !router.stack) return 0;
      
      let count = 0;
      for (const layer of router.stack) {
        if (layer.route) {
          count++;
        }
      }
      return count;
    } catch (error) {
      console.warn(`Could not count routes in ${routeModule.name}:`, error);
      return 0;
    }
  }
}

export default Routes;
