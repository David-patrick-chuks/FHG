# Frontend API Integration

This document outlines the complete integration of all backend APIs (except admin) into the frontend application.

## Available API Services

### 1. Authentication API (`AuthAPI`)

**Location**: `lib/api/auth.ts`

**Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/reset-password` - Request password reset
- `POST /auth/reset-password/confirm` - Reset password with token
- `GET /auth/reset-password/verify/:token` - Verify reset token
- `GET /auth/verify-token` - Verify JWT token
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change password
- `GET /auth/stats` - Get user statistics
- `POST /auth/logout` - User logout

**Usage**:
```typescript
import { AuthAPI } from '@/lib/api';

// Login
const response = await AuthAPI.login({ email, password });

// Get profile
const profile = await AuthAPI.getProfile();

// Update profile
await AuthAPI.updateProfile({ username: 'newusername' });
```

### 2. Bots API (`BotsAPI`)

**Location**: `lib/api/bots.ts`

**Endpoints**:
- `POST /bots` - Create bot
- `POST /bots/test-credentials` - Test bot credentials
- `GET /bots` - Get user's bots (paginated)
- `GET /bots/:id` - Get specific bot
- `PUT /bots/:id` - Update bot
- `DELETE /bots/:id` - Delete bot
- `POST /bots/:id/toggle` - Toggle bot status
- `POST /bots/:id/test-smtp` - Test bot SMTP connection
- `GET /bots/:id/stats` - Get bot statistics
- `GET /bots/:id/email-stats` - Get bot email statistics

**Usage**:
```typescript
import { BotsAPI } from '@/lib/api';

// Create bot
const bot = await BotsAPI.createBot({
  name: 'My Bot',
  description: 'Bot description',
  email: 'bot@example.com',
  password: 'password',
  prompt: 'AI prompt'
});

// Get bots with pagination
const bots = await BotsAPI.getBots({ page: 1, limit: 10 });

// Get bot email stats
const stats = await BotsAPI.getBotEmailStats(botId, 30);
```

### 3. Campaigns API (`CampaignsAPI`)

**Location**: `lib/api/campaigns.ts`

**Endpoints**:
- `POST /campaigns` - Create campaign
- `POST /campaigns/upload-emails` - Upload email list file
- `GET /campaigns` - Get user's campaigns (paginated)
- `GET /campaigns/:id` - Get specific campaign
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign
- `POST /campaigns/:id/start` - Start campaign
- `POST /campaigns/:id/pause` - Pause campaign
- `POST /campaigns/:id/resume` - Resume campaign
- `POST /campaigns/:id/complete` - Complete campaign
- `POST /campaigns/:id/cancel` - Cancel campaign
- `POST /campaigns/:id/regenerate-messages` - Regenerate AI messages
- `POST /campaigns/:id/select-message` - Select message
- `GET /campaigns/:id/stats` - Get campaign statistics
- `GET /campaigns/:id/tracking/stats` - Get campaign tracking stats
- `GET /campaigns/:id/tracking/logs` - Get campaign tracking logs

**Usage**:
```typescript
import { CampaignsAPI } from '@/lib/api';

// Create campaign
const campaign = await CampaignsAPI.createCampaign({
  name: 'My Campaign',
  description: 'Campaign description',
  botId: 'bot-id',
  emailList: ['email1@example.com', 'email2@example.com']
});

