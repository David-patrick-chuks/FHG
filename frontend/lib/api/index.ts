// Export all API services
export { AuthAPI } from './auth';
export { BotsAPI } from './bots';
export { CampaignsAPI } from './campaigns';
export { ContactAPI } from './contact';
export { CookieAPI } from './cookies';
export { DashboardAPI } from './dashboard';
export { EmailExtractorAPI } from './email-extractor';
export { IncidentAPI } from './incidents';
export { SubscriptionsAPI } from './subscriptions';
export { SystemStatusAPI } from './system-status';
export { TrackingAPI } from './tracking';

// Export types

export type {
    BotEmailStats, BotStats, CreateBotRequest, TestCredentialsRequest, UpdateBotRequest
} from './bots';

export type {
    CampaignStats, CreateCampaignRequest, TrackingLog,
    TrackingLogsResponse, TrackingStats, UpdateCampaignRequest
} from './campaigns';

export type {
    ContactFormData,
    ContactFormResponse
} from './contact';

export type {
    CookieConsentResponse,
    SetCookieConsentRequest,
    SetCookieConsentResponse,
    UpdatePreferenceRequest,
    UpdatePreferenceResponse
} from './cookies';

export type {
    QuickOverview
} from './dashboard';

export type {
    EmailExtractionJob,
    ExtractionResult, GetExtractionResponse, GetExtractionsResponse, ParseCsvResponse, StartExtractionRequest,
    StartExtractionResponse
} from './email-extractor';

export type {
    CreateSubscriptionRequest,
    UpdateSubscriptionRequest
} from './subscriptions';

export type {
    UserTrackingSummary
} from './tracking';

export type {
    SystemStatus
} from './system-status';

// Re-export the main API client
export { apiClient } from '../api-client';

