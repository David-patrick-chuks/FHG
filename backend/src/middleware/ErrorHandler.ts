import { NextFunction, Request, Response } from 'express';
import { IncidentService } from '../services/IncidentService';
import { SystemActivityService } from '../services/SystemActivityService';
import { ActivityType } from '../types';
import { Logger } from '../utils/Logger';

export class ErrorHandler {
  private static logger: Logger = new Logger();

  public static handle(error: any, req: Request, res: Response, _next: NextFunction): void {
    // Log the error with sanitized information
    ErrorHandler.logger.error('Error occurred:', {
      error: error?.message || 'Unknown error',
      stack: ErrorHandler.sanitizeStack(error?.stack),
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });

    // Determine error type and status code
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details: any = null;
    let isDevelopment = process.env['NODE_ENV'] === 'development';

    // Handle different types of errors and log system activities
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      details = ErrorHandler.formatValidationErrors(error);
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if (error.name === 'MongoError') {
      if (error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate entry';
        details = ErrorHandler.formatDuplicateError(error);
      } else {
        statusCode = 500;
        message = 'Database Error';
        // Log database errors as system activities
        ErrorHandler.logSystemActivity(
          ActivityType.SYSTEM_ERROR,
          'Database Operation Failed',
          `MongoDB error: ${error.message}`,
          'high',
          'database',
          {
            errorCode: error.code,
            operation: req.method,
            endpoint: req.originalUrl,
            userId: (req as any).user?.id || 'anonymous'
          }
        );
      }
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      // Log security events
      ErrorHandler.logSystemActivity(
        ActivityType.SECURITY_LOGIN_FAILED,
        'Invalid JWT Token',
        `Invalid token attempt from ${req.ip}`,
        'medium',
        'security',
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl
        }
      );
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Unauthorized';
      // Log unauthorized access attempts
      ErrorHandler.logSystemActivity(
        ActivityType.SECURITY_LOGIN_FAILED,
        'Unauthorized Access Attempt',
        `Unauthorized access attempt to ${req.originalUrl}`,
        'medium',
        'security',
        {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.originalUrl,
          method: req.method
        }
      );
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403;
      message = 'Forbidden';
    } else if (error.name === 'NotFoundError') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (error.name === 'RateLimitExceeded') {
      statusCode = 429;
      message = 'Too many requests';
      // Log rate limiting events
      ErrorHandler.logSystemActivity(
        ActivityType.SYSTEM_ERROR,
        'Rate Limit Exceeded',
        `Rate limit exceeded for ${req.ip}`,
        'medium',
        'performance',
        {
          ip: req.ip,
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent')
        }
      );
    } else if (error.status) {
      statusCode = error.status;
      message = error.message || 'Error occurred';
    } else if (error.message) {
      message = error.message;
    }

    // Log critical system errors (500 status codes)
    if (statusCode >= 500) {
      ErrorHandler.logSystemActivity(
        ActivityType.SYSTEM_ERROR,
        'Internal Server Error',
        `Unexpected error: ${error.message || 'Unknown error'}`,
        'critical',
        'error',
        {
          errorName: error.name,
          endpoint: req.originalUrl,
          method: req.method,
          userId: (req as any).user?.id || 'anonymous',
          ip: req.ip
        }
      );

      // Create incident for critical errors that affect multiple users
      ErrorHandler.createIncidentForCriticalError(error, req);
    }

    // Don't expose internal errors in production
    if (process.env['NODE_ENV'] === 'production' && statusCode === 500) {
      message = 'Internal Server Error';
      details = null;
    }

    // Send secure error response
    const response: any = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    // Only include sensitive information in development
    if (isDevelopment) {
      response.error = error?.message;
      response.details = details;
      response.path = req.originalUrl;
      response.method = req.method;
    }

    // Add request ID for tracking (if available)
    if (req.headers['x-request-id']) {
      response.requestId = req.headers['x-request-id'];
    }

