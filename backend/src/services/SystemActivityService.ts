import { SystemActivityModel, ISystemActivityDocument } from '../models/SystemActivity';
import { ActivityType } from '../types';
import { ApiResponse } from '../types';
import { Logger } from '../utils/Logger';

export class SystemActivityService {
  private static logger: Logger = new Logger();

  /**
   * Create a new system activity
   */
  public static async createSystemActivity(data: {
    type: ActivityType;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'error' | 'maintenance' | 'backup' | 'security' | 'performance' | 'other';
    source: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<ISystemActivityDocument>> {
    try {
      const activity = await SystemActivityModel.createSystemActivity(data);

      // Log important system activities
      if (data.severity === 'high' || data.severity === 'critical') {
        SystemActivityService.logger.error('Critical system activity created', {
          type: data.type,
          title: data.title,
          severity: data.severity,
          source: data.source,
          activityId: activity._id
        });
      } else {
        SystemActivityService.logger.info('System activity created', {
          type: data.type,
          title: data.title,
          severity: data.severity,
          source: data.source,
          activityId: activity._id
        });
      }

      return {
        success: true,
        data: activity,
        message: 'System activity created successfully',
        timestamp: new Date()
      };
    } catch (error) {
      SystemActivityService.logger.error('Error creating system activity:', error);
      return {
        success: false,
        message: 'Failed to create system activity',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get system activities with filtering
   */
  public static async getSystemActivities(params: {
    limit?: number;
    skip?: number;
    days?: number;
    type?: ActivityType;
    severity?: string;
    category?: string;
    resolved?: boolean;
  }): Promise<ApiResponse<ISystemActivityDocument[]>> {
    try {
      const activities = await SystemActivityModel.getSystemActivities(params);

      return {
        success: true,
        data: activities,
        message: 'System activities retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      SystemActivityService.logger.error('Error retrieving system activities:', error);
      return {
        success: false,
        message: 'Failed to retrieve system activities',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get system activity statistics
   */
  public static async getSystemActivityStats(days: number = 7): Promise<ApiResponse<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    activitiesBySeverity: Record<string, number>;
    activitiesByCategory: Record<string, number>;
    resolvedCount: number;
    unresolvedCount: number;
    averageResolutionTime: number;
  }>> {
    try {
      const stats = await SystemActivityModel.getSystemActivityStats(days);

      return {
        success: true,
        data: stats,
        message: 'System activity statistics retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      SystemActivityService.logger.error('Error retrieving system activity statistics:', error);
      return {
        success: false,
        message: 'Failed to retrieve system activity statistics',
        timestamp: new Date()
      };
    }
  }

  /**
   * Resolve a system activity
   */
  public static async resolveActivity(
    activityId: string, 
    resolvedBy: string
  ): Promise<ApiResponse<ISystemActivityDocument>> {
    try {
      const activity = await SystemActivityModel.resolveActivity(activityId, resolvedBy);

      if (!activity) {
        return {
          success: false,
          message: 'System activity not found',
          timestamp: new Date()
        };
      }

      SystemActivityService.logger.info('System activity resolved', {
        activityId,
        resolvedBy,
        type: activity.type,
        title: activity.title
      });

      return {
        success: true,
        data: activity,
        message: 'System activity resolved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      SystemActivityService.logger.error('Error resolving system activity:', error);
      return {
        success: false,
        message: 'Failed to resolve system activity',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get recent critical system activities
   */
  public static async getCriticalActivities(hours: number = 24): Promise<ApiResponse<ISystemActivityDocument[]>> {
    try {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      const activities = await SystemActivityModel.find({
        timestamp: { $gte: startDate },
        severity: { $in: ['high', 'critical'] },
        resolved: false
      })
      .sort({ timestamp: -1 })
      .limit(20);

      return {
        success: true,
        data: activities,
        message: 'Critical system activities retrieved successfully',
        timestamp: new Date()
      };
    } catch (error) {
      SystemActivityService.logger.error('Error retrieving critical system activities:', error);
      return {
        success: false,
        message: 'Failed to retrieve critical system activities',
        timestamp: new Date()
      };
    }
  }

  /**
   * Create system activities for common events
   */
  public static async logSystemEvent(
    type: ActivityType,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    source: string = 'system',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const category = this.getCategoryFromType(type);
      await this.createSystemActivity({
        type,
        title,
        description,
        severity,
        category,
        source,
        metadata
      });
    } catch (error) {
      SystemActivityService.logger.error('Error logging system event:', error);
    }
  }

  /**
   * Helper method to determine category from activity type
   */
  private static getCategoryFromType(type: ActivityType): 'error' | 'maintenance' | 'backup' | 'security' | 'performance' | 'other' {
    switch (type) {
      case ActivityType.SYSTEM_ERROR:
        return 'error';
      case ActivityType.SYSTEM_MAINTENANCE:
        return 'maintenance';
      case ActivityType.SYSTEM_BACKUP:
      case ActivityType.SYSTEM_RESTORE:
        return 'backup';
      case ActivityType.SECURITY_LOGIN_ATTEMPT:
      case ActivityType.SECURITY_LOGIN_FAILED:
      case ActivityType.SECURITY_PASSWORD_RESET:
      case ActivityType.SECURITY_ACCOUNT_LOCKED:
      case ActivityType.SECURITY_ACCOUNT_UNLOCKED:
      case ActivityType.SECURITY_SUSPICIOUS_ACTIVITY:
        return 'security';
      default:
        return 'other';
    }
  }
}
