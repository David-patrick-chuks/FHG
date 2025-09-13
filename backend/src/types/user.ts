// User and Authentication Types

import { BillingCycle, SubscriptionTier } from './common';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  password: string;
  subscription: SubscriptionTier;
  billingCycle: BillingCycle;
  subscriptionExpiresAt: Date;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  apiKey?: string;
  apiKeyCreatedAt?: Date;
  apiKeyLastUsed?: Date;
}

export interface IAdminAction {
  _id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// Request Types
export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
