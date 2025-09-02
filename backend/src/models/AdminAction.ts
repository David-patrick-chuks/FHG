import mongoose, { Document, Schema, Model } from 'mongoose';
import { IAdminAction } from '../types';

export interface IAdminActionDocument extends IAdminAction, Document {
  getActionSummary(): string;
  isRecentAction(minutes: number): boolean;
}

export interface IAdminActionModel extends Model<IAdminActionDocument> {
  findByAdminId(adminId: string): Promise<IAdminActionDocument[]>;
  findByTargetType(targetType: string): Promise<IAdminActionDocument[]>;
  findByTargetId(targetId: string): Promise<IAdminActionDocument[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<IAdminActionDocument[]>;
  getAdminActivityStats(adminId: string, days: number): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    recentActions: number;
    averageActionsPerDay: number;
  }>;
  getSystemActivityStats(days: number): Promise<{
    totalActions: number;
    uniqueAdmins: number;
    actionsByType: Record<string, number>;
    actionsByTarget: Record<string, number>;
    averageActionsPerDay: number;
  }>;
}

export class AdminActionModel {
  private static instance: IAdminActionModel;

  public static getInstance(): IAdminActionModel {
    if (!AdminActionModel.instance) {
      AdminActionModel.instance = AdminActionModel.createModel();
    }
    return AdminActionModel.instance;
  }

  private static createModel(): IAdminActionModel {
    const adminActionSchema = new Schema<IAdminActionDocument>({
      adminId: {
        type: String,
        required: true,
        ref: 'User'
      },
      action: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
      },
      targetType: {
        type: String,
        required: true,
        trim: true,
        enum: ['user', 'bot', 'campaign', 'subscription', 'system', 'other']
      },
      targetId: {
        type: String,
        required: true,
        trim: true
      },
      details: {
        type: Schema.Types.Mixed,
        default: {}
      },
      ipAddress: {
        type: String,
        required: true,
        trim: true
      },
      userAgent: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      }
    }, {
      timestamps: true
    });

    // Indexes
    adminActionSchema.index({ adminId: 1 });
    adminActionSchema.index({ targetType: 1 });
    adminActionSchema.index({ targetId: 1 });
    adminActionSchema.index({ action: 1 });
    adminActionSchema.index({ createdAt: 1 });
    adminActionSchema.index({ ipAddress: 1 });

    // Compound indexes
    adminActionSchema.index({ adminId: 1, createdAt: -1 });
    adminActionSchema.index({ targetType: 1, targetId: 1 });
    adminActionSchema.index({ adminId: 1, targetType: 1 });

    // Instance methods
    adminActionSchema.methods.getActionSummary = function(): string {
      return `${this.action} on ${this.targetType} (${this.targetId})`;
    };

    adminActionSchema.methods.isRecentAction = function(minutes: number): boolean {
      const now = new Date();
      const actionTime = this.createdAt;
      const timeDiff = now.getTime() - actionTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      return minutesDiff <= minutes;
    };

    // Static methods
    adminActionSchema.statics.findByAdminId = function(adminId: string): Promise<IAdminActionDocument[]> {
      return this.find({ adminId }).sort({ createdAt: -1 });
    };

    adminActionSchema.statics.findByTargetType = function(targetType: string): Promise<IAdminActionDocument[]> {
      return this.find({ targetType }).sort({ createdAt: -1 });
    };

    adminActionSchema.statics.findByTargetId = function(targetId: string): Promise<IAdminActionDocument[]> {
      return this.find({ targetId }).sort({ createdAt: -1 });
    };

    adminActionSchema.statics.findByDateRange = function(startDate: Date, endDate: Date): Promise<IAdminActionDocument[]> {
      return this.find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ createdAt: -1 });
    };

    adminActionSchema.statics.getAdminActivityStats = async function(adminId: string, days: number): Promise<{
      totalActions: number;
      actionsByType: Record<string, number>;
      recentActions: number;
      averageActionsPerDay: number;
    }> {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await this.aggregate([
        {
          $match: {
            adminId,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            actionsByType: {
              $push: {
                targetType: '$targetType',
                action: '$action'
              }
            }
          }
        }
      ]);

      const result = stats[0] || { totalActions: 0, actionsByType: [] };
      
      // Calculate actions by type
      const actionsByType: Record<string, number> = {};
      result.actionsByType.forEach((item: any) => {
        const key = `${item.targetType}:${item.action}`;
        actionsByType[key] = (actionsByType[key] || 0) + 1;
      });

      // Get recent actions (last 24 hours)
      const recentStartDate = new Date();
      recentStartDate.setDate(recentStartDate.getDate() - 1);
      const recentActions = await this.countDocuments({
        adminId,
        createdAt: { $gte: recentStartDate }
      });

      return {
        totalActions: result.totalActions,
        actionsByType,
        recentActions,
        averageActionsPerDay: days > 0 ? Math.round(result.totalActions / days * 10) / 10 : 0
      };
    };

    adminActionSchema.statics.getSystemActivityStats = async function(days: number): Promise<{
      totalActions: number;
      uniqueAdmins: number;
      actionsByType: Record<string, number>;
      actionsByTarget: Record<string, number>;
      averageActionsPerDay: number;
    }> {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await this.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            uniqueAdmins: { $addToSet: '$adminId' },
            actionsByType: {
              $push: {
                targetType: '$targetType',
                action: '$action'
              }
            },
            actionsByTarget: {
              $push: {
                targetType: '$targetType',
                targetId: '$targetId'
              }
            }
          }
        }
      ]);

      const result = stats[0] || { 
        totalActions: 0, 
        uniqueAdmins: [], 
        actionsByType: [], 
        actionsByTarget: [] 
      };
      
      // Calculate actions by type
      const actionsByType: Record<string, number> = {};
      result.actionsByType.forEach((item: any) => {
        const key = `${item.targetType}:${item.action}`;
        actionsByType[key] = (actionsByType[key] || 0) + 1;
      });

      // Calculate actions by target
      const actionsByTarget: Record<string, number> = {};
      result.actionsByTarget.forEach((item: any) => {
        const key = `${item.targetType}:${item.targetId}`;
        actionsByTarget[key] = (actionsByTarget[key] || 0) + 1;
      });

      return {
        totalActions: result.totalActions,
        uniqueAdmins: result.uniqueAdmins.length,
        actionsByType,
        actionsByTarget,
        averageActionsPerDay: days > 0 ? Math.round(result.totalActions / days * 10) / 10 : 0
      };
    };

    return mongoose.model<IAdminActionDocument, IAdminActionModel>('AdminAction', adminActionSchema);
  }
}

export default AdminActionModel.getInstance();
