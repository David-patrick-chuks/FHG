// Base types
export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types - Updated to match backend User model exactly
export interface User extends BaseEntity {
  email: string;
  username: string; // Backend expects username, not firstName/lastName
  subscription: SubscriptionTier;
  isActive: boolean;
  isAdmin: boolean;
  lastLoginAt?: Date;
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

// Subscription types - Updated to match backend enum
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

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

// Bot types
export interface Bot extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  smtpConfig: SMTPConfig;
  emailSignature?: string;
  dailyEmailLimit: number;
  emailsSentToday: number;
  lastEmailSentAt?: Date;
  performance: BotPerformance;
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
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  botId: string;
  template: EmailTemplate;
  targetAudience: TargetAudience;
  schedule: CampaignSchedule;
  stats: CampaignStats;
  settings: CampaignSettings;
}

export interface EmailTemplate {
  subject: string;
  body: string;
  variables: string[];
  aiGenerated: boolean;
  aiPrompt?: string;
}

export interface TargetAudience {
  emails: string[];
  filters: AudienceFilter[];
  estimatedSize: number;
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with';
  value: string;
}

export interface CampaignSchedule {
  type: 'immediate' | 'scheduled' | 'recurring';
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  dailyLimit?: number;
  sendDays: number[];
  sendTime: string;
}

export interface CampaignStats {
  totalEmails: number;
  sentEmails: number;
  deliveredEmails: number;
  openedEmails: number;
  clickedEmails: number;
  repliedEmails: number;
  bouncedEmails: number;
  unsubscribedEmails: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
}

export interface CampaignSettings {
  enableTracking: boolean;
  enableUnsubscribe: boolean;
  enableReplyHandling: boolean;
  maxRetries: number;
  retryDelay: number;
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
  type: 'campaign_created' | 'email_sent' | 'campaign_completed' | 'bot_activated';
  description: string;
  timestamp: Date;
  metadata?: any;
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
