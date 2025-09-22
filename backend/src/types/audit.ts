// Audit and Activity Types

import { Document } from 'mongoose';

export interface IActivity {
  _id?: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityDocument extends IActivity, Document {
  _id: string;
}

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
