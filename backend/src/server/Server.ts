import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
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
  private logger: Logger;
  private database: DatabaseConnection;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000', 10);
    this.logger = new Logger();
    this.database = new DatabaseConnection();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Compression middleware
    this.app.use(compression());
    
    // Security middleware
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
      origin: process.env['NODE_ENV'] === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
      max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000') / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: any) => {
        // Skip rate limiting for health check and admin routes
        return req.path === '/api/health' || req.path.startsWith('/api/admin');
      }
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Cookie parsing middleware
    this.app.use(cookieParser());

    // Request logging middleware
    this.app.use(RequestLogger.log);
  }

  private setupRoutes(): void {
    // Basic health check (for load balancers/monitoring)
    this.app.get('/health', (_req, res) => {
      const dbStatus = this.getDatabaseStatus();
      const isHealthy = this.isHealthy();
      
      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'OK' : 'SERVICE_UNAVAILABLE',
        message: isHealthy ? 'Server is healthy' : 'Server is unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development',
        database: dbStatus,
        server: {
          listening: this.server ? this.server.listening : false,
          port: this.port
        }
      });
    });

    // API routes
    this.app.use('/api', Routes.getRouter());

    // Log registered routes
    const registeredRoutes = Routes.getRegisteredRoutes();
    this.logger.info('Registered API routes:', { routes: registeredRoutes });

    // 404 handler for undefined routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(ErrorHandler.handle);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database first
      this.logger.info('🔄 Connecting to database...');
      await this.database.connect();
      this.logger.info('✅ Database connected successfully');

      // Start the server
      return new Promise((resolve, reject) => {
        try {
          this.server = this.app.listen(this.port, () => {
            this.logger.info(`🚀 Main server running on port ${this.port}`);
            this.logger.info(`📍 Health check: http://localhost:${this.port}/api/health`);
            this.logger.info(`📍 API version: http://localhost:${this.port}/api/version`);
            this.logger.info(`📍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
            resolve();
          });

          this.server.on('error', (error: Error) => {
            this.logger.error('Server error:', error);
            reject(error);
          });
        } catch (error) {
          this.logger.error('Failed to start server:', error);
          reject(error);
        }
      });
    } catch (error) {
      this.logger.error('Failed to start server or connect to database:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      // Stop the server first
      if (this.server) {
        // Remove all listeners to prevent memory leaks
        this.server.removeAllListeners('error');
        this.server.removeAllListeners('close');
        this.server.removeAllListeners('listening');
        
        await new Promise<void>((resolve, reject) => {
          this.server.close((error: Error) => {
            if (error) {
              this.logger.error('Error closing server:', error);
              reject(error);
            } else {
              this.logger.info('✅ Server stopped successfully');
              this.server = null;
              resolve();
            }
          });
        });
      }

      // Disconnect from database
      this.logger.info('🔄 Disconnecting from database...');
      await this.database.disconnect();
      this.logger.info('✅ Database disconnected successfully');
    } catch (error) {
      this.logger.error('Error during server shutdown:', error);
      throw error;
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public getServerInfo(): any {
    return {
      port: this.port,
      environment: process.env['NODE_ENV'] || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      database: {
        connected: this.database ? this.database.isConnected() : false,
        uri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/email-outreach-bot'
      }
    };
  }

  public isHealthy(): boolean {
    return this.server && this.server.listening && this.database && this.database.isConnected();
  }

  public getDatabaseStatus(): any {
    if (!this.database) {
      return { status: 'not_initialized', message: 'Database not initialized' };
    }
    
    return {
      status: this.database.isConnected() ? 'connected' : 'disconnected',
      connected: this.database.isConnected(),
      uri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/email-outreach-bot'
    };
  }

  public getStats(): any {
    return {
      ...this.getServerInfo(),
      healthy: this.isHealthy(),
      connections: this.server ? this.server.connections : 0,
      maxConnections: this.server ? this.server.maxConnections : 0
    };
  }
}
