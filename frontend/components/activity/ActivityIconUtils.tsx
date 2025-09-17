import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  Bot,
  CheckCircle,
  Clock,
  CreditCard,
  Crown,
  Database,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Heart,
  Key,
  Link,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Minus,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Square,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  XCircle,
  XCircle as XCircleIcon,
  Zap
} from 'lucide-react';

export const getActivityIcon = (type: string) => {
  switch (type) {
    // Campaign activities
    case 'campaign_completed':
      return Trophy;
    case 'campaign_started':
      return Zap;
    case 'campaign_created':
      return Target;
    case 'email_sent':
      return Mail;
    
    // Bot activities
    case 'bot_created':
      return Bot;
    case 'bot_activated':
      return Play;
    case 'bot_updated':
      return Edit;
    case 'bot_deactivated':
      return Square;
    
    // Performance activities
    case 'performance_improved':
      return TrendingUp;
    
    // User activities
    case 'user_registered':
      return UserPlus;
    case 'user_login':
      return LogIn;
    case 'user_logout':
      return LogOut;
    case 'user_profile_updated':
      return User;
    case 'user_password_changed':
      return Lock;
    
    // Email Extractor activities
    case 'email_extraction_started':
      return Search;
    case 'email_extraction_completed':
      return CheckCircle;
    case 'email_extraction_single_url':
      return Link;
    case 'email_extraction_multiple_urls':
      return Globe;
    case 'email_extraction_csv_upload':
      return Upload;
    case 'email_extraction_failed':
      return XCircle;
    case 'email_extraction_cancelled':
      return Square;
    case 'email_extraction_results_downloaded':
      return Download;
    case 'email_extraction_results_viewed':
      return Eye;
    case 'email_extraction_limit_reached':
      return AlertTriangle;
    case 'email_extraction_invalid_url':
      return AlertCircle;
    case 'email_extraction_rate_limited':
      return Clock;
    case 'email_extraction_performance_alert':
      return BarChart3;
    case 'email_extraction_method_used':
      return Database;
    
    // API Key activities
    case 'api_key_generated':
      return Key;
    case 'api_key_regenerated':
      return RefreshCw;
    case 'api_key_revoked':
      return Trash2;
    case 'api_key_used':
      return ExternalLink;
    case 'api_key_viewed':
      return Eye;
    
    // Subscription activities
    case 'subscription_created':
      return Crown;
    case 'subscription_upgraded':
      return Star;
    case 'subscription_downgraded':
      return Minus;
    case 'subscription_cancelled':
      return XCircleIcon;
    case 'subscription_renewed':
      return Heart;
    case 'subscription_updated':
      return Edit;
    case 'subscription_expired':
      return Clock;
    case 'payment_processed':
    case 'payment_completed':
      return CreditCard;
    case 'payment_failed':
      return AlertTriangle;
    case 'payment_initialized':
      return CreditCard;
    case 'payment_cancelled':
      return XCircle;
    case 'payment_refunded':
      return RefreshCw;
    
    // Notification activities
    case 'notification_sent':
      return Bell;
    case 'notification_read':
      return Eye;
    case 'notification_cleared':
      return Trash2;
    
    // System activities
    case 'system_backup':
      return Archive;
    case 'system_maintenance':
      return Settings;
    case 'system_alert':
      return AlertTriangle;
    case 'system_update':
      return RefreshCw;
    case 'system_restart':
      return RefreshCw;
    
    // Template activities
    case 'template_created':
      return FileText;
    case 'template_updated':
      return Edit;
    case 'template_deleted':
      return Trash2;
    case 'template_used':
      return Send;
    
    // Analytics activities
    case 'analytics_viewed':
    case 'analytics_dashboard_viewed':
      return BarChart3;
    case 'report_generated':
    case 'analytics_report_generated':
      return FileText;
    case 'export_completed':
    case 'analytics_data_exported':
      return Download;
    
    // Bot activities (additional)
    case 'bot_deleted':
      return Trash2;
    case 'bot_credentials_tested':
      return CheckCircle;
    
    // Campaign activities (additional)
    case 'campaign_updated':
      return Edit;
    case 'campaign_deleted':
      return Trash2;
    case 'campaign_paused':
      return Pause;
    case 'campaign_resumed':
      return Play;
    case 'campaign_cancelled':
      return XCircle;
    case 'campaign_failed':
      return AlertTriangle;
    
    // Email activities (additional)
    case 'email_delivered':
      return CheckCircle;
    case 'email_opened':
      return Eye;
    case 'email_clicked':
      return ExternalLink;
    case 'email_replied':
      return Send;
    case 'email_bounced':
      return AlertTriangle;
    
    // Template activities (additional)
    case 'template_published':
      return Send;
    case 'template_approved':
      return CheckCircle;
    case 'template_rejected':
      return XCircle;
    case 'template_reviewed':
      return Eye;
    
    // System activities (additional)
    case 'system_error':
      return AlertTriangle;
    case 'system_restore':
      return RefreshCw;
    
    // Admin activities
    case 'admin_user_created':
      return UserPlus;
    case 'admin_user_updated':
      return Edit;
    case 'admin_user_deleted':
      return Trash2;
    case 'admin_user_suspended':
      return UserMinus;
    case 'admin_user_unsuspended':
      return UserCheck;
    case 'admin_subscription_updated':
      return Crown;
    case 'admin_payment_processed':
      return CreditCard;
    case 'admin_system_settings_updated':
      return Settings;
    
    // Security activities
    case 'security_login_attempt':
      return LogIn;
    case 'security_login_failed':
      return AlertTriangle;
    case 'security_password_reset':
      return Lock;
    case 'security_account_locked':
      return Shield;
    case 'security_account_unlocked':
      return Shield;
    case 'security_suspicious_activity':
      return AlertTriangle;
    
    // Notification activities (additional)
    case 'notification_delivered':
      return CheckCircle;
    case 'notification_opened':
      return Eye;
    case 'notification_clicked':
      return ExternalLink;
    case 'notification_failed':
      return AlertTriangle;
    
    // Integration activities
    case 'integration_connected':
      return Link;
    case 'integration_disconnected':
      return XCircle;
    case 'integration_sync_started':
      return RefreshCw;
    case 'integration_sync_completed':
      return CheckCircle;
    case 'integration_sync_failed':
      return AlertTriangle;
    
    // Data Export/Import activities
    case 'data_export_started':
      return Download;
    case 'data_export_completed':
      return CheckCircle;
    case 'data_export_failed':
      return AlertTriangle;
    case 'data_import_started':
      return Upload;
    case 'data_import_completed':
      return CheckCircle;
    case 'data_import_failed':
      return AlertTriangle;
    
    // Support activities
    case 'support_ticket_created':
      return Plus;
    case 'support_ticket_updated':
      return Edit;
    case 'support_ticket_resolved':
      return CheckCircle;
    case 'support_ticket_closed':
      return XCircle;
    
    // Compliance activities
    case 'compliance_audit_started':
      return Shield;
    case 'compliance_audit_completed':
      return CheckCircle;
    case 'compliance_violation_detected':
      return AlertTriangle;
    case 'compliance_violation_resolved':
      return CheckCircle;
    
    default:
      return Activity;
  }
};

