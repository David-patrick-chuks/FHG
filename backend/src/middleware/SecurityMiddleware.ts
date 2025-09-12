import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Logger } from '../utils/Logger';

export class SecurityMiddleware {
  private static logger: Logger = new Logger();

  /**
   * Enhanced security headers for bank-level protection
   */
  public static enhancedSecurityHeaders(req: Request, res: Response, next: NextFunction): void {
    // Additional security headers beyond Helmet
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy for API
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  }

  /**
   * Request ID generation for audit trails
   */
  public static generateRequestId(req: Request, res: Response, next: NextFunction): void {
    const requestId = crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    res.locals.requestId = requestId;
    next();
  }

  /**
   * Security event logging
   */
  public static logSecurityEvent(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    
    // Only log important security events
    const url = req.originalUrl || req.url;
    const importantEndpoints = ['/api/auth/', '/api/payments/', '/api/admin/'];
    
    if (importantEndpoints.some(endpoint => url.startsWith(endpoint))) {
      SecurityMiddleware.logger.info('API Request', {
        requestId: res.locals.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      });
    }

    // Override res.end to log response (only for important endpoints or errors)
    const originalEnd = res.end.bind(res);
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      const responseTime = Date.now() - startTime;
      
      // Only log responses for important endpoints or errors
      if (importantEndpoints.some(endpoint => url.startsWith(endpoint)) || res.statusCode >= 400) {
        SecurityMiddleware.logger.info('API Response', {
          requestId: res.locals.requestId,
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`
        });
      }

      return originalEnd(chunk, encoding, cb);
    };

    next();
  }

  /**
   * Suspicious activity detection
   */
  public static detectSuspiciousActivity(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || '';
    const url = req.originalUrl;

    // Check for common attack patterns
    const suspiciousPatterns = [
      /\.\.\//,  // Directory traversal
      /<script/i,  // XSS attempts
      /union.*select/i,  // SQL injection
      /eval\(/i,  // Code injection
      /javascript:/i,  // JavaScript injection
      /onload=/i,  // Event handler injection
      /<iframe/i,  // Iframe injection
      /<object/i,  // Object injection
      /<embed/i,  // Embed injection
      /<form/i,  // Form injection
      /document\.cookie/i,  // Cookie access attempts
      /window\.location/i,  // Location manipulation
      /alert\(/i,  // Alert injection
      /confirm\(/i,  // Confirm injection
      /prompt\(/i,  // Prompt injection
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(userAgent)
    );

    if (isSuspicious) {
      SecurityMiddleware.logger.warn('Suspicious activity detected', {
        requestId: res.locals.requestId,
        ip,
        userAgent,
        url,
        timestamp: new Date().toISOString()
      });

      // Block suspicious requests
      res.status(403).json({
        success: false,
        message: 'Request blocked for security reasons',
        requestId: res.locals.requestId,
        timestamp: new Date()
      });
      return;
    }

    next();
  }

  /**
   * Rate limiting per user (beyond global rate limiting)
   */
  private static userRequestCounts = new Map<string, { count: number; resetTime: number }>();

  public static userRateLimit(req: Request, res: Response, next: NextFunction): void {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next();
    }

    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 1000; // Per user limit

    const userKey = `user:${userId}`;
    const userData = SecurityMiddleware.userRequestCounts.get(userKey);

    if (!userData || now > userData.resetTime) {
      // Reset or initialize
      SecurityMiddleware.userRequestCounts.set(userKey, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userData.count >= maxRequests) {
      SecurityMiddleware.logger.warn('User rate limit exceeded', {
        requestId: res.locals.requestId,
        userId,
        count: userData.count,
        resetTime: new Date(userData.resetTime)
      });

      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded for user',
        retryAfter: Math.ceil((userData.resetTime - now) / 1000),
        requestId: res.locals.requestId,
        timestamp: new Date()
      });
      return;
    }

    userData.count++;
    next();
  }

  /**
   * Data sanitization for sensitive information
   */
  public static sanitizeResponse(req: Request, res: Response, next: NextFunction): void {
    const originalJson = res.json;
    
    res.json = function(obj: any) {
      // Remove sensitive data from responses
      if (obj && typeof obj === 'object') {
        // Check if this is an API key related endpoint that needs to preserve apiKey
        const isApiKeyEndpoint = req.path.includes('/api-keys/') || 
                                req.path.includes('/profile') ||
                                req.path.includes('/auth/profile') ||
                                req.path.includes('/auth/stats') ||
                                req.path.includes('/dashboard');
        
        // Since we're using HTTP-only cookies, we don't need to allow tokens in responses
        obj = SecurityMiddleware.removeSensitiveData(obj, false, isApiKeyEndpoint);
      }
      
      return originalJson.call(this, obj);
    };

    next();
  }

  private static removeSensitiveData(obj: any, isAuthResponse: boolean = false, allowApiKey: boolean = false, depth: number = 0, visited: WeakSet<any> = new WeakSet()): any {
    // Prevent infinite recursion
    if (depth > 10) {
      return '[Circular Reference]';
    }

    if (Array.isArray(obj)) {
      return obj.map(item => SecurityMiddleware.removeSensitiveData(item, isAuthResponse, allowApiKey, depth + 1, visited));
    }

    if (obj && typeof obj === 'object') {
      // Check for circular references
      if (visited.has(obj)) {
        return '[Circular Reference]';
      }
      visited.add(obj);

      // Handle Date objects - preserve them as ISO strings
      if (obj instanceof Date) {
        return obj.toISOString();
      }

      // Handle Mongoose documents by converting to plain object
      let plainObj = obj;
      if (obj.toObject && typeof obj.toObject === 'function') {
        plainObj = obj.toObject();
      } else if (obj.toJSON && typeof obj.toJSON === 'function') {
        plainObj = obj.toJSON();
      }

      const sanitized = { ...plainObj };
      
      // Fix any date objects that might have been corrupted during conversion
      Object.keys(sanitized).forEach(key => {
        const value = sanitized[key];
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Check if this looks like a corrupted date object (has numeric keys)
          const keys = Object.keys(value);
          if (keys.length > 0 && keys.every(k => /^\d+$/.test(k))) {
            // Try to reconstruct the date string
            const dateString = keys.map(k => value[k]).join('');
            if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
              sanitized[key] = dateString;
            }
          }
        }
      });
      
      // Remove sensitive fields
      const sensitiveFields = [
        'password', 'secret', 'ssn', 'creditCard',
        'privateKey', 'authorization'
      ];

      // Only remove apiKey if not explicitly allowed
      if (!allowApiKey) {
        sensitiveFields.push('apiKey');
      }

      // Only remove tokens if it's not an auth response
      if (!isAuthResponse) {
        sensitiveFields.push('token', 'refreshToken');
      }

      sensitiveFields.forEach(field => {
        if (field in sanitized) {
          delete sanitized[field];
        }
      });

      // Recursively sanitize nested objects
      Object.keys(sanitized).forEach(key => {
        if (sanitized[key] && typeof sanitized[key] === 'object') {
          sanitized[key] = SecurityMiddleware.removeSensitiveData(sanitized[key], isAuthResponse, allowApiKey, depth + 1, visited);
        }
      });

      return sanitized;
    }

    return obj;
  }
}
