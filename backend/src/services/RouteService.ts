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
    // Health check endpoint
    app.get('/health', this.handleHealthCheck.bind(this));

    // API routes
    app.use('/api', Routes.getRouter());

    // 404 handler for undefined routes
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