export const getActivityIconColor = (type: string) => {
  switch (type) {
    // Campaign activities
    case 'campaign_completed':
      return 'text-cyan-600';
    case 'campaign_started':
      return 'text-blue-600';
    case 'campaign_created':
      return 'text-cyan-500';
    case 'email_sent':
      return 'text-blue-500';
    
    // Bot activities
    case 'bot_created':
      return 'text-cyan-600';
    case 'bot_activated':
      return 'text-blue-600';
    case 'bot_updated':
      return 'text-cyan-500';
    case 'bot_deactivated':
      return 'text-gray-500';
    
    // Performance activities
    case 'performance_improved':
      return 'text-blue-600';
    
    // User activities
    case 'user_registered':
      return 'text-cyan-600';
    case 'user_login':
      return 'text-blue-600';
    case 'user_logout':
      return 'text-gray-500';
    case 'user_profile_updated':
      return 'text-cyan-500';
    case 'user_password_changed':
      return 'text-blue-500';
    
    // Email Extractor activities
    case 'email_extraction_started':
      return 'text-cyan-600';
    case 'email_extraction_completed':
      return 'text-blue-600';
    case 'email_extraction_single_url':
      return 'text-cyan-500';
    case 'email_extraction_multiple_urls':
      return 'text-blue-500';
    case 'email_extraction_csv_upload':
      return 'text-cyan-600';
    case 'email_extraction_failed':
      return 'text-red-500';
    case 'email_extraction_cancelled':
      return 'text-gray-500';
    case 'email_extraction_results_downloaded':
      return 'text-blue-600';
    case 'email_extraction_results_viewed':
      return 'text-cyan-500';
    case 'email_extraction_limit_reached':
      return 'text-orange-500';
    case 'email_extraction_invalid_url':
      return 'text-red-500';
    case 'email_extraction_rate_limited':
      return 'text-yellow-500';
    case 'email_extraction_performance_alert':
      return 'text-yellow-500';
    case 'email_extraction_method_used':
      return 'text-cyan-600';
    
    // API Key activities
    case 'api_key_generated':
      return 'text-cyan-600';
    case 'api_key_regenerated':
      return 'text-blue-600';
    case 'api_key_revoked':
      return 'text-red-500';
    case 'api_key_used':
      return 'text-cyan-500';
    case 'api_key_viewed':
      return 'text-blue-500';
    
    // Subscription activities
    case 'subscription_created':
      return 'text-cyan-600';
    case 'subscription_upgraded':
      return 'text-cyan-600';
    case 'subscription_downgraded':
      return 'text-gray-500';
    case 'subscription_cancelled':
      return 'text-red-500';
    case 'subscription_renewed':
      return 'text-blue-600';
    case 'subscription_updated':
      return 'text-cyan-500';
    case 'subscription_expired':
      return 'text-orange-500';
    case 'payment_processed':
    case 'payment_completed':
      return 'text-cyan-600';
    case 'payment_failed':
      return 'text-red-500';
    case 'payment_initialized':
      return 'text-blue-500';
    case 'payment_cancelled':
      return 'text-gray-500';
    case 'payment_refunded':
      return 'text-blue-600';
    
    // Notification activities
    case 'notification_sent':
      return 'text-blue-600';
    case 'notification_read':
      return 'text-cyan-500';
    case 'notification_cleared':
      return 'text-gray-500';
    
    // System activities
    case 'system_backup':
      return 'text-cyan-600';
    case 'system_maintenance':
      return 'text-blue-600';
    case 'system_alert':
      return 'text-red-500';
    case 'system_update':
      return 'text-cyan-500';
    case 'system_restart':
      return 'text-blue-500';
    
    // Template activities
    case 'template_created':
      return 'text-cyan-600';
    case 'template_updated':
      return 'text-blue-600';
    case 'template_deleted':
      return 'text-red-500';
    case 'template_used':
      return 'text-cyan-500';
    
    // Analytics activities
    case 'analytics_viewed':
    case 'analytics_dashboard_viewed':
      return 'text-blue-600';
    case 'report_generated':
    case 'analytics_report_generated':
      return 'text-cyan-600';
    case 'export_completed':
    case 'analytics_data_exported':
      return 'text-blue-500';
    
    // Bot activities (additional)
    case 'bot_deleted':
      return 'text-red-500';
    case 'bot_credentials_tested':
      return 'text-green-500';
    
    // Campaign activities (additional)
    case 'campaign_updated':
      return 'text-cyan-500';
    case 'campaign_deleted':
      return 'text-red-500';
    case 'campaign_paused':
      return 'text-orange-500';
    case 'campaign_resumed':
      return 'text-green-500';
    case 'campaign_cancelled':
      return 'text-gray-500';
    case 'campaign_failed':
      return 'text-red-500';
    
    // Email activities (additional)
    case 'email_delivered':
      return 'text-green-500';
    case 'email_opened':
      return 'text-blue-500';
    case 'email_clicked':
      return 'text-cyan-500';
    case 'email_replied':
      return 'text-blue-600';
    case 'email_bounced':
      return 'text-red-500';
    
    // Template activities (additional)
    case 'template_published':
      return 'text-green-500';
    case 'template_approved':
      return 'text-green-500';
    case 'template_rejected':
      return 'text-red-500';
    case 'template_reviewed':
      return 'text-blue-500';
    
    // System activities (additional)
    case 'system_error':
      return 'text-red-500';
    case 'system_restore':
      return 'text-blue-500';
    
    // Admin activities
    case 'admin_user_created':
      return 'text-green-500';
    case 'admin_user_updated':
      return 'text-cyan-500';
    case 'admin_user_deleted':
      return 'text-red-500';
    case 'admin_user_suspended':
      return 'text-orange-500';
    case 'admin_user_unsuspended':
      return 'text-green-500';
    case 'admin_subscription_updated':
      return 'text-cyan-600';
    case 'admin_payment_processed':
      return 'text-cyan-600';
    case 'admin_system_settings_updated':
      return 'text-blue-500';
    
    // Security activities
    case 'security_login_attempt':
      return 'text-blue-500';
    case 'security_login_failed':
      return 'text-red-500';
    case 'security_password_reset':
      return 'text-orange-500';
    case 'security_account_locked':
      return 'text-red-500';
    case 'security_account_unlocked':
      return 'text-green-500';
    case 'security_suspicious_activity':
      return 'text-red-500';
    
    // Notification activities (additional)
    case 'notification_delivered':
      return 'text-green-500';
    case 'notification_opened':
      return 'text-blue-500';
    case 'notification_clicked':
      return 'text-cyan-500';
    case 'notification_failed':
      return 'text-red-500';
    
    // Integration activities
    case 'integration_connected':
      return 'text-green-500';
    case 'integration_disconnected':
      return 'text-red-500';
    case 'integration_sync_started':
      return 'text-blue-500';
    case 'integration_sync_completed':
      return 'text-green-500';
    case 'integration_sync_failed':
      return 'text-red-500';
    
    // Data Export/Import activities
    case 'data_export_started':
      return 'text-blue-500';
    case 'data_export_completed':
      return 'text-green-500';
    case 'data_export_failed':
      return 'text-red-500';
    case 'data_import_started':
      return 'text-blue-500';
    case 'data_import_completed':
      return 'text-green-500';
    case 'data_import_failed':
      return 'text-red-500';
    
    // Support activities
    case 'support_ticket_created':
      return 'text-blue-500';
    case 'support_ticket_updated':
      return 'text-cyan-500';
    case 'support_ticket_resolved':
      return 'text-green-500';
    case 'support_ticket_closed':
      return 'text-gray-500';
    
    // Compliance activities
    case 'compliance_audit_started':
      return 'text-blue-500';
    case 'compliance_audit_completed':
      return 'text-green-500';
    case 'compliance_violation_detected':
      return 'text-red-500';
    case 'compliance_violation_resolved':
      return 'text-green-500';
    
    default:
      return 'text-gray-500';
  }
};
