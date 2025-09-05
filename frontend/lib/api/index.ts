// Export all API services
export { AuthAPI } from './auth';
export { BotsAPI } from './bots';
export { CampaignsAPI } from './campaigns';
export { DashboardAPI } from './dashboard';
export { SubscriptionsAPI } from './subscriptions';
export { TrackingAPI } from './tracking';

// Export types
export type {
  CreateBotRequest,
  UpdateBotRequest,
  TestCredentialsRequest,
  BotStats,
  BotEmailStats
} from './bots';

export type {
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignStats,
  TrackingStats,
  TrackingLog,
  TrackingLogsResponse
} from './campaigns';

export type {
  QuickOverview
} from './dashboard';

export type {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest
} from './subscriptions';

export type {
  UserTrackingSummary
} from './tracking';

// Re-export the main API client
export { apiClient } from '../api-client';