// Upload email file
const uploadResult = await CampaignsAPI.uploadEmailFile(file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// Start campaign
await CampaignsAPI.startCampaign(campaignId);

// Get tracking stats
const trackingStats = await CampaignsAPI.getCampaignTrackingStats(campaignId);
```

### 4. Dashboard API (`DashboardAPI`)

**Location**: `lib/api/dashboard.ts`

**Endpoints**:
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/activity` - Get recent activity
- `GET /dashboard/overview` - Get quick overview

**Usage**:
```typescript
import { DashboardAPI } from '@/lib/api';

// Get dashboard stats
const stats = await DashboardAPI.getDashboardStats();

// Get recent activity
const activity = await DashboardAPI.getRecentActivity();

// Get quick overview
const overview = await DashboardAPI.getQuickOverview();
```

### 5. Subscriptions API (`SubscriptionsAPI`)

**Location**: `lib/api/subscriptions.ts`

**Endpoints**:
- `POST /subscriptions` - Create subscription
- `GET /subscriptions` - Get user subscriptions
- `GET /subscriptions/active` - Get active subscription
- `GET /subscriptions/:id` - Get subscription by ID
- `PUT /subscriptions/:id` - Update subscription
- `POST /subscriptions/:id/renew` - Renew subscription
- `POST /subscriptions/:id/cancel` - Cancel subscription
- `POST /subscriptions/:id/suspend` - Suspend subscription
- `POST /subscriptions/:id/activate` - Activate subscription

**Usage**:
```typescript
import { SubscriptionsAPI } from '@/lib/api';

// Create subscription
const subscription = await SubscriptionsAPI.createSubscription({
  tier: 'PRO',
  duration: 12,
  paymentMethod: 'bank_transfer',
  amount: 99.99
});

// Get active subscription
const activeSub = await SubscriptionsAPI.getActiveSubscription();

// Renew subscription
await SubscriptionsAPI.renewSubscription(subscriptionId, 12);
```

### 6. Tracking API (`TrackingAPI`)

**Location**: `lib/api/tracking.ts`

**Endpoints**:
- `GET /track/stats/:campaignId` - Get campaign tracking stats (public)
- `GET /track/logs/:campaignId` - Get campaign tracking logs (public)
- `POST /track/stats/multiple` - Get multiple campaign stats (authenticated)
- `GET /track/summary` - Get user tracking summary (authenticated)

**Usage**:
```typescript
import { TrackingAPI } from '@/lib/api';

// Get campaign tracking stats
const stats = await TrackingAPI.getCampaignStats(campaignId);

// Get tracking logs
const logs = await TrackingAPI.getCampaignLogs(campaignId, {
  limit: 50,
  offset: 0,
  status: 'OPENED'
});

// Get multiple campaign stats
const multipleStats = await TrackingAPI.getMultipleCampaignStats([
  'campaign1', 'campaign2', 'campaign3'
]);

// Get user tracking summary
const summary = await TrackingAPI.getUserTrackingSummary();
```

## API Client Features

### Authentication
- Automatic JWT token handling
- Token storage in localStorage
- Automatic token refresh (if implemented)

### Error Handling
- Comprehensive error handling with detailed messages
- Network timeout handling
- Request cancellation support

### File Upload
- Progress tracking for file uploads
- Support for CSV and text files
- Automatic form data handling

### Request/Response Types
- Full TypeScript support
- Type-safe API calls
- Consistent response format

## Usage Examples

### Complete Bot Management Flow
```typescript
import { BotsAPI } from '@/lib/api';

// 1. Test credentials before creating bot
const testResult = await BotsAPI.testCredentials({
  email: 'bot@example.com',
  password: 'password'
});

if (testResult.data?.verified) {
  // 2. Create bot
  const bot = await BotsAPI.createBot({
    name: 'My Bot',
    description: 'AI-powered email bot',
    email: 'bot@example.com',
    password: 'password',
    prompt: 'You are a professional email assistant...'
  });

  // 3. Get bot statistics
  const stats = await BotsAPI.getBotStats(bot.data._id);
  
  // 4. Get email statistics
  const emailStats = await BotsAPI.getBotEmailStats(bot.data._id, 30);
}
```

### Complete Campaign Management Flow
```typescript
import { CampaignsAPI } from '@/lib/api';

// 1. Create campaign
const campaign = await CampaignsAPI.createCampaign({
  name: 'Q1 Outreach',
  description: 'Quarterly outreach campaign',
  botId: 'bot-id',
  emailList: ['email1@example.com', 'email2@example.com']
});

// 2. Regenerate AI messages
const messages = await CampaignsAPI.regenerateAIMessages(campaign.data._id, {
  prompt: 'Create professional outreach emails'
});

// 3. Select a message
await CampaignsAPI.selectMessage(campaign.data._id, 0);

// 4. Start campaign
await CampaignsAPI.startCampaign(campaign.data._id);

// 5. Monitor tracking
const trackingStats = await CampaignsAPI.getCampaignTrackingStats(campaign.data._id);
```

### Dashboard Integration
```typescript
import { DashboardAPI, CampaignsAPI, BotsAPI } from '@/lib/api';

// Get comprehensive dashboard data
const [stats, activity, overview] = await Promise.all([
  DashboardAPI.getDashboardStats(),
  DashboardAPI.getRecentActivity(),
  DashboardAPI.getQuickOverview()
]);

// Get detailed campaign data
const campaigns = await CampaignsAPI.getCampaigns({ 
  page: 1, 
  limit: 10,
  status: 'running' 
});

// Get bot performance data
const bots = await BotsAPI.getBots({ page: 1, limit: 10 });
```

## Error Handling

All API calls return a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}
```

Example error handling:
```typescript
try {
  const response = await BotsAPI.createBot(botData);
  if (response.success) {
    console.log('Bot created:', response.data);
  } else {
    console.error('Error:', response.message);
  }
} catch (error) {
  console.error('Network error:', error.message);
}
```

## Configuration

The API client is configured in `lib/config.ts`:

```typescript
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 30000
  },
  auth: {
    jwtStorageKey: 'auth_token'
  }
};
```

## Type Safety

All API calls are fully typed with TypeScript:

```typescript
// Request types
const botData: CreateBotRequest = {
  name: 'My Bot',
  description: 'Description',
  email: 'bot@example.com',
  password: 'password',
  prompt: 'AI prompt'
};

// Response types
const response: ApiResponse<Bot> = await BotsAPI.createBot(botData);
const bot: Bot = response.data!; // Type-safe access
```

This comprehensive API integration provides full access to all backend functionality (except admin) with type safety, error handling, and consistent patterns throughout the frontend application.
