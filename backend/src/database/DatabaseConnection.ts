import mongoose, { Connection, ConnectOptions } from 'mongoose';
import { Logger } from '../utils/Logger';
import dotenv from 'dotenv';
dotenv.config();

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: Connection | null = null;
  private readonly uri: string;
  private readonly logger: Logger;
  private isConnecting: boolean = false;

  constructor() {
    this.uri = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/email-outreach-bot';
    this.logger = new Logger();
  }

  /**
   * Get singleton instance of DatabaseConnection
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Establish connection to MongoDB database with retry logic
   */
  public async connect(): Promise<void> {
    if (this.connection?.readyState === 1) {
      this.logger.info('Database already connected');
      return;
    }

    if (this.isConnecting) {
      this.logger.warn('Database connection already in progress');
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
    try {
      this.isConnecting = true;
        this.logger.info(`Initiating database connection... (Attempt ${retryCount + 1}/${maxRetries})`);

      const options: ConnectOptions = {
        maxPoolSize: parseInt(process.env['MONGODB_MAX_POOL_SIZE'] || '10'),
          serverSelectionTimeoutMS: parseInt(process.env['MONGODB_SERVER_SELECTION_TIMEOUT'] || '30000'), // Increased to 30 seconds
        socketTimeoutMS: parseInt(process.env['MONGODB_SOCKET_TIMEOUT'] || '45000'),
        bufferCommands: false,
          connectTimeoutMS: parseInt(process.env['MONGODB_CONNECT_TIMEOUT'] || '30000'), // Increased to 30 seconds
        retryWrites: true,
          w: 'majority',
          // Additional options for Atlas cluster stability
          heartbeatFrequencyMS: 10000,
          maxIdleTimeMS: 30000,
          // Retry configuration
          retryReads: true,
          // Connection pool options
          minPoolSize: 1,
          // Atlas specific options
          directConnection: false,
          // Handle replica set issues
          readPreference: 'primaryPreferred'
      };

      await mongoose.connect(this.uri, options);
      this.connection = mongoose.connection;

      // Wait for connection to be ready
      if (this.connection.readyState !== 1) {
        throw new Error('Database connection not ready after connect');
      }

      this.setupConnectionEventHandlers();
        this.logger.info('✅ Database connected successfully');
        return; // Success, exit retry loop

    } catch (error) {
        retryCount++;
        this.logger.error(`Failed to connect to database (Attempt ${retryCount}/${maxRetries}):`, error);
        
        if (retryCount < maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
          this.logger.info(`Retrying connection in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          this.logger.error('❌ All database connection attempts failed');
      throw error;
        }
    } finally {
      this.isConnecting = false;
      }
    }
  }

  /**
   * Setup event handlers for database connection
   */
  private setupConnectionEventHandlers(): void {
    if (!this.connection) return;

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

    this.connection.on('close', () => {
      this.logger.info('MongoDB connection closed');
    });
  }

  /**
   * Gracefully disconnect from MongoDB database
   */
  public async disconnect(): Promise<void> {
    if (!this.connection) {
      this.logger.info('No database connection to disconnect');
      return;
    }

    try {
      this.logger.info('Disconnecting from database...');
      
      // Remove event listeners to prevent memory leaks
      this.removeConnectionEventHandlers();
      
      await mongoose.disconnect();
      this.connection = null;
      
      this.logger.info('Database disconnected successfully');
      
    } catch (error) {
      this.logger.error('Error during database disconnection:', error);
      // Clean up reference even if disconnection fails
      this.connection = null;
      throw error;
    }
  }

  /**
   * Remove all connection event handlers
   */
  private removeConnectionEventHandlers(): void {
    if (!this.connection) return;

    this.connection.removeAllListeners('connected');
    this.connection.removeAllListeners('error');
    this.connection.removeAllListeners('disconnected');
    this.connection.removeAllListeners('reconnected');
    this.connection.removeAllListeners('close');
  }

  /**
   * Get the current database connection instance
   */
  public getConnection(): Connection | null {
    return this.connection;
  }

  /**
   * Check if the database is currently connected
   */
  public isConnected(): boolean {
    return this.connection?.readyState === 1;
  }

  /**
   * Get database connection status information
   */
  public getConnectionStatus(): {
    connected: boolean;
    readyState: number;
    host: string;
    name: string;
    uri: string;
  } {
    if (!this.connection) {
      return {
        connected: false,
        readyState: 0,
        host: 'unknown',
        name: 'unknown',
        uri: this.uri
      };
    }

    return {
      connected: this.connection.readyState === 1,
      readyState: this.connection.readyState,
      host: this.connection.host || 'unknown',
      name: this.connection.name || 'unknown',
      uri: this.uri
    };
  }

  /**
   * Perform a health check on the database connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        return false;
      }

      // Ping the database to verify connection is alive
      await this.connection?.db?.admin().ping();
      return true;
      
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<{
    collections: number;
    indexes: number;
    dataSize: number;
    storageSize: number;
  } | null> {
    try {
      if (!this.isConnected() || !this.connection?.db) {
        return null;
      }

      const stats = await this.connection.db.stats();
      
      return {
        collections: stats.collections,
        indexes: stats.indexes,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize
      };
      
    } catch (error) {
      this.logger.error('Failed to get database stats:', (error as Error).message);
      return null;
    }
  }
}
