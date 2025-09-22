import { SystemActivityService } from './SystemActivityService';
import { IncidentService } from './IncidentService';
import { ActivityType } from '../types';
import { Logger } from '../utils/Logger';

/**
 * Utility service for logging system activities throughout the application
 * Provides convenient methods for common system events
 */
export class SystemActivityLogger {
  private static logger: Logger = new Logger();

  /**
   * Log database-related system activities
   */
  static async logDatabaseEvent(
    event: 'connection' | 'disconnection' | 'error' | 'maintenance',
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventMap = {
      connection: { type: ActivityType.SYSTEM_MAINTENANCE, title: 'Database Connected' },
      disconnection: { type: ActivityType.SYSTEM_ERROR, title: 'Database Disconnected' },
      error: { type: ActivityType.SYSTEM_ERROR, title: 'Database Error' },
      maintenance: { type: ActivityType.SYSTEM_MAINTENANCE, title: 'Database Maintenance' }
    };

    const eventInfo = eventMap[event];
    await this.logSystemEvent(
      eventInfo.type,
      eventInfo.title,
      details,
      severity,
      'database',
      metadata
    );
  }

  /**
   * Log authentication and security events
   */
  static async logSecurityEvent(
    event: 'login_failed' | 'invalid_token' | 'unauthorized_access' | 'suspicious_activity',
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventMap = {
      login_failed: { type: ActivityType.SECURITY_LOGIN_FAILED, title: 'Login Failed' },
      invalid_token: { type: ActivityType.SECURITY_LOGIN_FAILED, title: 'Invalid Token' },
      unauthorized_access: { type: ActivityType.SECURITY_LOGIN_FAILED, title: 'Unauthorized Access' },
      suspicious_activity: { type: ActivityType.SECURITY_SUSPICIOUS_ACTIVITY, title: 'Suspicious Activity' }
    };

    const eventInfo = eventMap[event];
    await this.logSystemEvent(
      eventInfo.type,
      eventInfo.title,
      details,
      severity,
      'security',
      metadata
    );
  }

  /**
   * Log API and performance events
   */
  static async logPerformanceEvent(
    event: 'rate_limit' | 'high_memory' | 'slow_query' | 'timeout',
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventMap = {
      rate_limit: { type: ActivityType.SYSTEM_ERROR, title: 'Rate Limit Exceeded' },
      high_memory: { type: ActivityType.SYSTEM_ERROR, title: 'High Memory Usage' },
      slow_query: { type: ActivityType.SYSTEM_ERROR, title: 'Slow Database Query' },
      timeout: { type: ActivityType.SYSTEM_ERROR, title: 'Request Timeout' }
    };

    const eventInfo = eventMap[event];
    await this.logSystemEvent(
      eventInfo.type,
      eventInfo.title,
      details,
      severity,
      'performance',
      metadata
    );
  }

  /**
   * Log maintenance and operational events
   */
  static async logMaintenanceEvent(
    event: 'backup' | 'restore' | 'update' | 'restart' | 'cleanup',
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventMap = {
      backup: { type: ActivityType.SYSTEM_BACKUP, title: 'System Backup' },
      restore: { type: ActivityType.SYSTEM_RESTORE, title: 'System Restore' },
      update: { type: ActivityType.SYSTEM_MAINTENANCE, title: 'System Update' },
      restart: { type: ActivityType.SYSTEM_MAINTENANCE, title: 'System Restart' },
      cleanup: { type: ActivityType.SYSTEM_MAINTENANCE, title: 'System Cleanup' }
    };

    const eventInfo = eventMap[event];
    await this.logSystemEvent(
      eventInfo.type,
      eventInfo.title,
      details,
      severity,
      'maintenance',
      metadata
    );
  }

  /**
   * Log application-specific events
   */
  static async logApplicationEvent(
    event: 'user_registration' | 'subscription_change' | 'payment_processed' | 'email_sent',
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    metadata?: Record<string, any>
  ): Promise<void> {
    const eventMap = {
      user_registration: { type: ActivityType.USER_REGISTERED, title: 'User Registration' },
      subscription_change: { type: ActivityType.SUBSCRIPTION_UPDATED, title: 'Subscription Updated' },
      payment_processed: { type: ActivityType.PAYMENT_COMPLETED, title: 'Payment Processed' },
      email_sent: { type: ActivityType.EMAIL_SENT, title: 'Email Sent' }
    };

    const eventInfo = eventMap[event];
    await this.logSystemEvent(
      eventInfo.type,
      eventInfo.title,
      details,
      severity,
      'application',
      metadata
    );
  }

  /**
   * Generic method to log any system event
   */
  static async logSystemEvent(
    type: ActivityType,
    title: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    source: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await SystemActivityService.logSystemEvent(
        type,
        title,
        description,
        severity,
        source,
        metadata
      );
    } catch (error) {
      // Don't let logging errors break application flow
      SystemActivityLogger.logger.error('Failed to log system activity:', error);
    }
  }

  /**
   * Log critical system errors that require immediate attention
   */
  static async logCriticalError(
    title: string,
    description: string,
    source: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logSystemEvent(
      ActivityType.SYSTEM_ERROR,
      title,
      description,
      'critical',
      source,
      metadata
    );

    // Automatically create incident for critical errors
    try {
      await IncidentService.createIncidentFromSystemActivity({
        title,
        description,
        severity: 'critical',
        source,
        metadata
      });
    } catch (error) {
      SystemActivityLogger.logger.error('Failed to create incident from critical error:', error);
    }
  }

  /**
   * Log system warnings that should be monitored
   */
  static async logWarning(
    title: string,
    description: string,
    source: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logSystemEvent(
      ActivityType.SYSTEM_ERROR,
      title,
      description,
      'high',
      source,
      metadata
    );
  }

  /**
   * Log informational system events
   */
  static async logInfo(
    title: string,
    description: string,
    source: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logSystemEvent(
      ActivityType.SYSTEM_MAINTENANCE,
      title,
      description,
      'low',
      source,
      metadata
    );
  }
}
