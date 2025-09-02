import dotenv from "dotenv";
import { Server } from "./server/Server";

// Load environment variables
dotenv.config();


// Set default environment variables
if (!process.env.PORT) process.env.PORT = '3000';
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
if (!process.env.RATE_LIMIT_WINDOW_MS) process.env.RATE_LIMIT_WINDOW_MS = '900000';
if (!process.env.RATE_LIMIT_MAX_REQUESTS) process.env.RATE_LIMIT_MAX_REQUESTS = '100';
if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = 'info';

class Application {
  private server: Server;

  constructor() {
    console.log("🔧 Creating Application instance...");
    console.log("📋 Features enabled:");
    console.log("   ✅ Express server with TypeScript");
    console.log("   ✅ Security middleware (Helmet, CORS)");
    console.log("   ✅ Rate limiting and compression");
    console.log("   ✅ Request logging and error handling");
    console.log("   ✅ API routes (Auth, Campaigns, Bots, etc.)");
    console.log("   ✅ Winston logging system");
    
    this.server = new Server();
    console.log("✅ Application instance ready");
  }

  public async start(): Promise<void> {
    try {
      console.log("🔄 Starting application...");

      // Start the server
      await this.server.start();
      console.log("✅ Server started successfully");

      // Display server information
      const serverInfo = this.server.getServerInfo();
      console.log("📊 Server Information:");
      console.log(`   Port: ${serverInfo.port}`);
      console.log(`   Environment: ${serverInfo.environment}`);
      console.log(`   Node Version: ${serverInfo.nodeVersion}`);
      console.log(`   Platform: ${serverInfo.platform}`);

      console.log("🎉 Application started successfully!");
    } catch (error) {
      console.error("❌ Failed to start application:", error);
      if (error instanceof Error) {
        console.error("Stack trace:", error.stack);
      }
      throw error;
    }
  }

  public async stop(): Promise<void> {
    console.log("🛑 Stopping application...");
    try {
      // Display final server stats
      const stats = this.server.getStats();
      console.log("📊 Final Server Stats:");
      console.log(`   Uptime: ${Math.round(stats.uptime)}s`);
      console.log(`   Memory: ${Math.round(stats.memory.heapUsed / 1024 / 1024)}MB used`);
      
      await this.server.stop();
      console.log("✅ Server stopped");
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
    }
  }
}

// ----------------------------------------------------
// 🔹 Bootstrapping
// ----------------------------------------------------

const app = new Application();

app.start().catch((error) => {
  console.error("❌ Failed to start application:", error);
  process.exit(1);
});

// ----------------------------------------------------
// 🔹 Simple Process Handlers
// ----------------------------------------------------

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`⚠️ Received ${signal}. Starting graceful shutdown...`);
  console.log("🔄 Cleaning up resources...");
  
  try {
    await app.stop();
    console.log("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
