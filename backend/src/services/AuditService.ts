import { Logger } from '../utils/Logger';
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  _id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  requestId: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  metadata: {
    subscriptionTier?: string;
    isAdmin?: boolean;
    sessionId?: string;
  };
}

const auditLogSchema = new Schema<IAuditLog>({
  userId: { type: String, index: true },
  userEmail: { type: String, index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: { type: String, index: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String, required: true, index: true },
  userAgent: { type: String, required: true },
  requestId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  success: { type: Boolean, required: true, index: true },
  errorMessage: { type: String },
  metadata: {
    subscriptionTier: { type: String },
    isAdmin: { type: Boolean },
    sessionId: { type: String }
  }
}, {
  timestamps: true
});

// Indexes for performance
auditLogSchema.index({ timestamp: -1, userId: 1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

export class AuditService {
  private static logger: Logger = new Logger();
  private static auditModel: Model<IAuditLog>;

  public static initialize(): void {
    try {
      this.auditModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
      AuditService.logger.info('Audit service initialized successfully');
    } catch (error) {
      AuditService.logger.error('Failed to initialize audit service:', error);
    }
  }

  /**
   * Log user authentication events
   */
  public static async logAuthEvent(
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'mfa_enabled' | 'mfa_disabled',
    userId: string,
    userEmail: string,
    ipAddress: string,
    userAgent: string,
    requestId: string,
    success: boolean,
    errorMessage?: string,
    metadata?: any
  ): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action,
      resource: 'authentication',
      details: { action, ...metadata },
      ipAddress,
      userAgent,
      requestId,
      success,
      errorMessage,
      metadata: {
        subscriptionTier: metadata?.subscriptionTier,
        isAdmin: metadata?.isAdmin
      }
    });
  }

  /**
   * Log data access events
   */
  public static async logDataAccess(
    action: 'read' | 'create' | 'update' | 'delete' | 'export',
    userId: string,
    userEmail: string,
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    requestId: string,
    success: boolean,
    details?: any,
    errorMessage?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      requestId,
      success,
      errorMessage,
      metadata: {
        subscriptionTier: details?.subscriptionTier,
        isAdmin: details?.isAdmin
      }
    });
  }

  /**
   * Log payment events
   */
  public static async logPaymentEvent(
    action: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'subscription_created' | 'subscription_updated',
    userId: string,
    userEmail: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    requestId: string,
    success: boolean,
    details?: any,
    errorMessage?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action,
      resource: 'payment',
      resourceId,
      details,
      ipAddress,
      userAgent,
      requestId,
      success,
      errorMessage,
      metadata: {
        subscriptionTier: details?.subscriptionTier,
        isAdmin: details?.isAdmin
      }
    });
  }

  /**
   * Log admin actions
   */
  public static async logAdminAction(
    action: string,
    adminId: string,
    adminEmail: string,
    resource: string,
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    requestId: string,
    success: boolean,
    details?: any,
    errorMessage?: string
  ): Promise<void> {
    await this.logEvent({
      userId: adminId,
      userEmail: adminEmail,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
      requestId,
      success,
      errorMessage,
      metadata: {
        isAdmin: true,
        subscriptionTier: details?.subscriptionTier
      }
    });
  }

  /**
   * Log security events
   */
  public static async logSecurityEvent(
    action: 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access' | 'data_breach_attempt',
    ipAddress: string,
    userAgent: string,
    requestId: string,
    details?: any,
    userId?: string,
    userEmail?: string
  ): Promise<void> {
    await this.logEvent({
      userId,
      userEmail,
      action,
      resource: 'security',
      details,
      ipAddress,
      userAgent,
      requestId,
      success: false, // Security events are typically failures
      errorMessage: details?.reason,
      metadata: {
        isAdmin: details?.isAdmin,
        subscriptionTier: details?.subscriptionTier
      }
    });
  }

  /**
   * Core logging method
   */
  private static async logEvent(eventData: Partial<IAuditLog>): Promise<void> {
    try {
      if (!this.auditModel) {
        AuditService.logger.warn('Audit model not initialized, skipping audit log');
        return;
      }

      const auditLog = new this.auditModel({
        ...eventData,
        timestamp: new Date()
      });

      await auditLog.save();

      // Also log to application logs for immediate visibility
      AuditService.logger.info('Audit Event', {
        action: eventData.action,
        resource: eventData.resource,
        userId: eventData.userId,
        success: eventData.success,
        requestId: eventData.requestId
      });

    } catch (error) {
      AuditService.logger.error('Failed to log audit event:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        eventData
      });
    }
  }

  /**
   * Get audit logs for a specific user
   */
  public static async getUserAuditLogs(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<IAuditLog[]> {
    try {
      if (!this.auditModel) {
        throw new Error('Audit model not initialized');
      }

      return await this.auditModel
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(offset)
        .exec();
    } catch (error) {
      AuditService.logger.error('Failed to get user audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for a specific resource
   */
  public static async getResourceAuditLogs(
    resource: string,
    resourceId?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<IAuditLog[]> {
    try {
      if (!this.auditModel) {
        throw new Error('Audit model not initialized');
      }

      const query: any = { resource };
      if (resourceId) {
        query.resourceId = resourceId;
      }

      return await this.auditModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(offset)
        .exec();
    } catch (error) {
      AuditService.logger.error('Failed to get resource audit logs:', error);
      throw error;
    }
  }

  /**
   * Get security events
   */
  public static async getSecurityEvents(
    limit: number = 100,
    offset: number = 0
  ): Promise<IAuditLog[]> {
    try {
      if (!this.auditModel) {
        throw new Error('Audit model not initialized');
      }

      return await this.auditModel
        .find({ resource: 'security' })
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(offset)
        .exec();
    } catch (error) {
      AuditService.logger.error('Failed to get security events:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  public static async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      if (!this.auditModel) {
        throw new Error('Audit model not initialized');
      }

      const query = {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      };

      const [
        totalEvents,
        successfulEvents,
        failedEvents,
        authEvents,
        dataAccessEvents,
        paymentEvents,
        securityEvents,
        adminEvents
      ] = await Promise.all([
        this.auditModel.countDocuments(query),
        this.auditModel.countDocuments({ ...query, success: true }),
        this.auditModel.countDocuments({ ...query, success: false }),
        this.auditModel.countDocuments({ ...query, resource: 'authentication' }),
        this.auditModel.countDocuments({ ...query, resource: { $in: ['user', 'campaign', 'bot', 'contact'] } }),
        this.auditModel.countDocuments({ ...query, resource: 'payment' }),
        this.auditModel.countDocuments({ ...query, resource: 'security' }),
        this.auditModel.countDocuments({ ...query, 'metadata.isAdmin': true })
      ]);

      return {
        period: { startDate, endDate },
        summary: {
          totalEvents,
          successfulEvents,
          failedEvents,
          successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0
        },
        breakdown: {
          authentication: authEvents,
          dataAccess: dataAccessEvents,
          payments: paymentEvents,
          security: securityEvents,
          adminActions: adminEvents
        },
        generatedAt: new Date()
      };
    } catch (error) {
      AuditService.logger.error('Failed to generate compliance report:', error);
      throw error;
    }
  }
}
