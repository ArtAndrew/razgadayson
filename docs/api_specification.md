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
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {}
}
```

#### GET /health/ready
Check if the service is ready to accept requests.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0", 
  "environment": "development",
  "timestamp": "2024-01-01T12:00:00Z",
  "services": {
    "database": "ok",
    "redis": "ok"
  }
}
```

### Authentication

#### POST /api/v1/auth/telegram
Authenticate user via Telegram OAuth.

**Request Body:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://t.me/i/userpic/320/johndoe.jpg",
  "auth_date": 1704067200,
  "hash": "f1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd"
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "telegram_id": 123456789,
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "email": null,
    "language_code": "ru",
    "timezone": "Europe/Moscow",
    "created_at": "2024-01-01T12:00:00Z",
    "is_active": true,
    "subscription_type": "free",
    "daily_limit": 1,
    "dreams_today": 0
  },
  "tokens": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer",
    "expires_in": 1800
  },
  "is_new_user": false
}
```

#### POST /api/v1/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### GET /api/v1/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "telegram_id": 123456789,
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "email": null,
  "language_code": "ru",
  "timezone": "Europe/Moscow",
  "created_at": "2024-01-01T12:00:00Z",
  "is_active": true,
  "subscription_type": "free",
  "daily_limit": 1,
  "dreams_today": 0
}
```

### Dreams

#### POST /api/v1/dreams/interpret
Interpret a dream using AI.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Мне снилось, что я летаю над городом...",
  "voice_data": null,
  "language": "ru",
  "include_similar": true
}
```

**Alternative with voice:**
```json
{
  "text": "",
  "voice_data": "base64_encoded_audio_data...",
  "language": "ru",
  "include_similar": true
}
```

**Response:**
```json
{
  "dream_id": "550e8400-e29b-41d4-a716-446655440001",
  "interpretation": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "dream_id": "550e8400-e29b-41d4-a716-446655440001",
    "main_symbol": "Полет",
    "main_symbol_emoji": "🦅",
    "interpretation": "Полет во сне часто символизирует стремление к свободе и независимости...",
    "emotions": [
      {
        "name": "свобода",
        "intensity": "высокая",
        "meaning": "Желание освободиться от ограничений"
      }
    ],
    "advice": "Обратите внимание на области жизни, где вы чувствуете себя ограниченным...",
    "ai_model": "gpt-4-turbo-preview",
    "prompt_version": "v1.0",
    "created_at": "2024-01-01T12:00:00Z",
    "processing_time_ms": 2500
  },
  "similar_dreams": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "text": "Я парил над облаками и видел...",
      "main_symbol": "Полет",
      "similarity": 0.89,
      "created_at": "2023-12-15T10:30:00Z"
    }
  ],
  "daily_limit_remaining": 0,
  "is_saved": true
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input (text too short/long)
- `401 Unauthorized` - Invalid or missing token
- `429 Too Many Requests` - Daily limit exceeded
- `500 Internal Server Error` - AI service error

#### GET /api/v1/dreams
Get user's dream journal with pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `limit` (int, default: 20, max: 100) - Items per page
- `search` (string, optional) - Search in dream text
- `tag` (string, optional) - Filter by tag

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "text": "Мне снилось, что я летаю над городом...",
      "voice_url": null,
      "language": "ru",
      "created_at": "2024-01-01T12:00:00Z",
      "interpretation": {
        "main_symbol": "Полет",
        "main_symbol_emoji": "🦅",
        "interpretation": "Полет во сне часто символизирует..."
      },
      "tags": ["полет", "свобода"],
      "similar_dreams_count": 3
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

#### GET /api/v1/dreams/{dream_id}
Get specific dream by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "text": "Мне снилось, что я летаю над городом...",
  "voice_url": null,
  "language": "ru",
  "created_at": "2024-01-01T12:00:00Z",
  "interpretation": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "dream_id": "550e8400-e29b-41d4-a716-446655440001",
    "main_symbol": "Полет",
    "main_symbol_emoji": "🦅",
    "interpretation": "Полет во сне часто символизирует стремление к свободе...",
    "emotions": [
      {
        "name": "свобода",
        "intensity": "высокая",
        "meaning": "Желание освободиться от ограничений"
      }
    ],
    "advice": "Обратите внимание на области жизни...",
    "ai_model": "gpt-4-turbo-preview",
    "prompt_version": "v1.0",
    "created_at": "2024-01-01T12:00:00Z",
    "processing_time_ms": 2500
  },
  "tags": ["полет", "свобода"],
  "similar_dreams_count": 3
}
```

#### PUT /api/v1/dreams/{dream_id}
Update dream (edit text or soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "text": "Обновленное описание сна...",
  "is_deleted": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dream updated successfully"
}
```

#### DELETE /api/v1/dreams/{dream_id}
Permanently delete dream.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dream deleted permanently"
}
```

#### POST /api/v1/dreams/{dream_id}/tts
Generate TTS audio for dream interpretation (Pro feature).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `voice` (string, default: "nova") - Voice to use: nova, alloy, echo, fable, onyx, shimmer

**Response:**
```json
{
  "audio": "base64_encoded_mp3_audio...",
  "format": "mp3",
  "voice": "nova"
}
```

**Error Responses:**
- `403 Forbidden` - Feature requires Pro subscription
- `404 Not Found` - Dream or interpretation not found

### Subscriptions

#### GET /api/v1/subscriptions/current
Get current user subscription.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "type": "free",
  "status": "active",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": null,
  "is_active": true,
  "daily_limit": 1,
  "features": {
    "daily_limit": 1,
    "voice_input": true,
    "tts_output": false,
    "deep_analysis": false,
    "similar_dreams": false,
    "export_data": false,
    "priority_support": false
  }
}
```

### Users

#### GET /api/v1/users/stats
Get user statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "total_dreams": 42,
  "current_streak": 7,
  "longest_streak": 15,
  "last_dream_date": "2024-01-01T00:00:00Z",
  "favorite_symbol": "Полет",
  "favorite_symbol_count": 5,
  "updated_at": "2024-01-01T12:00:00Z"
}
```

## Rate Limiting

- Free users: 1 dream per day
- Trial users: 3 dreams per day
- Pro/Yearly users: Unlimited

Rate limit headers are included in responses:
```
X-Daily-Limit: 1
X-Used-Today: 1
```

## Error Responses

All errors follow this format:

```json
{
  "error": "ValidationError",
  "message": "Dream description must be at least 20 characters",
  "details": null,
  "code": "VALIDATION_ERROR",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error
- `503` - Service Unavailable