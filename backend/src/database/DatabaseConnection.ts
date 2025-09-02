import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { Logger } from '../utils/Logger';


export class DatabaseConnection {
  private connection: Connection | null = null;
  private logger: Logger;
  private readonly uri: string;

  constructor() {
    this.logger = new Logger();
    this.uri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/email-outreach-bot';
    
    // Set max listeners for mongoose connection to prevent warnings
    require('mongoose').connection.setMaxListeners(20);
  }

  public async connect(): Promise<void> {
    try {
      if (this.connection) {
        this.logger.info('Database already connected');
        return;
      }

      const options: ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        connectTimeoutMS: 10000, // 10 second connection timeout
      };

      // Connect to MongoDB with timeout
      const connectPromise = mongoose.connect(this.uri, options);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 15000);
      });
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      this.connection = mongoose.connection;

      // Wait for connection to be ready
      if (this.connection.readyState !== 1) {
        throw new Error('Database connection not ready after connect');
      }

      // Connection event handlers - remove existing listeners first to prevent duplicates
      this.connection.removeAllListeners('connected');
      this.connection.removeAllListeners('error');
      this.connection.removeAllListeners('disconnected');
      this.connection.removeAllListeners('reconnected');

      this.connection.on('connected', () => {
        this.logger.info('MongoDB connected successfully');
      });

      this.connection.on('error', (error: Error) => {
        this.logger.error('MongoDB connection error:', error);
      });

      this.connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected');
      });

      this.connection.on('reconnected', () => {
        this.logger.info('MongoDB reconnected');
      });

      // Note: Graceful shutdown is handled in the main Application class
      // to avoid duplicate event listeners

      this.logger.info('Database connection established');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        // Remove all event listeners before disconnecting
        this.connection.removeAllListeners('connected');
        this.connection.removeAllListeners('error');
        this.connection.removeAllListeners('disconnected');
        this.connection.removeAllListeners('reconnected');
        
        // Close the connection
        await mongoose.disconnect();
        
        // Clean up the connection reference
        this.connection = null;
        
        this.logger.info('Database disconnected successfully');
      }
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
      // Even if there's an error, clean up the reference
      this.connection = null;
      throw error;
    }
    
    // Also clean up mongoose global connection
    try {
      if (mongoose.connection) {
        mongoose.connection.removeAllListeners();
      }
    } catch (e) {
      // Ignore errors during cleanup
    }
  }

  public getConnection(): Connection | null {
    return this.connection;
  }

  public isConnected(): boolean {
    return this.connection?.readyState === 1;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        return false;
      }
      
      // Ping the database
      await mongoose.connection.db?.admin().ping();
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  public async createIndexes(): Promise<void> {
    try {
      // This will be called after connection to ensure all indexes are created
      this.logger.info('Creating database indexes...');
      
      // Import all models to ensure they're registered
      await import('../models/User');
      await import('../models/Bot');
      await import('../models/Campaign');
      await import('../models/SentEmail');
      await import('../models/QueueJob');
      await import('../models/Subscription');
      await import('../models/AdminAction');
      
      this.logger.info('Database indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create database indexes:', error);
      throw error;
    }
  }
}