    res.status(statusCode).json(response);
  }

  private static formatValidationErrors(error: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    if (error.errors) {
      Object.keys(error.errors).forEach(field => {
        const fieldError = error.errors[field];
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(fieldError.message);
      });
    }
    
    return errors;
  }

  private static formatDuplicateError(error: any): Record<string, string> {
    const details: Record<string, string> = {};
    
    if (error.keyValue) {
      Object.keys(error.keyValue).forEach(field => {
        details[field] = `Value '${error.keyValue[field]}' already exists`;
      });
    }
    
    return details;
  }

  // Method to create custom errors
  public static createError(message: string, status: number = 400, name?: string): Error {
    const error: any = new Error(message);
    error.status = status;
    if (name) {
      error.name = name;
    }
    return error;
  }

  // Method to handle async errors
  public static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Sanitize stack trace to prevent information disclosure
  private static sanitizeStack(stack: string | undefined): string | undefined {
    if (!stack) return undefined;

    const isDevelopment = process.env['NODE_ENV'] === 'development';
    
    if (isDevelopment) {
      return stack;
    }

    // In production, only return first few lines and remove sensitive paths
    const lines = stack.split('\n').slice(0, 3);
    return lines.map(line => {
      // Remove file paths and line numbers
      return line.replace(/at\s+.*?\(.*?\)/g, 'at [internal]')
                 .replace(/at\s+.*?:\d+:\d+/g, 'at [internal]')
                 .replace(/\/.*?\//g, '/[path]/');
    }).join('\n');
  }

  // Method to handle 404 errors
  public static notFound(req: Request, _res: Response, next: NextFunction): void {
    const error = ErrorHandler.createError(`Route ${req.originalUrl} not found`, 404, 'NotFoundError');
    next(error);
  }

  // Method to handle unhandled promise rejections
  public static handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    ErrorHandler.logger.error('Unhandled Rejection at:', {
      promise,
      reason,
      stack: reason?.stack
    });
  }

  // Method to handle uncaught exceptions
  public static handleUncaughtException(error: Error): void {
    ErrorHandler.logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });
    
    // Give the process time to log the error before exiting
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }

  // Method to handle graceful shutdown
  public static handleGracefulShutdown(signal: string): void {
    ErrorHandler.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    // Close server and database connections here
    // This will be implemented in the main application
    
    process.exit(0);
  }

  /**
   * Helper method to log system activities
   */
  private static async logSystemActivity(
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
      // Don't let logging errors break the main error handling
      ErrorHandler.logger.error('Failed to log system activity:', logError);
    }
  }

  /**
   * Helper method to create incidents for critical errors
   */
  private static async createIncidentForCriticalError(error: any, req: Request): Promise<void> {
    try {
      // Only create incidents for certain types of critical errors
      const criticalErrorTypes = [
        'MongoError',
        'DatabaseError',
        'ConnectionError',
        'TimeoutError'
      ];

      if (criticalErrorTypes.includes(error.name)) {
        const incidentTitle = `Critical ${error.name}: ${req.originalUrl}`;
        const incidentDescription = `Critical error affecting multiple users: ${error.message}`;

        const result = await IncidentService.createIncidentFromSystemActivity({
          title: incidentTitle,
          description: incidentDescription,
          severity: 'critical',
          source: 'error_handler',
          metadata: {
            errorName: error.name,
            endpoint: req.originalUrl,
            method: req.method,
            userId: (req as any).user?.id || 'anonymous',
            ip: req.ip,
            timestamp: new Date().toISOString()
          }
        });

        // Log the result for monitoring
        if (result.success) {
          ErrorHandler.logger.info('Incident created from critical error', {
            incidentId: result.data?._id,
            errorName: error.name,
            endpoint: req.originalUrl
          });
        } else {
          ErrorHandler.logger.info('Incident creation prevented (duplicate or rate limited)', {
            reason: result.message,
            errorName: error.name,
            endpoint: req.originalUrl
          });
        }
      }
    } catch (incidentError) {
      // Don't let incident creation errors break error handling
      ErrorHandler.logger.error('Failed to create incident for critical error:', incidentError);
    }
  }
}
