// Base types
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription types - Updated to match backend enum
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type BillingCycle = 'monthly' | 'yearly';

// User types - Updated to match backend User model exactly
export interface User extends BaseEntity {
  email: string;
  username: string; // Backend expects username, not firstName/lastName
  subscription: SubscriptionTier;
  billingCycle?: BillingCycle;
  subscriptionExpiresAt?: Date;
  isActive: boolean;
  isAdmin: boolean;
  lastLoginAt?: Date;
  apiKey?: string;
  apiKeyCreatedAt?: Date;
  apiKeyLastUsed?: Date;
}

export interface UserProfile {
  username: string; // Changed from firstName/lastName to match backend
  email: string;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string; // Backend expects username
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Subscription extends BaseEntity {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  startDate: Date;
  endDate: Date;
  features: SubscriptionFeature[];
  monthlyEmails: number;
  monthlyCampaigns: number;
  maxBots: number;
  price: number;
  currency: string;
}

export interface SubscriptionFeature {
  name: string;
  description: string;
  enabled: boolean;
  limit?: number;
}

// Bot types - Updated to match backend Bot model
export interface Bot extends BaseEntity {
  userId: string;
  name: string;
  description: string;
  email: string;
  password: string; // encrypted
  isActive: boolean;
  dailyEmailCount: number;
  lastEmailSentAt?: Date;
  profileImage?: string; // RoboHash URL for bot profile image
  // Additional properties for display
  dailyEmailLimit?: number;
  emailsSentToday?: number;
  smtpConfig?: SMTPConfig;
}

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface BotPerformance {
  totalEmailsSent: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
}

// Campaign types
export interface Campaign extends BaseEntity {
  userId: string;
  name: string;
  description?: string;
  status: 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'cancelled';
  botId: string;
  emailList: string[];
  aiMessages: string[];
  selectedMessageIndex: number;
  sentEmails: string[];
  startedAt?: Date;
  completedAt?: Date;
  scheduledFor?: Date;
  isScheduled: boolean;
  emailInterval: number; // 0 means no interval (send all at once)
  emailIntervalUnit: 'seconds' | 'minutes' | 'hours';
}


// Template types
export type TemplateStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published' | 'archived';

export type TemplateCategory = 
  | 'sales' 
  | 'marketing' 
  | 'follow_up' 
  | 'cold_outreach' 
  | 'networking' 
  | 'partnership' 
  | 'customer_success' 
  | 'recruitment' 
  | 'event_invitation' 
  | 'thank_you' 
  | 'apology' 
  | 'reminder' 
  | 'introduction' 
  | 'proposal' 
  | 'feedback_request' 
  | 'other';

export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface TemplateSample {
  _id: string;
  title: string;
  content: string;
  useCase: string;
  variables: TemplateVariable[];
  createdAt: Date;
}

export interface TemplateReview {
  _id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Template extends BaseEntity {
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
  samples: TemplateSample[];
  tags: string[];
  usageCount: number;
  rating: {
    average: number;
    count: number;
  };
  reviews: TemplateReview[];
  featured: boolean;
  featuredAt?: Date;
  originalTemplateId?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  isPublic: boolean;
  samples: Omit<TemplateSample, '_id' | 'createdAt'>[];
  tags: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: TemplateCategory;
  industry?: string;
  targetAudience?: string;
  isPublic?: boolean;
  samples?: Omit<TemplateSample, '_id' | 'createdAt'>[];
  tags?: string[];
}

export interface ReviewTemplateRequest {
  rating: number;
  comment?: string;
}



// Queue types
export interface QueueJob extends BaseEntity {
  type: 'email_send' | 'campaign_start' | 'ai_generation';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  data: any;
  attempts: number;
  maxAttempts: number;
  error?: string;
  result?: any;
  startedAt?: Date;
  completedAt?: Date;
  nextRetryAt?: Date;
}

// Admin types
export interface AdminAction extends BaseEntity {
  action: string;
  targetType: 'user' | 'campaign' | 'bot' | 'system';
  targetId: string;
  details: any;
  performedBy: string;
  ipAddress: string;
  userAgent: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: any;
}

// Dashboard types
export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalEmailsSent: number;
  totalEmailsToday: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalBots: number;
  activeBots: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
  metadata?: any;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Tracking types
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

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Campaign Types
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
