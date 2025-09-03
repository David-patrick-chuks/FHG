import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
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
  private handleHealthCheck(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development'
    });
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
