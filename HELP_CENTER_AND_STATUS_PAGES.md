# Help Center and System Status Pages

This document describes the implementation of the Help Center and System Status pages for the MailQuill application.

## Overview

Two new pages have been added to provide better user support and system transparency:

1. **Help Center** (`/help-center`) - Comprehensive support and documentation hub
2. **System Status** (`/system-status`) - Real-time system health monitoring

## Help Center Page

### Features
- **Search functionality** - Users can search for help articles and guides
- **Support options** - Multiple ways to get help (Live Chat, Phone, Email, Video Tutorials)
- **Categorized help articles** - Organized by topic (Getting Started, Campaign Management, Account & Security, Troubleshooting)
- **FAQ section** - Frequently asked questions with expandable answers
- **Quick links** - Direct access to API docs, system status, community, and feedback
- **Contact integration** - Direct links to WhatsApp and contact form

### Support Options
- **Live Chat** - WhatsApp integration for instant support
- **Phone Support** - Direct phone number with business hours
- **Email Support** - Support email with 24h response time
- **Video Tutorials** - Self-paced learning resources

### Categories
1. **Getting Started** - Basic setup and first steps
2. **Campaign Management** - Creating and managing email campaigns
3. **Account & Security** - Account settings and security features
4. **Troubleshooting** - Common issues and solutions

## System Status Page

### Features
- **Real-time monitoring** - Live system health data with auto-refresh
- **Service status** - Individual service health indicators
- **System metrics** - Memory usage, database stats, performance data
- **Incident history** - Recent incidents with status updates
- **System information** - Environment, version, and technical details

### Monitored Services
- **API Services** - REST API endpoints status
- **Database** - MongoDB connection and performance
- **Email Service** - SMTP and delivery status

### Metrics Displayed
- **Overall Status** - System-wide health indicator
- **Uptime** - Process and system uptime
- **Response Time** - API response times
- **Memory Usage** - System memory utilization
- **Database Stats** - Collections, indexes, storage size
- **Active Connections** - Current user connections

## Backend Implementation

### New API Endpoint
- **GET `/api/system-status`** - Comprehensive system health data
  - Uses existing `HealthService` for detailed metrics
  - Returns database, system, and application metrics
  - Includes performance indicators and uptime data

### Health Service Integration
- Leverages existing `HealthService` class
- Provides detailed system metrics including:
  - Database health and statistics
  - System memory and CPU usage
  - Application performance data
  - Process and system uptime

## Frontend Implementation

### API Client
- New `SystemStatusAPI` class in `/lib/api/system-status.ts`
- Proper error handling and type safety
- Integration with existing API client infrastructure

### Components
- **Help Center Page** - Comprehensive support interface
- **System Status Page** - Real-time monitoring dashboard
- **Navigation Updates** - Added links to both pages in main navigation

### Styling
- Consistent with existing MailQuill design system
- Responsive design for mobile and desktop
- Dark mode support
- Professional animations and transitions

## Navigation Updates

Both pages are now accessible from the main navigation:
- **Help Center** - Available in the main navigation menu
- **System Status** - Available in the main navigation menu

## Technical Details

### Dependencies
- Uses existing UI components from the design system
- Integrates with existing API client infrastructure
- Leverages existing health monitoring services

### Performance
- System status auto-refreshes every 30 seconds
- Efficient API calls with proper error handling
- Responsive design with optimized loading states

### Security
- System status endpoint provides read-only monitoring data
- No sensitive information exposed in status responses
- Proper error handling to prevent information leakage

## Usage

### For Users
1. **Help Center** - Visit `/help-center` to find answers, get support, or learn about features
2. **System Status** - Visit `/system-status` to check system health and view recent incidents

### For Developers
1. **API Integration** - Use `SystemStatusAPI.getSystemStatus()` to fetch system health data
2. **Customization** - Both pages are fully customizable and can be extended with additional features

## Future Enhancements

### Potential Improvements
- **Help Center**:
  - User feedback system for articles
  - Article rating and comments
  - Advanced search with filters
  - Video tutorial integration

- **System Status**:
  - Historical performance charts
  - Alert notifications
  - Custom monitoring dashboards
  - Integration with external monitoring tools

## Files Created/Modified

### New Files
- `frontend/app/help-center/page.tsx` - Help Center page
- `frontend/app/system-status/page.tsx` - System Status page
- `frontend/lib/api/system-status.ts` - System Status API client

### Modified Files
- `frontend/components/navbar.tsx` - Added navigation links
- `frontend/lib/api/index.ts` - Exported new API client
- `backend/src/routes/index.ts` - Added system status endpoint

## Conclusion

The Help Center and System Status pages provide essential support and transparency features for the MailQuill application. They follow the existing design patterns and integrate seamlessly with the current architecture while providing valuable functionality for both users and administrators.


