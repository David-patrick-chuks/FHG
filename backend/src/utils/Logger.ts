import fs from 'fs';
import path from 'path';
import winston from 'winston';

export class Logger {
  private logger: winston.Logger;
  private readonly logDir: string;
  private readonly logLevel: string;

  constructor() {
    this.logDir = process.env['LOG_FILE_PATH'] || './logs';
    this.logLevel = process.env['LOG_LEVEL'] || 'info';
    
    // Ensure log directory exists
    this.ensureLogDirectory();
    
    this.logger = this.createLogger();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
          metaStr = JSON.stringify(meta, null, 2);
        }
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    );

    return winston.createLogger({
      level: this.logLevel,
      format: logFormat,
      transports: [
        // Console transport
        new winston.transports.Console({
          format: consoleFormat,
          level: this.logLevel
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(this.logDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // File transport for error logs only
        new winston.transports.File({
          filename: path.join(this.logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        
        // File transport for info logs only
        new winston.transports.File({
          filename: path.join(this.logDir, 'info.log'),
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        })
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(this.logDir, 'exceptions.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(this.logDir, 'rejections.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  public silly(message: string, meta?: any): void {
    this.logger.silly(message, meta);
  }

  // Method to log HTTP requests
  public logRequest(req: any, res: any, responseTime: number): void {
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || 'anonymous'
    };

    if (res.statusCode >= 400) {
      this.warn('HTTP Request', logData);
    } else {
      this.info('HTTP Request', logData);
    }
  }

  // Method to log database operations
  public logDatabase(operation: string, collection: string, duration: number, success: boolean): void {
    const logData = {
      operation,
      collection,
      duration: `${duration}ms`,
      success
    };

    if (success) {
      this.debug('Database Operation', logData);
    } else {
      this.error('Database Operation Failed', logData);
    }
  }

  // Method to log email operations
  public logEmail(operation: string, recipient: string, status: string, duration?: number): void {
    const logData = {
      operation,
      recipient,
      status,
      duration: duration ? `${duration}ms` : undefined
    };

    if (status === 'success') {
      this.info('Email Operation', logData);
    } else if (status === 'failed') {
      this.error('Email Operation Failed', logData);
    } else {
      this.warn('Email Operation', logData);
    }
  }

  // Method to log admin actions
  public logAdminAction(adminId: string, action: string, targetType: string, targetId: string, details?: any): void {
    this.info('Admin Action', {
      adminId,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Method to get logger instance (for advanced usage)
  public getLogger(): winston.Logger {
    return this.logger;
  }

  public close(): void {
    try {
      this.logger.close();
    } catch (error) {
      // Ignore errors during cleanup
      console.error('Error closing logger:', error);
    }
  }
}
