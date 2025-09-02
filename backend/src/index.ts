import dotenv from "dotenv";
import { Server } from "./server/Server";

// Load environment variables
dotenv.config();


// Set default environment variables
if (!process.env.PORT) process.env.PORT = '3000';

class Application {
  private server: Server;

  constructor() {
    console.log("🔧 Creating Application instance...");
    this.server = new Server();
    console.log("✅ Application instance ready");
  }

  public async start(): Promise<void> {
    try {
      console.log("🔄 Starting application...");

      // Start the server
      await this.server.start();
      console.log("✅ Server started successfully");

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
  await app.stop();
  process.exit(0);
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
