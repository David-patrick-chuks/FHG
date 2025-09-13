// Common Types and Enums

// Core Enums
export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  GENERATING_MESSAGES = 'generating_messages',
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

export enum ActivityType {
  // Bot Activities
  BOT_CREATED = 'bot_created',
  BOT_UPDATED = 'bot_updated',
  BOT_DELETED = 'bot_deleted',
  BOT_ACTIVATED = 'bot_activated',
  BOT_DEACTIVATED = 'bot_deactivated',
  BOT_CREDENTIALS_TESTED = 'bot_credentials_tested',
  
  // Campaign Activities
  CAMPAIGN_CREATED = 'campaign_created',
  CAMPAIGN_UPDATED = 'campaign_updated',
  CAMPAIGN_DELETED = 'campaign_deleted',
  CAMPAIGN_STARTED = 'campaign_started',
  CAMPAIGN_PAUSED = 'campaign_paused',
  CAMPAIGN_RESUMED = 'campaign_resumed',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  CAMPAIGN_CANCELLED = 'campaign_cancelled',
  CAMPAIGN_FAILED = 'campaign_failed',
  
  // Email Activities
  EMAIL_SENT = 'email_sent',
  EMAIL_DELIVERED = 'email_delivered',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  EMAIL_REPLIED = 'email_replied',
  EMAIL_BOUNCED = 'email_bounced',
  
  // User Activities
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_PROFILE_UPDATED = 'user_profile_updated',
  USER_PASSWORD_CHANGED = 'user_password_changed',
  
  // API Key Activities
  API_KEY_GENERATED = 'api_key_generated',
  API_KEY_REVOKED = 'api_key_revoked',
  API_KEY_USED = 'api_key_used',
  API_KEY_VIEWED = 'api_key_viewed',
  
  // Subscription Activities
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPDATED = 'subscription_updated',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  
  // Payment Activities
  PAYMENT_INITIALIZED = 'payment_initialized',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CANCELLED = 'payment_cancelled',
  PAYMENT_REFUNDED = 'payment_refunded',
  
  // Template Activities
  TEMPLATE_CREATED = 'template_created',
  TEMPLATE_PUBLISHED = 'template_published',
  TEMPLATE_APPROVED = 'template_approved',
  TEMPLATE_REJECTED = 'template_rejected',
  TEMPLATE_USED = 'template_used',
  TEMPLATE_REVIEWED = 'template_reviewed',
  
  // Email Extractor Activities
  EMAIL_EXTRACTION_STARTED = 'email_extraction_started',
  EMAIL_EXTRACTION_COMPLETED = 'email_extraction_completed',
  EMAIL_EXTRACTION_FAILED = 'email_extraction_failed',
  EMAIL_EXTRACTION_CANCELLED = 'email_extraction_cancelled',
  EMAIL_EXTRACTION_SINGLE_URL = 'email_extraction_single_url',
  EMAIL_EXTRACTION_MULTIPLE_URLS = 'email_extraction_multiple_urls',
  EMAIL_EXTRACTION_CSV_UPLOAD = 'email_extraction_csv_upload',
  EMAIL_EXTRACTION_RESULTS_DOWNLOADED = 'email_extraction_results_downloaded',
  EMAIL_EXTRACTION_RESULTS_VIEWED = 'email_extraction_results_viewed',
  EMAIL_EXTRACTION_LIMIT_REACHED = 'email_extraction_limit_reached',
  EMAIL_EXTRACTION_INVALID_URL = 'email_extraction_invalid_url',
  EMAIL_EXTRACTION_RATE_LIMITED = 'email_extraction_rate_limited',
  EMAIL_EXTRACTION_PERFORMANCE_ALERT = 'email_extraction_performance_alert',
  EMAIL_EXTRACTION_METHOD_USED = 'email_extraction_method_used',
  
  // System Activities
  SYSTEM_ERROR = 'system_error',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  SYSTEM_BACKUP = 'system_backup',
  SYSTEM_RESTORE = 'system_restore',
  
