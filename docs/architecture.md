# Razgazdayson Architecture

## Overview

Razgazdayson is a microservices-based AI dream interpretation platform consisting of:

- **Backend API** (FastAPI) - Core business logic and AI integration
- **Frontend Web** (Next.js) - Marketing site and web application
- **Telegram Bot** (aiogram) - Telegram bot interface
- **Telegram WebApp** (React) - Telegram Mini App
- **PostgreSQL** - Primary database with pgvector extension
- **Redis** - Caching and rate limiting

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Telegram Bot   │     │ Telegram WebApp │     │   Web Frontend  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┴─────────────────────────┘
                                 │
                         ┌───────▼────────┐
                         │   Backend API  │
                         │   (FastAPI)    │
                         └───────┬────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
         ┌──────▼──────┐                 ┌───────▼────────┐
         │ PostgreSQL  │                 │     Redis      │
         │ + pgvector  │                 │    Cache       │
         └─────────────┘                 └────────────────┘
                                                 │
                                         ┌───────▼────────┐
                                         │   OpenAI API   │
                                         └────────────────┘
```

## Components

### Backend API (FastAPI)

- **Purpose**: Core business logic, API endpoints, AI integration
- **Technology**: FastAPI 0.109.0, Python 3.12
- **Database**: SQLAlchemy 2.0 with async support
- **Migrations**: Alembic
- **Key Features**:
  - Async/await for high performance
  - Automatic OpenAPI documentation
  - Pydantic for data validation
  - SQLAlchemy for database ORM
  - Celery for background tasks

### Frontend Web (Next.js)

- **Purpose**: Marketing website and web application
- **Technology**: Next.js 15.4, React 19, TypeScript
- **Styling**: Tailwind CSS 3.4
- **Key Features**:
  - Server-side rendering (SSR) for SEO
  - Static site generation (SSG) for performance
  - Incremental static regeneration (ISR)
  - Tailwind CSS for styling

### Telegram Bot

- **Purpose**: Telegram bot interface for users
- **Technology**: aiogram 3.3, Python 3.12
- **Deployment**: Docker container with polling/webhook support
- **Key Features**:
  - Webhook and polling support
  - FSM for conversation flow
  - Rate limiting
  - Voice message support

### Telegram WebApp

- **Purpose**: Rich UI experience within Telegram
- **Technology**: React 18, TypeScript, Tailwind CSS
- **Build**: Vite for fast development
- **Deployment**: Nginx static serving
- **Key Features**:
  - Telegram WebApp SDK integration
  - Responsive design
  - Offline support
  - Theme adaptation

### Database (PostgreSQL)

- **Purpose**: Primary data storage
- **Technology**: PostgreSQL 16 with pgvector extension
- **Image**: pgvector/pgvector:pg16 (Docker)
- **Key Features**:
  - Vector similarity search for dream patterns (pgvector extension)
  - Full-text search for dream content (Russian language support)
  - JSONB for flexible data structures
  - Row-level security
  - Automated database initialization with init-db.sql
  - Vector indexes for cosine similarity search
  - Trigger-based automatic timestamps

### Cache (Redis)

- **Purpose**: Caching and rate limiting
- **Technology**: Redis 7
- **Key Features**:
  - LLM response caching
  - User session storage
  - Rate limiting counters
  - Pub/sub for real-time features

## Data Flow

1. **User Input**: User submits dream via Telegram Bot, WebApp, or Web
2. **Validation**: Input validated (20-4000 chars) and rate limits checked
3. **Processing**: 
   - Text normalized and prepared
   - Voice converted to text using OpenAI Whisper (if applicable)
   - Generate vector embeddings using OpenAI text-embedding-ada-002
   - Sent to OpenAI GPT-4 for interpretation
4. **Similarity Search**: 
   - Store dream embedding in pgvector
   - Find similar dreams using cosine similarity
   - Enhance interpretation with similar dream patterns
5. **Caching**: Results cached in Redis with TTL
6. **Storage**: Dream and interpretation saved to PostgreSQL
7. **Response**: Formatted result returned to user with symbols and advice

## Security

- **Authentication**: JWT tokens, Telegram OAuth
- **Rate Limiting**: Per-user and global limits
- **Data Encryption**: At rest and in transit
- **Input Validation**: Strict validation on all inputs
- **CORS**: Configured for allowed origins only
- **CSP Headers**: Content Security Policy enabled

## Deployment

- **Environment**: Self-hosted on dedicated servers
- **Web Server**: Nginx as reverse proxy
- **Process Manager**: systemd / PM2
- **SSL**: Let's Encrypt certificates
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry

## Scalability

- **Horizontal Scaling**: Stateless services allow easy scaling
- **Database**: 
  - Read replicas for read-heavy operations
  - pgvector indexes optimized for similarity search
  - Connection pooling with SQLAlchemy
- **Caching**: 
  - Redis cluster for distributed caching
  - LLM response caching to reduce API costs
  - User session caching
- **CDN**: Static assets served via CDN
- **Load Balancing**: Nginx for request distribution
- **Vector Search**: Optimized with ivfflat indexes for large datasets

## Implementation Status

### ✅ Completed Components

1. **Database Schema** - Full PostgreSQL schema with pgvector
2. **Data Models** - Pydantic schemas and SQLAlchemy ORM models
3. **AI Services**:
   - OpenAI GPT-4 integration with caching
   - Dream interpretation with prompt engineering
   - Vector embeddings for semantic search
   - Voice transcription (Whisper)
   - Text-to-speech (OpenAI TTS)
4. **Authentication**:
   - JWT token generation and validation
   - Telegram OAuth implementation
   - Protected endpoints with dependencies
5. **API Endpoints**:
   - POST /api/v1/dreams/interpret - Main interpretation endpoint
   - Full CRUD for dream journal
   - User authentication endpoints
   - Health checks and monitoring

### 🚧 In Progress

1. **Frontend Integration** - API client for web app
2. **Telegram Bot** - Connect to backend API
3. **Payment Integration** - Subscription handling

## API Architecture

### Request Flow

1. **Client Request** → Nginx → FastAPI
2. **Authentication** → JWT validation → User context
3. **Rate Limiting** → Redis counter → Daily limit check
4. **Business Logic** → Service layer → Data validation
5. **AI Processing** → OpenAI API → Response caching
6. **Data Storage** → PostgreSQL → Vector embeddings
7. **Response** → JSON → Client

### Service Layer

- **AuthService**: JWT tokens, Telegram OAuth validation
- **OpenAIService**: GPT-4, Whisper, TTS, embeddings
- **DreamInterpreter**: Dream analysis orchestration
- **EmbeddingService**: Vector search and similarity

## Development Workflow

1. **Local Development**: Docker Compose for all services
   - Use `make start` to start all services
   - Use `make logs` to view service logs
   - Use `make db-shell` for database access
   - Use `make migrate` to run database migrations

2. **Version Control**: Git with feature branches
   - Repository: git@github.com:ArtAndrew/razgadayson.git
   - Branch protection rules enabled

3. **CI/CD**: GitHub Actions / GitLab CI
   - Automated testing on pull requests
   - Docker image builds
   - Deployment to staging/production

4. **Testing**: Unit, integration, and E2E tests
   - Use `make test` to run all tests
   - Use `make test-backend` for backend tests only
   - Use `make test-frontend` for frontend tests only

5. **Code Quality**: Pre-commit hooks, linting, type checking
   - Python: black, flake8, mypy
   - TypeScript: eslint, prettier
   - Automated formatting on commit