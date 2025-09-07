import { apiClient } from '../api-client';
import { Incident } from './incidents';

export interface SystemStatus {
  status: string;
  timestamp: string;
  uptime: {
    process: number;
    system: number;
  };
  environment: string;
  database: {
    status: string;
    connected: boolean;
    responseTime: number;
    lastCheck: string;
    stats?: {
      collections: number;
      indexes: number;
      dataSizeMB: number;
      storageSizeMB: number;
    };
  };
  system: {
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
  };
  application: {
    version: string;
    buildNumber: string;
    responseTime: number;
    activeConnections: number;
    routes: number;
  };
  performance: {
    responseTime: number;
    memoryUsage: number;
    processUptime: number;
  };
  incidents: Incident[];
}

export class SystemStatusAPI {
  /**
   * Get comprehensive system status
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    try {
      console.log('Making API call to /system-status...');
      const response = await apiClient.get('/system-status');
      console.log('API response received:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // The API client returns the data directly, not wrapped in a response object
      return response as SystemStatus;
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      throw new Error('Failed to fetch system status');
    }
  }

  /**
   * Get basic health check
   */
  static async getHealthCheck(): Promise<{ success: boolean; message: string; timestamp: string; uptime: number; environment: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data as { success: boolean; message: string; timestamp: string; uptime: number; environment: string };
    } catch (error) {
      console.error('Failed to fetch health check:', error);
      throw new Error('Failed to fetch health check');
    }
  }
}


