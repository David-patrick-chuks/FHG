import { NextFunction, Request, Response } from 'express';
import { Logger } from '../utils/Logger';

export class RequestLogger {
  private static logger: Logger = new Logger();

  public static log(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const originalSend = res.send;

    // Override res.send to capture response data
    res.send = function(data: any): Response {
      const responseTime = Date.now() - startTime;
      RequestLogger.logRequest(req, res, responseTime, data);
      return originalSend.call(this, data);
    };

    // Only log request start for important endpoints
    if (RequestLogger.shouldLogRequest(req)) {
      RequestLogger.logRequestStart(req);
    }

    next();
  }

  private static shouldLogRequest(req: Request): boolean {
    const url = req.originalUrl || req.url;
    
    // Only log important endpoints
    const importantEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/logout',
      '/api/payments/initialize',
      '/api/payments/verify',
      '/api/payments/webhook',
      '/api/bots',
      '/api/campaigns',
      '/api/admin'
    ];
    
    // Log if it's an important endpoint or if it's an error
    return importantEndpoints.some(endpoint => url.startsWith(endpoint));
  }

  private static logRequestStart(req: Request): void {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id || 'anonymous'
    };

    RequestLogger.logger.info('Request started', logData);
  }

  private static logRequest(req: Request, res: Response, responseTime: number, responseData?: any): void {
    const url = req.originalUrl || req.url;
    
    // Only log important requests or errors
    if (!RequestLogger.shouldLogRequest(req) && res.statusCode < 400) {
      return;
    }

    const logData: any = {
      method: req.method,
      url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: (req as any).user?.id || 'anonymous'
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      RequestLogger.logger.error('Server error', logData);
    } else if (res.statusCode >= 400) {
      RequestLogger.logger.warn('Client error', logData);
    } else if (RequestLogger.shouldLogRequest(req)) {
      RequestLogger.logger.info('Request completed', logData);
    }

    // Log slow requests (only for important endpoints)
    if (responseTime > 2000 && RequestLogger.shouldLogRequest(req)) {
      RequestLogger.logger.warn('Slow request', {
        ...logData,
        threshold: '2000ms'
      });
    }

    // Log very slow requests
    if (responseTime > 5000) {
      RequestLogger.logger.error('Very slow request', {
        ...logData,
        threshold: '5000ms'
      });
    }
  }

  // Method to log specific request types
  public static logAuthRequest(req: Request, success: boolean, details?: any): void {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      success,
      details,
      timestamp: new Date().toISOString()
    };

    if (success) {
      RequestLogger.logger.info('Authentication successful', logData);
    } else {
      RequestLogger.logger.warn('Authentication failed', logData);
    }
  }

  // Method to log file uploads
  public static logFileUpload(req: Request, fileInfo: any, success: boolean): void {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id || 'anonymous',
      fileName: fileInfo?.originalname,
      fileSize: fileInfo?.size,
      fileType: fileInfo?.mimetype,
      success,
      timestamp: new Date().toISOString()
    };

    if (success) {
      RequestLogger.logger.info('File upload successful', logData);
    } else {
      RequestLogger.logger.error('File upload failed', logData);
    }
  }

  // Method to log admin actions
  public static logAdminAction(req: Request, action: string, targetType: string, targetId: string, success: boolean): void {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      adminId: (req as any).user?.id || 'unknown',
      action,
      targetType,
      targetId,
      success,
      timestamp: new Date().toISOString()
    };

    if (success) {
      RequestLogger.logger.info('Admin action successful', logData);
    } else {
      RequestLogger.logger.error('Admin action failed', logData);
    }
  }

  // Method to log email operations
  public static logEmailOperation(req: Request, operation: string, recipient: string, success: boolean, details?: any): void {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id || 'anonymous',
      operation,
      recipient,
      success,
      details,
      timestamp: new Date().toISOString()
    };

    if (success) {
      RequestLogger.logger.info('Email operation successful', logData);
    } else {
      RequestLogger.logger.error('Email operation failed', logData);
    }
  }

  // Method to get request statistics
  public static getRequestStats(): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowRequestCount: number;
  } {
    // This would typically integrate with a metrics collection system
    // For now, we'll return placeholder data
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      slowRequestCount: 0
    };
  }
}
