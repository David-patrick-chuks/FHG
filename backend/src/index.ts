import dotenv from 'dotenv';
import { DatabaseConnection } from './database/DatabaseConnection';
import { Server } from './server/Server';
import { Logger } from './utils/Logger';

// Load environment variables
dotenv.config();

class Application {
  private server: Server;
  private database: DatabaseConnection;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.database = new DatabaseConnection();
    this.server = new Server();
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await this.database.connect();
      this.logger.info('Database connected successfully');

      // Start the server
      await this.server.start();
      this.logger.info('Server started successfully');

      // Graceful shutdown handling
      this.setupGracefulShutdown();
    } catch (error) {
      this.logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Stop accepting new requests
        await this.server.stop();
        this.logger.info('Server stopped');

        // Close database connection
        await this.database.disconnect();
        this.logger.info('Database disconnected');

        this.logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
