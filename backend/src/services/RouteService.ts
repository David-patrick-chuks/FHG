import { Application, Request, Response } from 'express';
import { Routes } from '../routes';
import { HealthService } from './HealthService';

export class RouteService {
  private healthService: HealthService;

  constructor(healthService: HealthService) {
    this.healthService = healthService;
  }

  /**
   * Configure application routes
   */
  public setupRoutes(app: Application): void {
    // Root endpoint
    app.get('/', (_req, res) => {
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
            version: '/api/version',
            systemStatus: '/api/system-status',
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

    // Health check endpoint
    app.get('/health', this.handleHealthCheck.bind(this));

    // API routes - pass the health service instance
    app.use('/api', Routes.getRouter(this.healthService));

    // 404 handler for undefined routes
    // app.use('*', this.handleNotFound.bind(this));
    app.use('/', this.handleNotFound.bind(this));
  }

  /**
   * Handle health check requests
   */
  private async handleHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = await this.healthService.getHealthStatus(this);
      res.status(200).json(healthStatus);
    } catch (error) {
      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle 404 requests
   */
  private handleNotFound(req: Request, res: Response): void {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
}
