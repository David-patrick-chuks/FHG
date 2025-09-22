# API Reference

> **Email Outreach Bot Backend API Documentation**

## 🔐 Authentication

All API endpoints require authentication via JWT tokens, except for public endpoints.

### Headers
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## 📍 Base URL

```
Development: http://localhost:3001
Production: https://api.yourapp.com
```

## 🚀 Public Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-03T18:30:27.738Z",
  "uptime": {
    "process": 602,
    "system": 86400
  },
  "environment": "development",
  "database": {
    "status": "healthy",
    "connected": true,
    "responseTime": 15,
    "lastCheck": "2025-01-03T18:30:27.738Z"
  },
  "system": {
    "memory": {
      "usage": 45,
      "total": 8192,
      "free": 8147,
      "percentage": 1
    },
    "cpu": {
      "loadAverage": [0.5, 0.3, 0.2],
      "uptime": 86400
    }
  }
}
```

### API Version
```http
GET /api/version
```

## 🔑 Authentication Endpoints

### User Registration
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "subscription": "free"
    },
    "token": "jwt_token_here"
  }
}
```

### User Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Password Reset
```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

## 🤖 Bot Management

### Get User Bots
```http
GET /api/bots
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bot_id_123",
      "name": "Sales Bot",
      "email": "sales@company.com",
      "status": "active",
      "dailyLimit": 100,
      "sentToday": 45,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Bot
```http
POST /api/bots
```

**Request Body:**
```json
{
  "name": "Marketing Bot",
  "email": "marketing@company.com",
  "password": "botPassword123",
  "dailyLimit": 200
}
```

### Update Bot
```http
PUT /api/bots/:botId
```

### Delete Bot
```http
DELETE /api/bots/:botId
```

## 📧 Campaign Management

### Get Campaigns
```http
GET /api/campaigns
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `status` (string): Filter by status (draft, active, paused, completed)

### Create Campaign
```http
POST /api/campaigns
```

**Request Body:**
```json
{
  "name": "Q1 Sales Outreach",
  "subject": "Exclusive Q1 Opportunities",
  "template": "sales_template_123",
  "botId": "bot_id_123",
  "targetAudience": "sales_leads",
  "scheduledDate": "2025-01-15T09:00:00.000Z"
}
```

### Update Campaign
```http
PUT /api/campaigns/:campaignId
```

### Pause/Resume Campaign
```http
PATCH /api/campaigns/:campaignId/status
```

**Request Body:**
```json
{
  "status": "paused"
}
```

## 📊 Analytics & Dashboard

### Get Campaign Analytics
```http
GET /api/dashboard/analytics
```

**Query Parameters:**
- `startDate` (string): Start date for analytics
- `endDate` (string): End date for analytics
- `campaignId` (string): Specific campaign analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEmails": 1500,
    "delivered": 1420,
    "opened": 890,
    "clicked": 234,
    "replied": 45,
    "bounced": 80,
    "deliveryRate": 94.7,
    "openRate": 62.7,
    "clickRate": 26.3,
    "replyRate": 5.1
  }
}
```

### Get User Stats
```http
GET /api/auth/stats
```

## 🔒 Admin Endpoints

### Get All Users
```http
GET /api/admin/users
```

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

### Update User Subscription
```http
PUT /api/admin/users/:userId/subscription
```

**Request Body:**
```json
{
  "subscription": "pro",
  "customLimits": {
    "dailyEmails": 500,
    "bots": 5
  }
}
```

## 📝 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "email": "Must be a valid email address"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR` - Invalid or expired token
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid request data
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## 📚 Rate Limiting

- **Public endpoints**: 100 requests per 15 minutes
- **Authenticated endpoints**: 1000 requests per 15 minutes
- **Admin endpoints**: 5000 requests per 15 minutes

## 🔄 Pagination

For endpoints that return lists, use pagination:

**Query Parameters:**
- `page` (number): Page number (starts from 1)
- `limit` (number): Items per page (max 100)

**Response Headers:**
```
X-Total-Count: 150
X-Total-Pages: 3
X-Current-Page: 1
X-Per-Page: 50
```

## 📡 Webhooks

### Email Events Webhook
```http
POST /webhooks/email-events
```

**Headers:**
```
X-Webhook-Signature: <hmac-signature>
```

**Request Body:**
```json
{
  "event": "email_delivered",
  "emailId": "email_123",
  "campaignId": "campaign_456",
  "timestamp": "2025-01-03T18:30:27.738Z",
  "data": {
    "recipient": "user@example.com",
    "status": "delivered"
  }
}
```

---

**Last Updated:** January 3, 2025  
**API Version:** v1.0.0
