import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';

export class Server {
  private app: Application;
  private port: number;
  private server: any;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000', 10);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Simple health check route
    this.app.get('/health', (_req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    });

    // Simple test route
    this.app.get('/test', (_req, res) => {
      res.json({ 
        message: 'Hello from main server!',
        timestamp: new Date().toISOString()
      });
    });

    // API routes placeholder
    this.app.get('/api', (_req, res) => {
      res.json({ 
        message: 'API endpoint ready',
        timestamp: new Date().toISOString()
      });
    });
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`🚀 Main server running on port ${this.port}`);
          console.log(`📍 Health check: http://localhost:${this.port}/health`);
          console.log(`📍 Test endpoint: http://localhost:${this.port}/test`);
          console.log(`📍 API endpoint: http://localhost:${this.port}/api`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          console.error('Server error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Failed to start server:', error);
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error: Error) => {
          if (error) {
            console.error('Error closing server:', error);
            reject(error);
          } else {
            console.log('✅ Server stopped successfully');
            this.server = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  public getApp(): Application {
    return this.app;
  }
}
