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
  Square,
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
  User,
  Zap,
  Mail,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Lock,
  Unlock,
  Plus,
  Minus,
  Edit,
  Save,
  Upload,
  Filter,
  MessageSquare,
  Phone,
  Video,
  Image,
  File,
  Folder,
  Archive,
  Copy,
  Share,
  Bookmark,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Award,
  Gift,
  CreditCard,
  Receipt,
  PieChart,
  LineChart,
  Activity as ActivityIcon,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  Flame,
  Snowflake,
  Umbrella,
  TreePine,
  Mountain,
  Waves,
  Fish,
  Bird,
  Cat,
  Dog,
  Bug,
  Flower,
  Leaf,
  Apple,
  Carrot,
  Coffee,
  Pizza,
  Cake,
  Wine,
  Beer,
  Music,
  Headphones,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  Router,
  Printer,
  Scanner,
  Camera,
  VideoCamera,
  Microphone,
  Speaker,
  Gamepad2,
  Joystick,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Puzzle,
  Chess,
  Cards,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,
  Ruby,
  Sapphire,
  Emerald,
  Amethyst,
  Pearl,
  Gold,
  Silver,
  Bronze,
  Iron,
  Steel,
  Copper,
  Aluminum,
  Titanium,
  Platinum,
  Uranium,
  Radium,
  Plutonium,
  Helium,
  Hydrogen,
  Oxygen,
  Nitrogen,
  Carbon,
  Silicon,
  Phosphorus,
  Sulfur,
  Chlorine,
  Fluorine,
  Bromine,
  Iodine,
  Lithium,
  Sodium,
  Potassium,
  Calcium,
  Magnesium,
  Barium,
  Strontium,
  Radon,
  Xenon,
  Krypton,
  Neon,
  Argon
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
    case 'subscription_upgraded':
      return Star;
    case 'subscription_downgraded':
      return Minus;
    case 'subscription_cancelled':
      return XCircleIcon;
    case 'subscription_renewed':
      return Heart;
    case 'payment_processed':
      return CreditCard;
    case 'payment_failed':
      return AlertTriangle;
    
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
      return BarChart3;
    case 'report_generated':
      return FileText;
    case 'export_completed':
      return Download;
    
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
    case 'subscription_upgraded':
      return 'text-cyan-600';
    case 'subscription_downgraded':
      return 'text-gray-500';
    case 'subscription_cancelled':
      return 'text-red-500';
    case 'subscription_renewed':
      return 'text-blue-600';
    case 'payment_processed':
      return 'text-cyan-600';
    case 'payment_failed':
      return 'text-red-500';
    
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
      return 'text-blue-600';
    case 'report_generated':
      return 'text-cyan-600';
    case 'export_completed':
      return 'text-blue-500';
    
    default:
      return 'text-gray-500';
  }
};
