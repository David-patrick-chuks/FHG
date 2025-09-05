# Email Tracking Implementation

This document describes the email tracking functionality implemented in the backend to track email opens and read rates.

## Overview

The email tracking system uses a transparent 1x1 pixel image (tracking pixel) embedded in emails to detect when recipients open and read emails. This provides valuable analytics for email campaigns.

## Features

- ✅ **Email Open Tracking**: Tracks when emails are opened using tracking pixels
- ✅ **Read Rate Analytics**: Calculates open rates and read statistics
- ✅ **Campaign Statistics**: Provides comprehensive tracking data per campaign
- ✅ **Real-time Tracking**: Updates tracking data in real-time
- ✅ **Secure Implementation**: Uses proper authentication and validation

## How It Works

### 1. Email Sending Process

When an email is sent through the system:

1. A `SentEmail` record is created in the database with status `SENT`
2. A unique tracking URL is generated for the email
3. A transparent 1x1 pixel is injected into the email HTML
4. The email is sent with the tracking pixel

### 2. Tracking Pixel

The tracking pixel is a transparent 1x1 GIF image that:
- Is invisible to the recipient
- Loads when the email is opened
- Triggers a request to the tracking endpoint
- Updates the email status to `OPENED`

### 3. Tracking URL Format

```
GET /track/open?cid={campaignId}&tid={emailId}
```

- `cid`: Campaign ID
- `tid`: Email ID (transaction ID)

## API Endpoints

### Public Tracking Endpoints

#### Track Email Open
```http
GET /track/open?cid={campaignId}&tid={emailId}
```
- **Purpose**: Tracks when an email is opened
- **Response**: Returns a transparent 1x1 GIF pixel
- **Authentication**: None (public endpoint)

#### Get Campaign Tracking Stats
```http
GET /track/stats/{campaignId}
```
- **Purpose**: Returns tracking statistics for a campaign
- **Response**: JSON with tracking statistics
- **Authentication**: None (public endpoint)

#### Get Campaign Tracking Logs
```http
GET /track/logs/{campaignId}?limit=50&offset=0
```
- **Purpose**: Returns detailed tracking logs for a campaign
- **Response**: JSON with tracking logs
- **Authentication**: None (public endpoint)

### Authenticated Campaign Endpoints

#### Get Campaign Tracking Stats (Authenticated)
```http
GET /campaigns/{id}/tracking/stats
```
- **Purpose**: Returns tracking statistics for a campaign (with user validation)
- **Response**: JSON with tracking statistics
- **Authentication**: Required

#### Get Campaign Tracking Logs (Authenticated)
```http
GET /campaigns/{id}/tracking/logs?limit=50&offset=0&status=OPENED
```
- **Purpose**: Returns detailed tracking logs for a campaign (with user validation)
- **Response**: JSON with tracking logs
- **Authentication**: Required

## Data Models

### SentEmail Model

The `SentEmail` model tracks email status and timing:

```typescript
{
  _id: string;
  campaignId: string;
  botId: string;
  recipientEmail: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'REPLIED' | 'FAILED' | 'BOUNCED';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
  errorMessage?: string;
}
```

### Tracking Statistics

```typescript
{
  campaignId: string;
  total: number;           // Total emails sent
  sent: number;           // Emails with SENT status
  delivered: number;      // Emails with DELIVERED status
  opened: number;         // Emails with OPENED status
  replied: number;        // Emails with REPLIED status
  failed: number;         // Emails with FAILED status
  bounced: number;        // Emails with BOUNCED status
  deliveryRate: number;   // Percentage of delivered emails
  openRate: number;       // Percentage of opened emails (from delivered)
  replyRate: number;      // Percentage of replied emails (from opened)
}
```

## Implementation Details

### EmailService Updates

The `EmailService` has been updated to:

1. **Save email record first**: Creates a `SentEmail` record before sending to get the email ID
2. **Inject tracking pixel**: Adds a tracking pixel to the email HTML content
3. **Include tracking headers**: Adds email ID to email headers for reference

### TrackingRoutes

New routes for handling tracking:

- `/track/open` - Handles tracking pixel requests
- `/track/stats/{campaignId}` - Returns tracking statistics
- `/track/logs/{campaignId}` - Returns tracking logs

### CampaignController Updates

Added new methods to `CampaignController`:

- `getCampaignTrackingStats()` - Get tracking statistics for a campaign
- `getCampaignTrackingLogs()` - Get detailed tracking logs for a campaign

## Usage Examples

### Sending a Tracked Email

```typescript
const result = await EmailService.sendEmail(
  botId,
  recipientEmail,
  subject,
  message,
  campaignId
);
```

The email will automatically include a tracking pixel.

### Getting Tracking Statistics

```typescript
// Via public endpoint
const response = await fetch('/track/stats/campaign-123');

// Via authenticated endpoint
const response = await fetch('/campaigns/campaign-123/tracking/stats', {
  headers: { 'Authorization': 'Bearer <token>' }
});
```

### Getting Tracking Logs

```typescript
// Get all logs
const response = await fetch('/track/logs/campaign-123');

// Get only opened emails
const response = await fetch('/track/logs/campaign-123?status=OPENED');

// Paginated results
const response = await fetch('/track/logs/campaign-123?limit=20&offset=40');
```

## Testing

Run the test script to verify the implementation:

```bash
cd backend
npx ts-node test-email-tracking.ts
```

## Security Considerations

1. **Public Endpoints**: The tracking endpoints are public to allow email clients to load the tracking pixel
2. **Input Validation**: All parameters are validated before processing
3. **Rate Limiting**: Consider implementing rate limiting for tracking endpoints
4. **Data Privacy**: Tracking data should comply with privacy regulations (GDPR, etc.)

## Limitations

1. **Email Client Blocking**: Some email clients may block images by default
2. **Privacy Settings**: Users may have privacy settings that prevent tracking
3. **Mobile Apps**: Some mobile email apps may not load tracking pixels
4. **Proxy/VPN**: Users behind proxies or VPNs may affect tracking accuracy

## Future Enhancements

1. **Click Tracking**: Add link click tracking functionality
2. **Device Detection**: Track the device type used to open emails
3. **Location Tracking**: Track approximate location based on IP
4. **Time-based Analytics**: Track when emails are opened (time of day, day of week)
5. **A/B Testing**: Support for A/B testing with tracking
6. **Real-time Notifications**: WebSocket notifications for real-time tracking updates

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Backend URL for tracking links
BACKEND_URL=http://localhost:5000

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

## Database Indexes

The following indexes are recommended for optimal performance:

```javascript
// SentEmail collection indexes
db.sentemails.createIndex({ campaignId: 1 });
db.sentemails.createIndex({ botId: 1 });
db.sentemails.createIndex({ recipientEmail: 1 });
db.sentemails.createIndex({ status: 1 });
db.sentemails.createIndex({ sentAt: 1 });
db.sentemails.createIndex({ openedAt: 1 });
db.sentemails.createIndex({ campaignId: 1, status: 1 });
db.sentemails.createIndex({ botId: 1, status: 1 });
db.sentemails.createIndex({ campaignId: 1, sentAt: -1 });
```

## Monitoring and Analytics

Consider implementing:

1. **Tracking Success Rate**: Monitor how many tracking pixels are successfully loaded
2. **Response Time**: Track the response time of tracking endpoints
3. **Error Rates**: Monitor failed tracking requests
4. **Database Performance**: Monitor query performance for tracking statistics

## Conclusion

The email tracking implementation provides comprehensive email open tracking with real-time statistics and detailed logging. It integrates seamlessly with the existing email service and provides valuable insights for email campaign performance.
