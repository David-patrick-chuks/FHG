import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle,
  LogIn,
  LogOut,
  Settings,
  Shield,
  Play,
  Stop,
  Search,
  XCircle,
  Link,
  Globe,
  FileUp,
  Download,
  Eye,
  AlertCircle,
  Clock,
  Database,
  BarChart3,
  Key,
  RefreshCw,
  Trash2,
  ExternalLink,
  Star,
  TrendingUp,
  XCircle as XCircleIcon,
  Heart,
  Bell,
  Target,
  Send,
  UserPlus,
  User
} from 'lucide-react';

export const getActivityIcon = (type: string) => {
  switch (type) {
    // Campaign activities
    case 'campaign_completed':
      return CheckCircle;
    case 'campaign_started':
      return Play;
    case 'campaign_created':
      return Target;
    case 'email_sent':
      return Send;
    
    // Bot activities
    case 'bot_activated':
      return Bot;
    case 'bot_updated':
      return Bot;
    
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
      return Settings;
    case 'user_password_changed':
      return Shield;
    
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
      return FileUp;
    case 'email_extraction_failed':
      return XCircle;
    case 'email_extraction_cancelled':
      return Stop;
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
    
    // Subscription activities
    case 'subscription_upgraded':
      return Star;
    case 'subscription_downgraded':
      return TrendingUp;
    case 'subscription_cancelled':
      return XCircleIcon;
    case 'subscription_renewed':
      return Heart;
    
    // Notification activities
    case 'notification_sent':
      return Bell;
    case 'notification_read':
      return Eye;
    case 'notification_cleared':
      return Trash2;
    
    // System activities
    case 'system_backup':
      return Database;
    case 'system_maintenance':
      return Settings;
    case 'system_alert':
      return AlertTriangle;
    case 'system_update':
      return RefreshCw;
    
    default:
      return Activity;
  }
};

export const getActivityIconColor = (type: string) => {
  switch (type) {
    // Campaign activities
    case 'campaign_completed':
      return 'text-green-600';
    case 'campaign_started':
      return 'text-orange-600';
    case 'campaign_created':
      return 'text-blue-600';
    case 'email_sent':
      return 'text-green-600';
    
    // Bot activities
    case 'bot_activated':
      return 'text-blue-600';
    case 'bot_updated':
      return 'text-indigo-600';
    
    // Performance activities
    case 'performance_improved':
      return 'text-purple-600';
    
    // User activities
    case 'user_registered':
      return 'text-green-600';
    case 'user_login':
      return 'text-blue-600';
    case 'user_logout':
      return 'text-gray-600';
    case 'user_profile_updated':
      return 'text-purple-600';
    case 'user_password_changed':
      return 'text-orange-600';
    
    // Email Extractor activities
    case 'email_extraction_started':
      return 'text-blue-600';
    case 'email_extraction_completed':
      return 'text-green-600';
    case 'email_extraction_single_url':
      return 'text-cyan-600';
    case 'email_extraction_multiple_urls':
      return 'text-indigo-600';
    case 'email_extraction_csv_upload':
      return 'text-purple-600';
    case 'email_extraction_failed':
      return 'text-red-600';
    case 'email_extraction_cancelled':
      return 'text-gray-600';
    case 'email_extraction_results_downloaded':
      return 'text-purple-600';
    case 'email_extraction_results_viewed':
      return 'text-indigo-600';
    case 'email_extraction_limit_reached':
      return 'text-orange-600';
    case 'email_extraction_invalid_url':
      return 'text-red-600';
    case 'email_extraction_rate_limited':
      return 'text-yellow-600';
    case 'email_extraction_performance_alert':
      return 'text-yellow-600';
    case 'email_extraction_method_used':
      return 'text-cyan-600';
    
    // API Key activities
    case 'api_key_generated':
      return 'text-green-600';
    case 'api_key_regenerated':
      return 'text-blue-600';
    case 'api_key_revoked':
      return 'text-red-600';
    case 'api_key_used':
      return 'text-purple-600';
    
    // Subscription activities
    case 'subscription_upgraded':
      return 'text-yellow-600';
    case 'subscription_downgraded':
      return 'text-orange-600';
    case 'subscription_cancelled':
      return 'text-red-600';
    case 'subscription_renewed':
      return 'text-pink-600';
    
    // Notification activities
    case 'notification_sent':
      return 'text-blue-600';
    case 'notification_read':
      return 'text-green-600';
    case 'notification_cleared':
      return 'text-gray-600';
    
    // System activities
    case 'system_backup':
      return 'text-indigo-600';
    case 'system_maintenance':
      return 'text-purple-600';
    case 'system_alert':
      return 'text-red-600';
    case 'system_update':
      return 'text-blue-600';
    
    default:
      return 'text-gray-600';
  }
};
