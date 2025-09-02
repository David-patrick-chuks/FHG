import cors from 'cors';
import express, { Application, Request } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { ErrorHandler } from '../middleware/ErrorHandler';
import { RequestLogger } from '../middleware/RequestLogger';
import { Routes } from '../routes';
import { Logger } from '../utils/Logger';

export class Server {
  private app: Application;
  private port: number;
  private server: any;
  private logger: Logger;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000', 10);
    this.logger = new Logger();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
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
      skip: (req: Request) => {
        // Skip rate limiting for health check and admin routes
        return req.path === '/health' || req.path.startsWith('/api/admin');
      }
    });
    this.app.use(limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(RequestLogger.log);
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api', Routes.getRouter());

    // Log registered routes
    const registeredRoutes = Routes.getRegisteredRoutes();
    this.logger.info('Registered API routes:', { routes: registeredRoutes });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use(ErrorHandler.handle);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          this.logger.info(`Server is running on port ${this.port}`);
          this.logger.info(`Environment: ${process.env['NODE_ENV'] || 'development'}`);
          this.logger.info(`Health check: http://localhost:${this.port}/api/health`);
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
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error: Error) => {
          if (error) {
            this.logger.error('Error closing server:', error);
            reject(error);
          } else {
            this.logger.info('Server stopped successfully');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
