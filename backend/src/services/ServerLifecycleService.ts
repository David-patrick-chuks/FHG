import { Application } from 'express';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { Logger } from '../utils/Logger';

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
      this.logger.info('Starting server initialization...');
      
      // Connect to database first
      await this.database.connect();
      this.logger.info('Database connection established');
      
      // Start HTTP server
      await this.startHttpServer(port);
      
      this.logger.info(`Server successfully started on port ${port}`);
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
    this.logger.info('Server Information:', {
      port: port,
      environment: process.env['NODE_ENV'] || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    });
  }

  /**
   * Gracefully stop the server
   */
  public async stop(): Promise<void> {
    this.logger.info('Initiating server shutdown...');
    
    try {
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
   * Get the server instance
   */
  public getServer(): any {
    return this.server;
  }
}
