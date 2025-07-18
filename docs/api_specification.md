# API Specification

## Base URL

```
Production: https://api.razgazdayson.ru/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

#### GET /health/live
Check if the service is running.

**Response:**
```json
{
  "status": "ok",
  "service": "Razgazdayson",
  "version": "1.0.0",
  "timestamp": 1704067200
}
```

#### GET /health/ready
Check if the service is ready to accept requests.

**Response:**
```json
{
  "status": "ok",
  "checks": {
    "database": true,
    "redis": true
  }
}
```

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "telegram_id": 123456789,
    "username": "john_doe"
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

#### POST /auth/login
Login with Telegram credentials.

**Request:**
```json
{
  "telegram_auth_data": "..."
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": {...}
}
```

#### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_jwt_token"
}
```

### Dreams

#### POST /dreams
Create a new dream interpretation.

**Request:**
```json
{
  "text": "I dreamed about flying over the ocean...",
  "language": "ru"
}
```

**Response:**
```json
{
  "id": "uuid",
  "text": "I dreamed about flying over the ocean...",
  "interpretation": {
    "main_symbol": {
      "name": "Flying",
      "emoji": "🦅",
      "meaning": "Freedom and ambition"
    },
    "interpretation": "Your dream suggests...",
    "emotions": [
      {
        "name": "Freedom",
        "intensity": "high",
        "color": "#4A90E2"
      }
    ],
    "advice": "Consider exploring new opportunities..."
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### GET /dreams
Get user's dreams list.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `tag` (optional)
- `search` (optional)

**Response:**
```json
{
  "dreams": [
    {
      "id": "uuid",
      "text": "Dream text preview...",
      "main_symbol": "🌊",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

#### GET /dreams/{dream_id}
Get specific dream details.

**Response:**
```json
{
  "id": "uuid",
  "text": "Full dream text...",
  "interpretation": {...},
  "tags": ["water", "emotion"],
  "is_favorite": false,
  "similar_dreams": [
    {
      "id": "uuid",
      "text": "Similar dream preview...",
      "similarity": 0.85,
      "main_symbol": "🌊"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### DELETE /dreams/{dream_id}
Delete a dream.

**Response:**
```json
{
  "message": "Dream deleted successfully"
}
```

### Dream Similarity

#### GET /dreams/{dream_id}/similar
Get dreams similar to the specified dream.

**Query Parameters:**
- `limit` (default: 10) - Maximum number of similar dreams to return
- `threshold` (default: 0.7) - Minimum similarity score (0-1)

**Response:**
```json
{
  "dream_id": "uuid",
  "similar_dreams": [
    {
      "id": "uuid",
      "text": "Similar dream text...",
      "similarity": 0.85,
      "main_symbol": "🌊",
      "interpretation": "Brief interpretation...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_found": 5
}
```

#### POST /dreams/search
Search for dreams by semantic similarity.

**Request:**
```json
{
  "query": "flying over the ocean",
  "limit": 20,
  "threshold": 0.6
}
```

**Response:**
```json
{
  "query": "flying over the ocean",
  "results": [
    {
      "id": "uuid",
      "text": "Dream text...",
      "similarity": 0.92,
      "main_symbol": "🦅",
      "interpretation": "Dream interpretation...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_found": 15
}
```

### Dream Analytics

#### GET /dreams/analytics/symbols
Get most common dream symbols for the user.

**Response:**
```json
{
  "symbols": [
    {
      "symbol": "🌊",
      "name": "Water",
      "count": 12,
      "percentage": 24.5
    },
    {
      "symbol": "🦅",
      "name": "Flying",
      "count": 8,
      "percentage": 16.3
    }
  ],
  "total_dreams": 49
}
```

#### GET /dreams/analytics/emotions
Get emotion patterns in user's dreams.

**Response:**
```json
{
  "emotions": [
    {
      "name": "Freedom",
      "count": 15,
      "average_intensity": 0.8,
      "color": "#4A90E2"
    },
    {
      "name": "Fear",
      "count": 8,
      "average_intensity": 0.6,
      "color": "#E74C3C"
    }
  ],
  "total_dreams": 49
}
```

### Users

#### GET /users/me
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "telegram_id": 123456789,
  "username": "john_doe",
  "first_name": "John",
  "subscription": {
    "type": "free",
    "status": "active",
    "features": {
      "daily_limit": 1,
      "deep_analysis": false,
      "voice_interpretation": false,
      "dream_similarity": false,
      "export_data": false
    }
  },
  "stats": {
    "total_dreams": 24,
    "current_streak": 7,
    "favorite_symbol": "🌊"
  }
}
```

#### PATCH /users/me
Update user profile.

**Request:**
```json
{
  "preferences": {
    "language": "en",
    "notifications": {
      "daily_reminder": true,
      "reminder_time": "09:00"
    }
  }
}
```

### Subscriptions

#### GET /subscriptions/current
Get current subscription details.

**Response:**
```json
{
  "type": "pro",
  "status": "active",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-02-01T00:00:00Z",
  "features": {
    "daily_limit": -1,
    "deep_analysis": true,
    "voice_interpretation": true,
    "dream_similarity": true,
    "export_data": true,
    "advanced_analytics": true
  }
}
```

#### POST /subscriptions
Create new subscription.

**Request:**
```json
{
  "plan": "monthly",
  "payment_method": "telegram_stars"
}
```

### Data Export

#### GET /export/dreams
Export user's dreams data (Pro feature).

**Query Parameters:**
- `format` (json|csv) - Export format
- `date_from` - Start date (YYYY-MM-DD)
- `date_to` - End date (YYYY-MM-DD)

**Response:**
```json
{
  "export_id": "uuid",
  "format": "json",
  "status": "processing",
  "download_url": null,
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": "2024-01-02T00:00:00Z"
}
```

#### GET /export/dreams/{export_id}
Get export status and download link.

**Response:**
```json
{
  "export_id": "uuid",
  "format": "json",
  "status": "completed",
  "download_url": "https://api.razgazdayson.ru/downloads/export_uuid.json",
  "file_size": 1024000,
  "created_at": "2024-01-01T00:00:00Z",
  "expires_at": "2024-01-02T00:00:00Z"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {...}
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

- Anonymous users: 10 requests/hour
- Free users: 1000 requests/day
- Pro users: Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1704153600
```