import mongoose, { Document, Model, Schema } from 'mongoose';
import { ActivityType } from '../types';

export interface ISystemActivity {
  _id?: string;
  type: ActivityType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'error' | 'maintenance' | 'backup' | 'security' | 'performance' | 'other';
  source: string; // e.g., 'database', 'api', 'scheduler', 'manual'
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISystemActivityDocument extends ISystemActivity, Document {
  _id: string;
  isRecentActivity(minutes: number): boolean;
}

export interface ISystemActivityModel extends Model<ISystemActivityDocument> {
  getSystemActivities(params: {
    limit?: number;
    skip?: number;
    days?: number;
    type?: ActivityType;
    severity?: string;
    category?: string;
    resolved?: boolean;
  }): Promise<ISystemActivityDocument[]>;
  
  getSystemActivityStats(days: number): Promise<{
    totalActivities: number;
    activitiesByType: Record<string, number>;
    activitiesBySeverity: Record<string, number>;
    activitiesByCategory: Record<string, number>;
    resolvedCount: number;
    unresolvedCount: number;
    averageResolutionTime: number;
  }>;
  
  createSystemActivity(data: {
    type: ActivityType;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'error' | 'maintenance' | 'backup' | 'security' | 'performance' | 'other';
    source: string;
    metadata?: Record<string, any>;
  }): Promise<ISystemActivityDocument>;
  
  resolveActivity(activityId: string, resolvedBy: string): Promise<ISystemActivityDocument | null>;
}

const systemActivitySchema = new Schema<ISystemActivityDocument>({
  type: {
    type: String,
    enum: Object.values(ActivityType),
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['error', 'maintenance', 'backup', 'security', 'performance', 'other'],
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    maxlength: 100
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  resolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'system_activities',
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      return ret;
    }
  }
});

// Indexes for better query performance
systemActivitySchema.index({ timestamp: -1 });
systemActivitySchema.index({ type: 1, timestamp: -1 });
systemActivitySchema.index({ severity: 1, timestamp: -1 });
systemActivitySchema.index({ category: 1, timestamp: -1 });
systemActivitySchema.index({ resolved: 1, timestamp: -1 });
systemActivitySchema.index({ source: 1, timestamp: -1 });

// Instance methods
systemActivitySchema.methods.isRecentActivity = function(minutes: number): boolean {
  const now = new Date();
  const diffInMinutes = (now.getTime() - this.timestamp.getTime()) / (1000 * 60);
  return diffInMinutes <= minutes;
};

// Static methods
systemActivitySchema.statics.getSystemActivities = async function(params: {
  limit?: number;
  skip?: number;
  days?: number;
  type?: ActivityType;
  severity?: string;
  category?: string;
  resolved?: boolean;
}): Promise<ISystemActivityDocument[]> {
  const {
    limit = 50,
    skip = 0,
    days = 7,
    type,
    severity,
    category,
    resolved
  } = params;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const query: any = {
    timestamp: { $gte: startDate }
  };

  if (type) query.type = type;
  if (severity) query.severity = severity;
  if (category) query.category = category;
  if (resolved !== undefined) query.resolved = resolved;

  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

systemActivitySchema.statics.getSystemActivityStats = async function(days: number): Promise<{
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesBySeverity: Record<string, number>;
  activitiesByCategory: Record<string, number>;
  resolvedCount: number;
  unresolvedCount: number;
  averageResolutionTime: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        activitiesByType: {
          $push: '$type'
        },
        activitiesBySeverity: {
          $push: '$severity'
        },
        activitiesByCategory: {
          $push: '$category'
        },
        resolvedCount: {
          $sum: { $cond: ['$resolved', 1, 0] }
        },
        unresolvedCount: {
          $sum: { $cond: ['$resolved', 0, 1] }
        },
        resolutionTimes: {
          $push: {
            $cond: [
              { $and: ['$resolved', '$resolvedAt'] },
              { $subtract: ['$resolvedAt', '$timestamp'] },
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        totalActivities: 1,
        activitiesByType: {
          $reduce: {
            input: '$activitiesByType',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                  ]
                }
              ]
            }
          }
        },
        activitiesBySeverity: {
          $reduce: {
            input: '$activitiesBySeverity',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                  ]
                }
              ]
            }
          }
        },
        activitiesByCategory: {
          $reduce: {
            input: '$activitiesByCategory',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [{ k: '$$this', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] } }]
                  ]
                }
              ]
            }
          }
        },
        resolvedCount: 1,
        unresolvedCount: 1,
        averageResolutionTime: {
          $avg: {
            $filter: {
              input: '$resolutionTimes',
              cond: { $ne: ['$$this', null] }
            }
          }
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  
  if (result.length === 0) {
    return {
      totalActivities: 0,
      activitiesByType: {},
      activitiesBySeverity: {},
      activitiesByCategory: {},
      resolvedCount: 0,
      unresolvedCount: 0,
      averageResolutionTime: 0
    };
  }

  return result[0];
};

systemActivitySchema.statics.createSystemActivity = async function(data: {
  type: ActivityType;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'error' | 'maintenance' | 'backup' | 'security' | 'performance' | 'other';
  source: string;
  metadata?: Record<string, any>;
}): Promise<ISystemActivityDocument> {
  const activity = new this({
    ...data,
    metadata: data.metadata || {},
    timestamp: new Date()
  });
  
  return await activity.save();
};

systemActivitySchema.statics.resolveActivity = async function(
  activityId: string, 
  resolvedBy: string
): Promise<ISystemActivityDocument | null> {
  return await this.findByIdAndUpdate(
    activityId,
    {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy
    },
    { new: true }
  );
};

export const SystemActivityModel = mongoose.model<ISystemActivityDocument, ISystemActivityModel>(
  'SystemActivity',
  systemActivitySchema
);
