// Core Types for Email Outreach Bot

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
}

export interface IBot {
  _id: string;
  userId: string;
  name: string;
  description: string;
  email: string;
  password: string; // encrypted
  prompt: string;
  isActive: boolean;
  dailyEmailCount: number;
  lastEmailSentAt?: Date;
  profileImage?: string; // RoboHash URL for bot profile image
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaign {
  _id: string;
  userId: string;
  botId: string;
  name: string;
  description: string;
  status: CampaignStatus;
  emailList: string[];
  aiMessages: string[];
  selectedMessageIndex: number;
  sentEmails: ISentEmail[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ISentEmail {
  _id: string;
  campaignId: string;
  botId: string;
  recipientEmail: string;
  message: string;
  status: EmailStatus;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
}

export interface IQueueJob {
  _id: string;
  campaignId: string;
  botId: string;
  recipientEmail: string;
  message: string;
  priority: number;
  status: QueueJobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledFor: Date;
  processedAt?: Date;
  errorMessage?: string;
}

export interface ISubscription {
  _id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  paymentMethod: PaymentMethod;
  amount: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

// Enums
export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  READY = 'ready',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  OPENED = 'opened',
  REPLIED = 'replied',
  FAILED = 'failed',
  BOUNCED = 'bounced'
}

export enum QueueJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  OTHER = 'other'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export interface SubscriptionUpgradeRequest {
  subscription: SubscriptionTier;
  billingCycle: BillingCycle;
}

export interface ChangeBillingCycleRequest {
  billingCycle: BillingCycle;
}

export interface CreateBotRequest {
  name: string;
  description: string;
  email: string;
  password: string;
  prompt: string;
  profileImage?: string; // Optional custom profile image URL
}

export interface UpdateBotRequest {
  name?: string;
  description?: string;
  email?: string;
  password?: string;
  prompt?: string;
  isActive?: boolean;
  profileImage?: string; // Optional custom profile image URL
}

export interface CreateCampaignRequest {
  name: string;
  description: string;
  botId: string;
  emailList: string[];
}

export interface UpdateSubscriptionRequest {
  userId: string;
  tier: SubscriptionTier;
  duration: number; // in months
  paymentMethod: PaymentMethod;
  amount: number;
}

export interface CreateSubscriptionRequest {
  tier: SubscriptionTier;
  duration: number; // in months
  paymentMethod: PaymentMethod;
  amount: number;
}

// Utility Types
export type ObjectId = string;
export type Email = string;
export type Username = string;
export type Password = string;

// Tracking Types
export interface TrackingStats {
  campaignId: string;
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  replied: number;
  failed: number;
  bounced: number;
  deliveryRate: number;
  openRate: number;
  replyRate: number;
}

export interface TrackingLog {
  emailId: string;
  recipientEmail: string;
  status: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
}

export interface TrackingLogsResponse {
  campaignId: string;
  logs: TrackingLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserTrackingSummary {
  totalCampaigns: number;
  totalEmails: number;
  totalOpened: number;
  averageOpenRate: number;
  topPerformingCampaigns: Array<{
    campaignId: string;
    openRate: number;
    totalEmails: number;
  }>;
}

// Environment Configuration
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GEMINI_API_KEY: string;
  REDIS_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_SECRET_KEY: string;
}