  // Admin Activities
  ADMIN_USER_CREATED = 'admin_user_created',
  ADMIN_USER_UPDATED = 'admin_user_updated',
  ADMIN_USER_DELETED = 'admin_user_deleted',
  ADMIN_USER_SUSPENDED = 'admin_user_suspended',
  ADMIN_USER_UNSUSPENDED = 'admin_user_unsuspended',
  ADMIN_SUBSCRIPTION_UPDATED = 'admin_subscription_updated',
  ADMIN_PAYMENT_PROCESSED = 'admin_payment_processed',
  ADMIN_SYSTEM_SETTINGS_UPDATED = 'admin_system_settings_updated',
  
  // Security Activities
  SECURITY_LOGIN_ATTEMPT = 'security_login_attempt',
  SECURITY_LOGIN_FAILED = 'security_login_failed',
  SECURITY_PASSWORD_RESET = 'security_password_reset',
  SECURITY_ACCOUNT_LOCKED = 'security_account_locked',
  SECURITY_ACCOUNT_UNLOCKED = 'security_account_unlocked',
  SECURITY_SUSPICIOUS_ACTIVITY = 'security_suspicious_activity',
  
  // Notification Activities
  NOTIFICATION_SENT = 'notification_sent',
  NOTIFICATION_DELIVERED = 'notification_delivered',
  NOTIFICATION_OPENED = 'notification_opened',
  NOTIFICATION_CLICKED = 'notification_clicked',
  NOTIFICATION_FAILED = 'notification_failed',
  
  // Integration Activities
  INTEGRATION_CONNECTED = 'integration_connected',
  INTEGRATION_DISCONNECTED = 'integration_disconnected',
  INTEGRATION_SYNC_STARTED = 'integration_sync_started',
  INTEGRATION_SYNC_COMPLETED = 'integration_sync_completed',
  INTEGRATION_SYNC_FAILED = 'integration_sync_failed',
  
  // Data Export/Import Activities
  DATA_EXPORT_STARTED = 'data_export_started',
  DATA_EXPORT_COMPLETED = 'data_export_completed',
  DATA_EXPORT_FAILED = 'data_export_failed',
  DATA_IMPORT_STARTED = 'data_import_started',
  DATA_IMPORT_COMPLETED = 'data_import_completed',
  DATA_IMPORT_FAILED = 'data_import_failed',
  
  // Analytics Activities
  ANALYTICS_REPORT_GENERATED = 'analytics_report_generated',
  ANALYTICS_DASHBOARD_VIEWED = 'analytics_dashboard_viewed',
  ANALYTICS_DATA_EXPORTED = 'analytics_data_exported',
  
  // Support Activities
  SUPPORT_TICKET_CREATED = 'support_ticket_created',
  SUPPORT_TICKET_UPDATED = 'support_ticket_updated',
  SUPPORT_TICKET_RESOLVED = 'support_ticket_resolved',
  SUPPORT_TICKET_CLOSED = 'support_ticket_closed',
  
  // Compliance Activities
  COMPLIANCE_AUDIT_STARTED = 'compliance_audit_started',
  COMPLIANCE_AUDIT_COMPLETED = 'compliance_audit_completed',
  COMPLIANCE_VIOLATION_DETECTED = 'compliance_violation_detected',
  COMPLIANCE_VIOLATION_RESOLVED = 'compliance_violation_resolved'
}

// Utility Types
export type ObjectId = string;
export type Email = string;
export type Username = string;
export type Password = string;

// Environment Configuration
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  MONGODB_URI: string;
  FRONTEND_URL: string;
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_PUBLIC_KEY: string;
  RATE_LIMIT_WINDOW_MS?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;
  JWT_EXPIRES_IN?: string;
  GEMINI_API_KEY?: string;
  REDIS_URL?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SECRET_KEY?: string;
}
