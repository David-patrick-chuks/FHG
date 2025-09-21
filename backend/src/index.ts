import dotenv from "dotenv";
import { Server } from "./server/Server";
import { Logger } from "./utils/Logger";


export class Application {
  private server: Server;
  private logger: Logger;
  private isShuttingDown: boolean = false;

  constructor() {
    this.logger = new Logger();
    this.server = new Server();
  }

  public async bootstrap(): Promise<void> {
    try {
      this.logger.info('🚀 Starting Email Outreach Bot Backend...');
      
      this.loadEnvironment();
      
      await this.server.start();
      
      this.logger.info('✅ Backend server started successfully');
      
      this.setupGracefulShutdown();
      
    } catch (error) {
      this.logger.error('❌ Failed to start backend server:', error);
      await this.shutdown(1);
    }
  }

  private loadEnvironment(): void {
    dotenv.config();
    // Only log environment loading in debug mode
    if (process.env.LOG_LEVEL === 'debug') {
      this.logger.debug('📋 Environment configuration loaded');
    }
  }

  private setupGracefulShutdown(): void {
    // Handle shutdown signals
    process.on("SIGTERM", () => this.handleShutdownSignal("SIGTERM"));
    process.on("SIGINT", () => this.handleShutdownSignal("SIGINT"));

    process.on("uncaughtException", (error: Error) => {
      this.logger.error('💥 Uncaught Exception:', error);
      this.handleShutdownSignal("uncaughtException");
    });

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      this.logger.error('💥 Unhandled Rejection:', { reason, promise });
      this.handleShutdownSignal("unhandledRejection");
    });

    this.logger.info('🛡️ Graceful shutdown handlers configured');
  }

  private async handleShutdownSignal(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn(`⚠️ Shutdown already in progress, ignoring ${signal}`);
      return;
    }

    this.logger.info(`⚠️ Received ${signal}. Initiating graceful shutdown...`);
    await this.shutdown(0);
  }

  /**
   * Perform graceful shutdown with proper cleanup
   */
  private async shutdown(exitCode: number): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      // Stop the server
      await this.server.stop();
      this.logger.info('✅ Graceful shutdown completed successfully');
      
    } catch (error) {
      this.logger.error('❌ Error during graceful shutdown:', error);
      exitCode = 1;
    }

    // Exit with appropriate code
    process.exit(exitCode);
  }

  /**
   * Get application status
   */
  public getStatus(): { running: boolean; uptime: number } {
    const serverStatus = this.server.getStatus();
    return {
      running: serverStatus.running,
      uptime: serverStatus.uptime
    };
  }
}

/**
 * Application entry point
 */
async function main(): Promise<void> {
  try {
    const app = new Application();
    await app.bootstrap();
  } catch (error) {
    console.error('💥 Application bootstrap failed:', error);
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Fatal error in main:', error);
    process.exit(1);
  });
}
