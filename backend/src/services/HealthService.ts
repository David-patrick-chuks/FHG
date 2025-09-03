import os from 'os';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { Logger } from '../utils/Logger';

export class HealthService {
  private database: DatabaseConnection;
  private logger: Logger;

  constructor(database: DatabaseConnection) {
    this.database = database;
    this.logger = new Logger();
  }

  /**
   * Get comprehensive health status
   */
  public async getHealthStatus(server: any): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Get database health status
      const dbStatus = await this.getDatabaseHealth();
      
      // Get system metrics
      const systemMetrics = this.getSystemMetrics();
      
      // Get application metrics
      const appMetrics = this.getApplicationMetrics(server);
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: {
          process: Math.round(process.uptime()), // seconds
          system: Math.round(systemMetrics.cpu.uptime) // seconds
        },
        environment: process.env['NODE_ENV'] || 'development',
        
        // Database health
        database: {
          status: dbStatus.status,
          connected: dbStatus.connected,
          responseTime: dbStatus.responseTime, // milliseconds
          lastCheck: dbStatus.lastCheck,
          stats: dbStatus.stats
        },
        
        // System metrics
        system: {
          memory: systemMetrics.memory,
          cpu: systemMetrics.cpu,
          platform: systemMetrics.platform,
          nodeVersion: systemMetrics.nodeVersion,
          processId: systemMetrics.processId
        },
        
        // Application metrics
        application: {
          version: process.env['APP_VERSION'] || '1.0.0',
          buildNumber: process.env['BUILD_NUMBER'] || 'dev',
          responseTime: responseTime, // milliseconds
          activeConnections: server ? server.connections : 0,
          routes: this.getRouteCount(server)
        },
        
        // Performance indicators
        performance: {
          responseTime: responseTime, // milliseconds
          memoryUsage: systemMetrics.memory.usage, // MB
          processUptime: Math.round(process.uptime()) // seconds
        }
      };
      
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get database health status
   */
  private async getDatabaseHealth(): Promise<{
    connected: boolean;
    responseTime: number;
    lastCheck: string;
    status: string;
    stats?: any;
  }> {
    const startTime = Date.now();
    try {
      const isConnected = this.database.isConnected();
      const healthCheck = await this.database.healthCheck();
      const stats = await this.database.getStats();
      const responseTime = Date.now() - startTime;
      
      return {
        connected: isConnected && healthCheck,
        responseTime,
        lastCheck: new Date().toISOString(),
        status: healthCheck ? 'healthy' : 'unhealthy',
        stats: stats ? {
          collections: stats.collections,
          indexes: stats.indexes,
          dataSize: stats.dataSize, // bytes
          storageSize: stats.storageSize, // bytes
          dataSizeMB: Math.round(stats.dataSize / 1024 / 1024), // MB for display
          storageSizeMB: Math.round(stats.storageSize / 1024 / 1024) // MB for display
        } : null
      };
    } catch (error) {
      return {
        connected: false,
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        status: 'error'
      };
    }
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): {
    memory: {
      usage: number;
      total: number;
      free: number;
      percentage: number;
    };
    cpu: {
      loadAverage: number[];
      uptime: number;
    };
    platform: string;
    nodeVersion: string;
    processId: number;
  } {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    
    return {
      memory: {
        usage: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(totalMem / 1024 / 1024), // MB
        free: Math.round(freeMem / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / totalMem) * 100)
      },
      cpu: {
        loadAverage: process.platform === 'win32' ? [0, 0, 0] : os.loadavg(), // Windows doesn't support loadavg
        uptime: os.uptime()
      },
      platform: process.platform,
      nodeVersion: process.version,
      processId: process.pid
    };
  }

  /**
   * Get application metrics
   */
  private getApplicationMetrics(server: any): {
    version: string;
    buildNumber: string;
    activeConnections: number;
    routes: number;
  } {
    return {
      version: process.env['APP_VERSION'] || '1.0.0',
      buildNumber: process.env['BUILD_NUMBER'] || 'dev',
      activeConnections: server ? server.connections : 0,
      routes: this.getRouteCount(server)
    };
  }

  /**
   * Get route count for metrics
   */
  private getRouteCount(server: any): number {
    try {
      // Use the Routes class method to get accurate route count
      const Routes = require('../routes').Routes;
      if (Routes && Routes.getRouteCount) {
        const routeCount = Routes.getRouteCount();
        if (routeCount > 0) {
          return routeCount;
        }
      }
      
      // Fallback: count routes manually based on known structure
      // This is more reliable than trying to parse Express internals
      let totalRoutes = 0;
      
      // Main routes from Routes class
      totalRoutes += 2; // /health and /version
      
      // Auth routes (8 routes)
      totalRoutes += 8;
      
      // Bot routes (typically 6 routes)
      totalRoutes += 6;
      
      // Campaign routes (typically 8 routes)
      totalRoutes += 8;
      
      // Dashboard routes (typically 4 routes)
      totalRoutes += 4;
      
      // Subscription routes (typically 6 routes)
      totalRoutes += 6;
      
      // Admin routes (typically 8 routes)
      totalRoutes += 8;
      
      // Queue routes (typically 4 routes)
      totalRoutes += 4;
      
      return totalRoutes;
      
    } catch (error) {
      this.logger.warn('Could not count routes:', error);
      return -1; // Use -1 to indicate counting failed
    }
  }
}
