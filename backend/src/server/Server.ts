import express, { Application } from 'express';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { HealthService } from '../services/HealthService';
import { MiddlewareService } from '../services/MiddlewareService';
import { RouteService } from '../services/RouteService';
import { ServerLifecycleService } from '../services/ServerLifecycleService';
import { Logger } from '../utils/Logger';

export class Server {
  private app: Application;
  private port: number;
  private database: DatabaseConnection;
  private logger: Logger;
  private healthService: HealthService;
  private routeService: RouteService;
  private lifecycleService: ServerLifecycleService;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000', 10);
    this.database = new DatabaseConnection();
    this.logger = new Logger();
    this.healthService = new HealthService(this.database);
    this.routeService = new RouteService(this.healthService);
    this.lifecycleService = new ServerLifecycleService(this.app, this.database);
    
    this.initializeServer();
  }

  /**
   * Initialize the server with all middleware, routes, and error handling
   */
  private initializeServer(): void {
    MiddlewareService.setupMiddleware(this.app);
    this.routeService.setupRoutes(this.app);
    this.setupErrorHandling();
  }

  /**
   * Configure error handling middleware
   */
  private setupErrorHandling(): void {
    this.app.use(ErrorHandler.handle);
  }

  /**
   * Start the server and establish database connection
   */
  public async start(): Promise<void> {
    await this.lifecycleService.start(this.port);
  }

  /**
   * Gracefully stop the server
   */
  public async stop(): Promise<void> {
    await this.lifecycleService.stop();
  }

  /**
   * Get the Express application instance
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Get server status information
   */
  public getStatus(): { running: boolean; port: number; uptime: number } {
    return this.lifecycleService.getStatus(this.port);
  }
}
