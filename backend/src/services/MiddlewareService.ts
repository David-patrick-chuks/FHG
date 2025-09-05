import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { RequestLogger } from '../middleware/RequestLogger';

export class MiddlewareService {
  /**
   * Configure all middleware for the application
   */
  public static setupMiddleware(app: Application): void {
    // Compression for response optimization
    app.use(compression());
    
    // Security headers
    app.use(helmet({
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
    app.use(cors({
      origin: this.getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    app.use(this.createRateLimiter());

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Cookie parsing
    app.use(cookieParser());
    
    // Request logging
    app.use(RequestLogger.log);
  }

  /**
   * Get CORS origins based on environment
   */
  private static getCorsOrigins(): string[] {
    return process.env['NODE_ENV'] === 'production' 
      ? ['https://www.agentworld.online'] 
      : ['http://localhost:3000', 'http://localhost:3001'];
  }
  /**
   * Create rate limiter configuration
   */
  private static createRateLimiter() {
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
}
