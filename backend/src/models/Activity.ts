import mongoose, { Document, Schema } from 'mongoose';
import { ActivityType, IActivity } from '../types';
import { Logger } from '../utils/Logger';


export interface IActivityDocument extends IActivity, Document {
  _id: string;
}

const activitySchema = new Schema<IActivityDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(ActivityType),
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'activities'
});

// Indexes for better query performance
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ userId: 1, type: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

// Static methods
activitySchema.statics.createActivity = async function(
  userId: string,
  type: ActivityType,
  title: string,
  description: string,
  metadata?: Record<string, any>
): Promise<IActivityDocument> {
  const activity = new this({
    userId,
    type,
    title,
    description,
    metadata: metadata || {},
    timestamp: new Date()
  });
  
  return await activity.save();
};

activitySchema.statics.getUserActivities = async function(
  userId: string,
  limit: number = 50,
  skip: number = 0,
  types?: ActivityType[]
): Promise<IActivityDocument[]> {
  const query: any = { userId };
  
  if (types && types.length > 0) {
    query.type = { $in: types };
  }
  
  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

activitySchema.statics.getActivityStats = async function(
  userId: string,
  days: number = 30
): Promise<Record<string, number>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const pipeline = [
    {
      $match: {
        userId,
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ];
  
  const results = await this.aggregate(pipeline);
  
  const stats: Record<string, number> = {};
  results.forEach(result => {
    stats[result._id] = result.count;
  });
  
  return stats;
};

activitySchema.statics.getUnreadCount = async function(
  userId: string
): Promise<number> {
  return await this.countDocuments({
    userId,
    isRead: false
  });
};

activitySchema.statics.markAllAsRead = async function(
  userId: string
): Promise<void> {
  await this.updateMany(
    { userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

activitySchema.statics.markAsRead = async function(
  activityId: string,
  userId: string
): Promise<boolean> {
  const result = await this.updateOne(
    { _id: activityId, userId },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
  return result.modifiedCount > 0;
};

// Instance methods
activitySchema.methods.toJSON = function() {
  const obj = this.toObject();
  return {
    id: obj._id,
    type: obj.type,
    title: obj.title,
    description: obj.description,
    metadata: obj.metadata,
    timestamp: obj.timestamp,
    time: this.formatTimeAgo(obj.timestamp)
  };
};

activitySchema.methods.formatTimeAgo = function(timestamp: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(timestamp).getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};

export class ActivityModel {
  private static instance: mongoose.Model<IActivityDocument> | null = null;
  private static logger: Logger = new Logger();

  public static getInstance(): mongoose.Model<IActivityDocument> {
    if (!ActivityModel.instance) {
      try {
        ActivityModel.instance = mongoose.model<IActivityDocument>('Activity', activitySchema);
        // Only log model initialization in debug mode
        if (process.env.LOG_LEVEL === 'debug') {
          ActivityModel.logger.debug('Activity model initialized successfully');
        }
      } catch (error) {
        ActivityModel.logger.error('Error initializing Activity model:', error);
        throw error;
      }
    }
    return ActivityModel.instance;
  }

  public static async createActivity(
    userId: string,
    type: ActivityType,
    title: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<IActivityDocument> {
    const model = ActivityModel.getInstance();
    return await (model as any).createActivity(userId, type, title, description, metadata);
  }

  public static async getUserActivities(
    userId: string,
    limit: number = 50,
    skip: number = 0,
    types?: ActivityType[]
  ): Promise<IActivityDocument[]> {
    const model = ActivityModel.getInstance();
    return await (model as any).getUserActivities(userId, limit, skip, types);
  }

  public static async getActivityStats(
    userId: string,
    days: number = 30
  ): Promise<Record<string, number>> {
    const model = ActivityModel.getInstance();
    return await (model as any).getActivityStats(userId, days);
  }

  public static async getUnreadCount(
    userId: string
  ): Promise<number> {
    const model = ActivityModel.getInstance();
    return await (model as any).getUnreadCount(userId);
  }

  public static async markAllAsRead(
    userId: string
  ): Promise<void> {
    const model = ActivityModel.getInstance();
    return await (model as any).markAllAsRead(userId);
  }

  public static async markAsRead(
    activityId: string,
    userId: string
  ): Promise<boolean> {
    const model = ActivityModel.getInstance();
    return await (model as any).markAsRead(activityId, userId);
  }
}
