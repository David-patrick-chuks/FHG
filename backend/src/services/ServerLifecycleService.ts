import { Application } from 'express';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { Logger } from '../utils/Logger';
import { PaystackService } from './PaystackService';
import { SchedulerService } from './SchedulerService';

export class ServerLifecycleService {
  private app: Application;
  private database: DatabaseConnection;
  private logger: Logger;
  private server: any;

  constructor(app: Application, database: DatabaseConnection) {
    this.app = app;
    this.database = database;
    this.logger = new Logger();
  }

  /**
   * Start the server and establish database connection
   */
  public async start(port: number): Promise<void> {
    try {
      // Only log server initialization in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        this.logger.debug('Starting server initialization...');
      }
      
      // Connect to database first
      await this.database.connect();
      // Only log database connection in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        this.logger.debug('Database connection established');
      }
      
      // Initialize Paystack service
      this.initializePaystack();
      
      // Start scheduler service
      await SchedulerService.start();
      
      // Start HTTP server
      await this.startHttpServer(port);
      
      // Only log server start in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        this.logger.debug(`Server successfully started on port ${port}`);
      }
      this.logServerInfo(port);
      
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Start the HTTP server
   */
  private async startHttpServer(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, () => {
        resolve();
      });

      this.server.on('error', (error: Error) => {
        this.logger.error('Server error occurred:', error);
        reject(error);
      });
    });
  }

  /**
   * Log server information
   */
  private logServerInfo(port: number): void {
    // Only log server info in debug mode
    if (process.env.LOG_LEVEL === 'debug') {
      this.logger.debug('Server Information:', {
        port: port,
        environment: process.env['NODE_ENV'] || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      });
    }
  }

  /**
   * Gracefully stop the server
   */
  public async stop(): Promise<void> {
    this.logger.info('Initiating server shutdown...');
    
    try {
      // Stop scheduler service
      await SchedulerService.stop();
      
      // Stop HTTP server
      if (this.server) {
        await this.stopHttpServer();
        this.logger.info('HTTP server stopped');
      }

      // Disconnect database
      await this.database.disconnect();
      this.logger.info('Database connection closed');
      
      this.logger.info('Server shutdown completed successfully');
      
    } catch (error) {
      this.logger.error('Error during server shutdown:', error);
      throw error;
    }
  }

  /**
   * Stop the HTTP server
   */
  private async stopHttpServer(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server.close(() => {
        this.server = null;
        resolve();
      });
    });
  }

  /**
   * Get server status information
   */
  public getStatus(port: number): { running: boolean; port: number; uptime: number } {
    return {
      running: this.server && this.server.listening,
      port: port,
      uptime: process.uptime()
    };
  }

  /**
   * Initialize Paystack service
   */
  private initializePaystack(): void {
    try {
      const paystackConfig = {
        secretKey: process.env.PAYSTACK_SECRET_KEY || '',
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
        baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co'
      };

      if (!paystackConfig.secretKey || !paystackConfig.publicKey) {
        this.logger.warn('Paystack configuration incomplete. Payment features will be disabled.');
        return;
      }

      PaystackService.initialize(paystackConfig);
      // Only log Paystack initialization in debug mode
      if (process.env.LOG_LEVEL === 'debug') {
        this.logger.debug('Paystack service initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Paystack service:', error);
    }
  }

  /**
   * Get the server instance
   */
  public getServer(): any {
    return this.server;
  }
}
