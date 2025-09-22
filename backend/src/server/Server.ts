import express, { Application } from 'express';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { PaymentCleanupJob } from '../jobs/PaymentCleanupJob';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { AuditService } from '../services/AuditService';
import { EnvironmentValidationService } from '../services/EnvironmentValidationService';
import { HealthService } from '../services/HealthService';
import { MiddlewareService } from '../services/MiddlewareService';
import { RouteService } from '../services/RouteService';
import { ServerLifecycleService } from '../services/ServerLifecycleService';
import { SystemActivityService } from '../services/SystemActivityService';
import { Logger } from '../utils/Logger';
import { ActivityType } from '../types';

export class Server {
  private app: Application;
  private port: number;
  private database: DatabaseConnection;
  private logger: Logger;
  private healthService: HealthService;
  private routeService: RouteService;
  private lifecycleService: ServerLifecycleService;

  constructor() {
    // Initialize logger first
    this.logger = new Logger();
    
    // Validate environment variables
    this.validateEnvironment();
    
    this.app = express();
    this.port = EnvironmentValidationService.getEnvNumber('PORT', 3001);
    this.database = new DatabaseConnection();
    this.healthService = new HealthService(this.database);
    this.routeService = new RouteService(this.healthService);
    this.lifecycleService = new ServerLifecycleService(this.app, this.database);
    
    this.initializeServer();
  }

  /**
   * Validate environment variables on startup
   */
  private validateEnvironment(): void {
    const validation = EnvironmentValidationService.validateEnvironment();
    
    if (!validation.isValid) {
      this.logger.error('Environment validation failed:', {
        errors: validation.errors
      });
      
      console.error('❌ Environment validation failed:');
      validation.errors.forEach(error => {
        console.error(`  - ${error}`);
      });
      
      process.exit(1);
    }
    
    // Only log environment validation in debug mode
    if (process.env.LOG_LEVEL === 'debug') {
      this.logger.debug('Environment validation passed', {
        envInfo: EnvironmentValidationService.getSanitizedEnvInfo()
      });
    }
  }

  /**
   * Initialize the server with all middleware, routes, and error handling
   */
  private initializeServer(): void {
    // Configure Express to trust proxies for proper IP detection in production
    this.app.set('trust proxy', true);
    
    // Initialize services
    AuditService.initialize();
    
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
    
    // Start payment cleanup job
    PaymentCleanupJob.start();
    this.logger.info('Payment cleanup job started');

    // Log server startup
    await this.logSystemActivity(
      ActivityType.SYSTEM_MAINTENANCE,
      'Server Started',
      `Application server started successfully on port ${this.port}`,
      'low',
      'server',
      {
        port: this.port,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      }
    );
  }

  /**
   * Gracefully stop the server
   */
  public async stop(): Promise<void> {
    // Log server shutdown
    await this.logSystemActivity(
      ActivityType.SYSTEM_MAINTENANCE,
      'Server Shutdown',
      'Application server is shutting down gracefully',
      'low',
      'server',
      {
        port: this.port,
        environment: process.env.NODE_ENV || 'development'
      }
    );

    // Stop payment cleanup job
    PaymentCleanupJob.stop();
    this.logger.info('Payment cleanup job stopped');
    
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

  /**
   * Helper method to log system activities
   */
  private async logSystemActivity(
    type: ActivityType,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    source: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await SystemActivityService.logSystemEvent(
        type,
        title,
        description,
        severity,
        source,
        metadata
      );
    } catch (logError) {
      // Don't let logging errors break server operations
      this.logger.error('Failed to log system activity:', logError);
    }
  }
}
