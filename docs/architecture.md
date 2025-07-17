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
- **Key Features**:
  - Async/await for high performance
  - Automatic OpenAPI documentation
  - Pydantic for data validation
  - SQLAlchemy for database ORM
  - Celery for background tasks

### Frontend Web (Next.js)

- **Purpose**: Marketing website and web application
- **Technology**: Next.js 15.4, React 19, TypeScript
- **Key Features**:
  - Server-side rendering (SSR) for SEO
  - Static site generation (SSG) for performance
  - Incremental static regeneration (ISR)
  - Tailwind CSS for styling

### Telegram Bot

- **Purpose**: Telegram bot interface for users
- **Technology**: aiogram 3.3, Python 3.12
- **Key Features**:
  - Webhook and polling support
  - FSM for conversation flow
  - Rate limiting
  - Voice message support

### Telegram WebApp

- **Purpose**: Rich UI experience within Telegram
- **Technology**: React 18, TypeScript, Tailwind CSS
- **Key Features**:
  - Telegram WebApp SDK integration
  - Responsive design
  - Offline support
  - Theme adaptation

### Database (PostgreSQL)

- **Purpose**: Primary data storage
- **Technology**: PostgreSQL 16 with pgvector extension
- **Key Features**:
  - Vector similarity search for dream patterns
  - Full-text search for dream content
  - JSONB for flexible data structures
  - Row-level security

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
2. **Validation**: Input validated and rate limits checked
3. **Processing**: 
   - Text normalized and prepared
   - Voice converted to text (if applicable)
   - Sent to OpenAI API for interpretation
4. **Caching**: Results cached in Redis
5. **Storage**: Dream and interpretation saved to PostgreSQL
6. **Response**: Formatted result returned to user

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
- **Database**: Read replicas for read-heavy operations
- **Caching**: Redis cluster for distributed caching
- **CDN**: Static assets served via CDN
- **Load Balancing**: Nginx for request distribution

## Development Workflow

1. **Local Development**: Docker Compose for all services
2. **Version Control**: Git with feature branches
3. **CI/CD**: GitHub Actions / GitLab CI
4. **Testing**: Unit, integration, and E2E tests
5. **Code Quality**: Pre-commit hooks, linting, type checking