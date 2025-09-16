import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import helmet from 'helmet';
import { RequestLogger } from '../middleware/RequestLogger';
import { SecurityMiddleware } from '../middleware/SecurityMiddleware';
import { TokenRefreshMiddleware } from '../middleware/TokenRefreshMiddleware';
import { WebhookBodyParser } from '../middleware/WebhookBodyParser';

export class MiddlewareService {
  /**
   * Configure all middleware for the application
   */
  public static setupMiddleware(app: Application): void {
    // Compression for response optimization
    app.use(compression());
    
    // Enhanced security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: []
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      crossOriginEmbedderPolicy: false, // Disable for API compatibility
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    
    // Enhanced CORS configuration
    app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = this.getCorsOrigins();
        
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Log unauthorized CORS attempts
        console.warn(`CORS blocked request from origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'X-API-Key',
        'Accept',
        'Origin',
        'Cache-Control',
        'Pragma',
        'Cookie',
        'Set-Cookie'
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'Set-Cookie'],
      maxAge: 86400, // 24 hours
      preflightContinue: false,
      optionsSuccessStatus: 204
    }));

    // Rate limiting
    app.use(this.createRateLimiter());

    // Webhook body parsing (must be before regular JSON parsing)
    app.use(WebhookBodyParser.captureRawBody);

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Cookie parsing
    app.use(cookieParser());
    
    // Automatic token refresh middleware (must be before auth middleware)
    app.use(TokenRefreshMiddleware.autoRefreshToken);
    
    // Enhanced security middleware
    app.use(SecurityMiddleware.generateRequestId);
    app.use(SecurityMiddleware.enhancedSecurityHeaders);
    app.use(SecurityMiddleware.logSecurityEvent);
    app.use(SecurityMiddleware.detectSuspiciousActivity);
    app.use(SecurityMiddleware.sanitizeResponse);
    
    // Request logging
    app.use(RequestLogger.log);
  }

  /**
   * Get CORS origins based on environment
   */
  private static getCorsOrigins(): string[] {
    const isProduction = process.env['NODE_ENV'] === 'production';
    
    // Check for environment-specific CORS origins first
    const envSpecificOrigins = isProduction 
      ? process.env.CORS_ORIGINS_PROD 
      : process.env.CORS_ORIGINS_DEV;
    
    if (envSpecificOrigins) {
      return envSpecificOrigins.split(',').map(origin => origin.trim());
    }
    
    // Fallback to general CORS_ORIGINS
    const corsOrigins = process.env.CORS_ORIGINS;
    if (corsOrigins) {
      return corsOrigins.split(',').map(origin => origin.trim());
    }
    
    // Final fallback to hardcoded values
    return isProduction 
      ? ['https://agentworld.online', 'https://www.agentworld.online'] 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];
  }
  /**
   * Create enhanced rate limiter configuration
   */
  private static createRateLimiter() {
    // More lenient rate limits for development
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    const windowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || (isDevelopment ? '300000' : '900000')); // 5 min dev, 15 min prod
    const maxRequests = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || (isDevelopment ? '1000' : '100')); // 1000 dev, 100 prod
    
    return rateLimit({
      windowMs,
      max: maxRequests,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => {
        // Skip rate limiting for health checks, dev endpoints, auth endpoints, and admin endpoints (with proper auth)
        return req.path === '/health' || 
               req.path === '/api/health' ||
               req.path.startsWith('/api/dev/') ||
               req.path.startsWith('/api/auth/') ||
               req.path.startsWith('/api/payments/pricing') ||
               (req.path.startsWith('/api/admin') && (req as any).user?.isAdmin);
      },
      keyGenerator: (req: Request) => {
        // Use user ID if authenticated, otherwise IP (with proper IPv6 handling)
        const userId = (req as any).user?.id;
        if (userId) {
          return `user:${userId}`;
        }
        
        // Handle IP detection for production environments with proxies/load balancers
        const forwardedFor = req.headers['x-forwarded-for'];
        const realIp = req.headers['x-real-ip'];
        const clientIp = req.ip || req.connection.remoteAddress;
        
        // Use the first IP from x-forwarded-for if available, otherwise use x-real-ip or client IP
        const ip = forwardedFor ? forwardedFor.toString().split(',')[0].trim() : 
                   realIp ? realIp.toString() : 
                   clientIp || 'unknown';
        
        return ipKeyGenerator(ip);
      },
      // Note: onLimitReached might not be available in all versions of express-rate-limit
      // Using standardHeaders and legacyHeaders for rate limit info instead
    });
  }
}
