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
      "deep_analysis": false
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
    "voice_interpretation": true
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