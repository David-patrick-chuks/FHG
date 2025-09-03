import dotenv from "dotenv";
import { Server } from "./server/Server";
import { Logger } from "./utils/Logger";

// Initialize logger
const logger = new Logger();

// Load environment variables
dotenv.config();

// Set default environment variables
if (!process.env.PORT) process.env.PORT = '3000';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
if (!process.env.MONGODB_URI) process.env.MONGODB_URI = 'mongodb://localhost:27017/email-outreach-bot';

/**
 * Main application bootstrap function
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting Email Outreach Bot Backend...');
    logger.info('Environment:', { 
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials
    });

    const server = new Server();
    
    // Start the server
    await server.start();
    
    logger.info('✅ Backend server started successfully');
    
    // Handle graceful shutdown
    setupGracefulShutdown(server);
    
  } catch (error) {
    logger.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(server: Server): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`⚠️ Received ${signal}. Initiating graceful shutdown...`);
    
    try {
      await server.stop();
      logger.info('✅ Graceful shutdown completed successfully');
      process.exit(0);
      
    } catch (error) {
      logger.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    logger.error('💥 Uncaught Exception:', error);
    gracefulShutdown("uncaughtException");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error('💥 Unhandled Rejection:', { reason, promise });
    gracefulShutdown("unhandledRejection");
  });

  logger.info('🛡️ Graceful shutdown handlers configured');
}

// Start the application
bootstrap().catch((error) => {
  logger.error('💥 Bootstrap failed:', error);
  process.exit(1);
});
