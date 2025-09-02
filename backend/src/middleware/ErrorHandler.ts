import { NextFunction, Request, Response } from 'express';
import { Logger } from '../utils/Logger';

export class ErrorHandler {
  private static logger: Logger = new Logger();

  public static handle(error: any, req: Request, res: Response, next: NextFunction): void {
    // Log the error
    ErrorHandler.logger.error('Error occurred:', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || 'anonymous'
    });

    // Determine error type and status code
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details: any = null;

    // Handle different types of errors
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      details = this.formatValidationErrors(error);
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format';
    } else if (error.name === 'MongoError') {
      if (error.code === 11000) {
        statusCode = 409;
        message = 'Duplicate entry';
        details = this.formatDuplicateError(error);
      } else {
        statusCode = 500;
        message = 'Database Error';
      }
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Unauthorized';
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403;
      message = 'Forbidden';
    } else if (error.name === 'NotFoundError') {
      statusCode = 404;
      message = 'Resource not found';
    } else if (error.name === 'RateLimitExceeded') {
      statusCode = 429;
      message = 'Too many requests';
    } else if (error.status) {
      statusCode = error.status;
      message = error.message || 'Error occurred';
    } else if (error.message) {
      message = error.message;
    }

    // Don't expose internal errors in production
    if (process.env['NODE_ENV'] === 'production' && statusCode === 500) {
      message = 'Internal Server Error';
      details = null;
    }

    // Send error response
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env['NODE_ENV'] === 'development' ? error.message : undefined,
      details: process.env['NODE_ENV'] === 'development' ? details : undefined,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    });
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

  // Method to handle 404 errors
  public static notFound(req: Request, res: Response, next: NextFunction): void {
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
}
