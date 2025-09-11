// Core Types for Email Outreach Bot

// Enums
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
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
  RETRYING = 'retrying',
  CANCELLED = 'cancelled'
}

export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum TemplateStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum TemplateCategory {
  SALES = 'sales',
  MARKETING = 'marketing',
  FOLLOW_UP = 'follow_up',
  COLD_OUTREACH = 'cold_outreach',
  NETWORKING = 'networking',
  PARTNERSHIP = 'partnership',
  CUSTOMER_SUCCESS = 'customer_success',
  RECRUITMENT = 'recruitment',
  EVENT_INVITATION = 'event_invitation',
  THANK_YOU = 'thank_you',
  APOLOGY = 'apology',
  REMINDER = 'reminder',
  INTRODUCTION = 'introduction',
  PROPOSAL = 'proposal',
  FEEDBACK_REQUEST = 'feedback_request',
  OTHER = 'other'
}

export enum ActivityType {
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
  BOT_CREATED = 'bot_created',
  BOT_UPDATED = 'bot_updated',
  BOT_DELETED = 'bot_deleted',
  CAMPAIGN_CREATED = 'campaign_created',
  CAMPAIGN_STARTED = 'campaign_started',
  CAMPAIGN_PAUSED = 'campaign_paused',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  CAMPAIGN_CANCELLED = 'campaign_cancelled',
  TEMPLATE_CREATED = 'template_created',
  TEMPLATE_PUBLISHED = 'template_published',
  TEMPLATE_APPROVED = 'template_approved',
  TEMPLATE_REJECTED = 'template_rejected',
  TEMPLATE_USED = 'template_used',
  TEMPLATE_REVIEWED = 'template_reviewed',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPGRADED = 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  PAYMENT_MADE = 'payment_made'
}

export enum PaymentMethod {
  PAYSTACK = 'paystack',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Core Interfaces
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

export interface IBot {
  _id: string;
  userId: string;
  name: string;
  description: string;
  email: string;
  password: string; // encrypted
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
  templateId?: string; // Optional template reference
  name: string;
  description: string;
  status: CampaignStatus;
  emailList: string[];
  aiMessages: string[];
  selectedMessageIndex: number;
  sentEmails: ISentEmail[];
  totalEmails: number;
  sentCount: number;
  failedCount: number;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  cancelledAt?: Date;
  scheduledFor?: Date;
  isScheduled: boolean;
  emailInterval: number; // Interval between emails
  emailIntervalUnit: 'seconds' | 'minutes' | 'hours';
}

export interface ISentEmail {
  _id: string;
  campaignId: string;
  botId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  status: EmailStatus;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
  templateSampleId?: string; // Reference to the template sample used
  aiVariation?: number; // Which AI variation was used (1-20)
}

export interface ITemplateSample {
  _id: string;
  title: string;
  content: string;
  useCase: string;
  variables: ITemplateVariable[];
  createdAt: Date;
}

export interface ITemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface ITemplateReview {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ITemplate {
  _id: string;
  userId: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  status: TemplateStatus;
  isPublic: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  samples: ITemplateSample[];
  tags: string[];
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  reviews: ITemplateReview[];
  featured: boolean;
  featuredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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

export interface IPayment {
  _id: string;
  userId: string;
  subscriptionTier: SubscriptionTier;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  reference: string;
  paystackReference?: string;
  paystackAccessCode?: string;
  authorizationUrl?: string;
  transactionId?: string;
  gatewayResponse?: string;
  paidAt?: Date;
  failureReason?: string;
  metadata: Record<string, any>;
  subscriptionExpiresAt: Date;
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

export interface CreateCampaignRequest {
  name: string;
  description: string;
  botId: string;
  templateId?: string; // Optional template reference
  emailList: string[];
  scheduledFor?: Date;
  emailInterval: number;
  emailIntervalUnit: 'seconds' | 'minutes' | 'hours';
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

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  isPublic: boolean;
  samples: Omit<ITemplateSample, '_id' | 'createdAt'>[];
  tags: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  isPublic?: boolean;
  samples?: Omit<ITemplateSample, '_id' | 'createdAt'>[];
  tags?: string[];
}

export interface ApproveTemplateRequest {
  approved: boolean;
  rejectionReason?: string;
}

export interface ReviewTemplateRequest {
  rating: number;
  comment?: string;
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

export interface InitializePaymentRequest {
  subscriptionTier: SubscriptionTier;
  billingCycle: BillingCycle;
  email: string;
}

export interface VerifyPaymentRequest {
  reference: string;
}

export interface PaymentCallbackRequest {
  reference: string;
  status: string;
  transaction_id?: string;
  amount?: number;
  currency?: string;
  gateway_response?: string;
  paid_at?: string;
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