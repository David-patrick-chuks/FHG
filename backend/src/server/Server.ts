import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import os from 'os';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { RequestLogger } from '../middleware/RequestLogger';
import { Routes } from '../routes';
import { Logger } from '../utils/Logger';

export class Server {
  private app: Application;
  private port: number;
  private server: any;
  private database: DatabaseConnection;
  private logger: Logger;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000', 10);
    this.database = new DatabaseConnection();
    this.logger = new Logger();
    
    this.initializeServer();
  }

  /**
   * Initialize the server with all middleware, routes, and error handling
   */
  private initializeServer(): void {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configure all middleware for the application
   */
  private setupMiddleware(): void {
    // Compression for response optimization
    this.app.use(compression());
    
    // Security headers
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
    
    // CORS configuration
    this.app.use(cors({
      origin: this.getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    this.app.use(this.createRateLimiter());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Cookie parsing
    this.app.use(cookieParser());
    
    // Request logging
    this.app.use(RequestLogger.log);
  }

  /**
   * Get CORS origins based on environment
   */
  private getCorsOrigins(): string[] {
    return process.env['NODE_ENV'] === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'];
  }

  /**
   * Create rate limiter configuration
   */
  private createRateLimiter() {
    return rateLimit({
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
      max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'),
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000') / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => {
        return req.path === '/health' || req.path.startsWith('/api/admin');
      }
    });
  }

  /**
   * Configure application routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', this.handleHealthCheck.bind(this));

    // API routes
    this.app.use('/api', Routes.getRouter());

    // 404 handler for undefined routes
    this.app.use('/', this.handleNotFound.bind(this));
  }

  /**
   * Handle health check requests
   */
  private async handleHealthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Get database health status
      const dbStatus = await this.getDatabaseHealth();
      
      // Get system metrics
      const systemMetrics = this.getSystemMetrics();
      
      // Get application metrics
      const appMetrics = this.getApplicationMetrics();
      
      const responseTime = Date.now() - startTime;
      
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        
        // Database health
        database: {
          status: dbStatus.status,
          connected: dbStatus.connected,
          responseTime: `${dbStatus.responseTime}ms`,
          lastCheck: dbStatus.lastCheck,
          stats: dbStatus.stats
        },
        
        // System metrics
        system: {
          memory: systemMetrics.memory,
          cpu: systemMetrics.cpu,
          platform: systemMetrics.platform,
          nodeVersion: systemMetrics.nodeVersion,
          processId: systemMetrics.processId
        },
        
        // Application metrics
        application: {
          version: process.env['APP_VERSION'] || '1.0.0',
          buildNumber: process.env['BUILD_NUMBER'] || 'dev',
          responseTime: `${responseTime}ms`,
          activeConnections: this.server ? this.server.connections : 0,
          routes: this.getRouteCount()
        },
        
        // Performance indicators
        performance: {
          responseTime: responseTime,
          memoryUsage: systemMetrics.memory.usage,
          uptime: process.uptime()
        }
      });
      
    } catch (error) {
      this.logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get database health status
   */
  private async getDatabaseHealth(): Promise<{
    connected: boolean;
    responseTime: number;
    lastCheck: string;
    status: string;
    stats?: any;
  }> {
    const startTime = Date.now();
    try {
      const isConnected = this.database.isConnected();
      const healthCheck = await this.database.healthCheck();
      const stats = await this.database.getStats();
      const responseTime = Date.now() - startTime;
      
      return {
        connected: isConnected && healthCheck,
        responseTime,
        lastCheck: new Date().toISOString(),
        status: healthCheck ? 'healthy' : 'unhealthy',
        stats: stats ? {
          collections: stats.collections,
          indexes: stats.indexes,
          dataSize: `${Math.round(stats.dataSize / 1024 / 1024)} MB`,
          storageSize: `${Math.round(stats.storageSize / 1024 / 1024)} MB`
        } : null
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        status: 'error'
      };
    }
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): {
    memory: {
      usage: number;
      total: number;
      free: number;
      percentage: number;
    };
    cpu: {
      loadAverage: number[];
      uptime: number;
    };
    platform: string;
    nodeVersion: string;
    processId: number;
  } {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      memory: {
        usage: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / totalMem) * 100)
      },
      cpu: {
        loadAverage: os.loadavg(),
        uptime: os.uptime()
      },
      platform: process.platform,
      nodeVersion: process.version,
      processId: process.pid
    };
  }

  /**
   * Get application metrics
   */
  private getApplicationMetrics(): {
    version: string;
    buildNumber: string;
    responseTime: string;
    activeConnections: number;
    routes: number;
  } {
    return {
      version: process.env['APP_VERSION'] || '1.0.0',
      buildNumber: process.env['BUILD_NUMBER'] || 'dev',
      responseTime: '0ms',
      activeConnections: this.server ? this.server.connections : 0,
      routes: this.getRouteCount()
    };
  }

  /**
   * Get route count for metrics
   */
  private getRouteCount(): number {
    try {
      return this.app._router.stack
        .filter((layer: any) => layer.route)
        .length;
    } catch {
      return 0;
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
    try {
      this.logger.info('Starting server initialization...');
      
      // Connect to database first
      await this.database.connect();
      this.logger.info('Database connection established');
      
      // Start HTTP server
      await this.startHttpServer();
      
      this.logger.info(`Server successfully started on port ${this.port}`);
      this.logServerInfo();
      
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Start the HTTP server
   */
  private async startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, () => {
        resolve();
      });

      this.server.on('error', (error: Error) => {
        this.logger.error('Server error occurred:', error);
        reject(error);
      });
    });
  }

  /**
   * Log server information
   */
  private logServerInfo(): void {
    this.logger.info('Server Information:', {
      port: this.port,
      environment: process.env['NODE_ENV'] || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    });
  }

  /**
   * Gracefully stop the server
   */
  public async stop(): Promise<void> {
    this.logger.info('Initiating server shutdown...');
    
    try {
      // Stop HTTP server
      if (this.server) {
        await this.stopHttpServer();
        this.logger.info('HTTP server stopped');
      }

      // Disconnect database
      await this.database.disconnect();
      this.logger.info('Database connection closed');
      
      this.logger.info('Server shutdown completed successfully');
      
    } catch (error) {
      this.logger.error('Error during server shutdown:', error);
      throw error;
    }
  }

  /**
   * Stop the HTTP server
   */
  private async stopHttpServer(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.close(() => {
        this.server = null;
        resolve();
      });
    });
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
    return {
      running: this.server && this.server.listening,
      port: this.port,
      uptime: process.uptime()
    };
  }
}
