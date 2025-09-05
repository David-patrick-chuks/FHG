# Backend Pagination Implementation

This document outlines the complete pagination implementation for all list endpoints in the backend API.

## Overview

Pagination has been implemented for the following endpoints:
- `GET /bots` - Bot listing with pagination
- `GET /campaigns` - Campaign listing with pagination  
- `GET /subscriptions` - Subscription listing with pagination

## Pagination Utility (`PaginationUtils`)

### Location
`backend/src/utils/PaginationUtils.ts`

### Features
- **Parameter Extraction**: Automatically extracts pagination parameters from request query
- **Validation**: Validates pagination parameters (page, limit, etc.)
- **Search Support**: Creates MongoDB regex for search functionality
- **Sorting**: Handles sorting with field and order specification
- **Result Creation**: Creates standardized pagination response format

### Key Methods

#### `extractPaginationParams(req: Request): PaginationParams`
Extracts pagination parameters from request query:
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)
- `offset`: Calculated offset for database queries
- `search`: Search term for filtering
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction ('asc' or 'desc')

#### `validatePaginationParams(params: PaginationParams)`
Validates pagination parameters and returns validation result.

#### `createPaginationResult<T>(data, total, page, limit)`
Creates standardized pagination response with metadata.

## API Endpoints with Pagination

### 1. Bot Listing (`GET /bots`)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in name, description, or email
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort direction (default: 'desc')

**Example Request:**
```
GET /bots?page=1&limit=10&search=marketing&sortBy=name&sortOrder=asc
```

**Response Format:**
```json
{
  "success": true,
  "message": "Bots retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "bot_id",
        "name": "Marketing Bot",
        "description": "AI marketing assistant",
        "email": "marketing@example.com",
        "isActive": true,
        "dailyEmailCount": 5,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Campaign Listing (`GET /campaigns`)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in name or description
- `status` (optional): Filter by campaign status
- `botId` (optional): Filter by bot ID
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort direction (default: 'desc')

**Example Request:**
```
GET /campaigns?page=1&limit=10&search=outreach&status=running&sortBy=createdAt&sortOrder=desc
```

**Response Format:**
```json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "campaign_id",
        "name": "Q1 Outreach Campaign",
        "description": "Quarterly outreach campaign",
        "status": "running",
        "botId": "bot_id",
        "emailList": ["email1@example.com", "email2@example.com"],
        "aiMessages": ["Message 1", "Message 2"],
        "selectedMessageIndex": 0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 3. Subscription Listing (`GET /subscriptions`)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search in tier or status
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort direction (default: 'desc')

**Example Request:**
```
GET /subscriptions?page=1&limit=10&search=PRO&sortBy=endDate&sortOrder=asc
```

**Response Format:**
```json
{
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": {
    "data": [
      {
        "_id": "subscription_id",
        "tier": "PRO",
        "status": "active",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.999Z",
        "amount": 99.99,
        "currency": "USD",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Implementation Details

### Controller Layer
Each controller now:
1. Extracts pagination parameters using `PaginationUtils.extractPaginationParams()`
2. Validates parameters using `PaginationUtils.validatePaginationParams()`
3. Calls the corresponding service method with pagination parameters
4. Returns standardized pagination response format

### Service Layer
Each service now has:
1. Original method (e.g., `getBotsByUserId`) for backward compatibility
2. New pagination method (e.g., `getBotsByUserIdWithPagination`) with:
   - Query building with search filters
   - Sorting implementation
   - Total count calculation
   - Paginated data retrieval
   - Pagination result creation

### Database Queries
- Uses MongoDB's `find()`, `countDocuments()`, `sort()`, `skip()`, and `limit()` methods
- Implements case-insensitive search using regex
- Supports multiple field search with `$or` operator
- Handles sorting with dynamic field and order

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Page must be greater than 0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Invalid Parameters
```json
{
  "success": false,
  "message": "Limit must be between 1 and 100",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Performance Considerations

### Database Optimization
- Uses `countDocuments()` for accurate total counts
- Implements proper indexing on frequently queried fields
- Limits maximum page size to 100 items
- Uses `skip()` and `limit()` for efficient pagination

### Memory Management
- Processes data in chunks to avoid memory issues
- Removes sensitive data (passwords) from responses
- Implements proper error handling and logging

## Frontend Integration

The frontend API services are already configured to handle pagination responses:

```typescript
// Frontend usage example
const response = await BotsAPI.getBots({ 
  page: 1, 
  limit: 10, 
  search: 'marketing',
  sortBy: 'name',
  sortOrder: 'asc'
});

if (response.success && response.data) {
  const bots = response.data.data;
  const pagination = response.data.pagination;
  
  console.log(`Showing ${bots.length} of ${pagination.total} bots`);
  console.log(`Page ${pagination.page} of ${pagination.totalPages}`);
}
```

## Testing

### Test Cases
1. **Basic Pagination**: Test page navigation with different page sizes
2. **Search Functionality**: Test search across different fields
3. **Sorting**: Test sorting by different fields and orders
4. **Edge Cases**: Test with empty results, single page, etc.
5. **Validation**: Test invalid parameters and error responses

### Example Test Requests
```bash
# Basic pagination
curl "http://localhost:5000/bots?page=1&limit=5"

# Search with pagination
curl "http://localhost:5000/campaigns?search=outreach&page=1&limit=10"

# Sorting with pagination
curl "http://localhost:5000/subscriptions?sortBy=endDate&sortOrder=asc&page=1&limit=10"

# Combined filters
curl "http://localhost:5000/bots?search=marketing&sortBy=createdAt&sortOrder=desc&page=2&limit=20"
```

## Migration Notes

### Backward Compatibility
- Original endpoints still work without pagination parameters
- Frontend can gradually adopt pagination features
- No breaking changes to existing API contracts

### Database Changes
- No schema changes required
- Existing indexes are sufficient for basic pagination
- Consider adding compound indexes for complex queries

## Future Enhancements

### Potential Improvements
1. **Cursor-based Pagination**: For better performance with large datasets
2. **Advanced Filtering**: Date ranges, status combinations, etc.
3. **Field Selection**: Allow clients to specify which fields to return
4. **Aggregation Support**: For complex analytics queries
5. **Caching**: Implement Redis caching for frequently accessed data

### Monitoring
- Track pagination usage patterns
- Monitor query performance
- Set up alerts for slow queries
- Analyze search patterns for optimization

This pagination implementation provides a solid foundation for scalable data retrieval while maintaining backward compatibility and following REST API best practices.
