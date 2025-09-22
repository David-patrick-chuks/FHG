import { Request, Response, NextFunction } from 'express';
import { SystemActivityLogger } from '../services/SystemActivityLogger';
import { Logger } from '../utils/Logger';

/**
 * Middleware to automatically log system activities for API requests
 */
export class SystemActivityMiddleware {
  private static logger: Logger = new Logger();

  /**
   * Middleware to log API performance metrics
   */
  public static logApiPerformance = (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      const responseSize = data ? JSON.stringify(data).length : 0;

      // Log slow requests (> 5 seconds)
      if (duration > 5000) {
        SystemActivityLogger.logPerformanceEvent(
          'slow_query',
          `Slow API request: ${req.method} ${req.originalUrl} took ${duration}ms`,
          'medium',
          {
            method: req.method,
            url: req.originalUrl,
            duration,
            responseSize,
            statusCode: res.statusCode,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          }
        );
      }

      // Log large responses (> 1MB)
      if (responseSize > 1024 * 1024) {
        SystemActivityLogger.logPerformanceEvent(
          'high_memory',
          `Large API response: ${req.method} ${req.originalUrl} returned ${responseSize} bytes`,
          'low',
          {
            method: req.method,
            url: req.originalUrl,
            responseSize,
            statusCode: res.statusCode,
            ip: req.ip
          }
        );
      }

      return originalSend.call(this, data);
    };

    next();
  };

  /**
   * Middleware to log API errors
   */
  public static logApiErrors = (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;

    res.send = function(data: any) {
      // Log 4xx and 5xx errors
      if (res.statusCode >= 400) {
        const severity = res.statusCode >= 500 ? 'high' : 'medium';
        
        SystemActivityLogger.logSystemEvent(
          res.statusCode >= 500 ? 'SYSTEM_ERROR' as any : 'SECURITY_LOGIN_FAILED' as any,
          `API Error: ${res.statusCode}`,
          `${req.method} ${req.originalUrl} returned ${res.statusCode}`,
          severity,
          'api',
          {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: (req as any).user?.id || 'anonymous'
          }
        );
      }

      return originalSend.call(this, data);
    };

    next();
  };

  /**
   * Middleware to log rate limiting events
   */
  public static logRateLimit = (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;

    res.send = function(data: any) {
      // Check if this is a rate limit response
      if (res.statusCode === 429) {
        SystemActivityLogger.logPerformanceEvent(
          'rate_limit',
          `Rate limit exceeded for ${req.ip}`,
          'medium',
          {
            ip: req.ip,
            method: req.method,
            url: req.originalUrl,
            userAgent: req.get('User-Agent'),
            userId: (req as any).user?.id || 'anonymous'
          }
        );
      }

      return originalSend.call(this, data);
    };

    next();
  };

  /**
   * Middleware to log memory usage warnings
   */
  public static logMemoryUsage = (req: Request, res: Response, next: NextFunction): void => {
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    // Log if memory usage is high (> 500MB)
    if (memUsageMB > 500) {
      SystemActivityLogger.logPerformanceEvent(
        'high_memory',
        `High memory usage detected: ${memUsageMB}MB`,
        'high',
        {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          external: memUsage.external,
          rss: memUsage.rss,
          method: req.method,
          url: req.originalUrl
        }
      );
    }

    next();
  };

  /**
   * Middleware to log suspicious activity patterns
   */
  public static logSuspiciousActivity = (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const url = req.originalUrl;

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /eval\(/i, // Code injection
      /javascript:/i, // JavaScript injection
      /onload=/i, // Event handler injection
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(url) || pattern.test(userAgent || '')
    );

    if (isSuspicious) {
      SystemActivityLogger.logSecurityEvent(
        'suspicious_activity',
        `Suspicious request pattern detected from ${ip}`,
        'high',
        {
          ip,
          userAgent,
          url,
          method: req.method,
          headers: req.headers,
          body: req.body
        }
      );
    }

    next();
  };
}
