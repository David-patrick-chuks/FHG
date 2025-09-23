import mongoose, { Document, Schema } from 'mongoose';

export interface ISession {
  userId: string;
  sessionId: string;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
  };
  isActive: boolean;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
}

export interface ISessionDocument extends ISession, Document {
  invalidateSession(): Promise<void>;
}

export interface ISessionModel extends mongoose.Model<ISessionDocument> {
  createSession(userId: string, sessionId: string, deviceInfo?: any): Promise<ISessionDocument>;
  invalidateUserSessions(userId: string, excludeSessionId?: string): Promise<void>;
  getActiveSessions(userId: string): Promise<ISessionDocument[]>;
  updateLastAccessed(sessionId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}

const sessionSchema = new Schema<ISessionDocument>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceInfo: {
    userAgent: {
      type: String,
      trim: true
    },
    ipAddress: {
      type: String,
      trim: true
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ sessionId: 1, isActive: 1 });
sessionSchema.index({ expiresAt: 1 });

// Static methods
sessionSchema.statics.createSession = async function(
  userId: string, 
  sessionId: string, 
  deviceInfo?: any
): Promise<ISessionDocument> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

  const session = new this({
    userId,
    sessionId,
    deviceInfo,
    expiresAt
  });

  return await session.save();
};

sessionSchema.statics.invalidateUserSessions = async function(
  userId: string, 
  excludeSessionId?: string
): Promise<void> {
  const query: any = { userId, isActive: true };
  
  if (excludeSessionId) {
    query.sessionId = { $ne: excludeSessionId };
  }

  await this.updateMany(query, { 
    isActive: false,
    lastAccessedAt: new Date()
  });
};

sessionSchema.statics.getActiveSessions = async function(
  userId: string
): Promise<ISessionDocument[]> {
  return await this.find({ 
    userId, 
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ lastAccessedAt: -1 });
};

sessionSchema.statics.updateLastAccessed = async function(
  sessionId: string
): Promise<void> {
  await this.updateOne(
    { sessionId, isActive: true },
    { lastAccessedAt: new Date() }
  );
};

sessionSchema.statics.cleanupExpiredSessions = async function(): Promise<void> {
  await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, lastAccessedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Remove inactive sessions older than 7 days
    ]
  });
};

// Instance methods
sessionSchema.methods.invalidateSession = async function(): Promise<void> {
  this.isActive = false;
  this.lastAccessedAt = new Date();
  await this.save();
};

export default mongoose.model<ISessionDocument, ISessionModel>('Session', sessionSchema);
