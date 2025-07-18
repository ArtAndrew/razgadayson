# Разгадай Сон - AI Dream Interpretation Service

AI-powered dream interpretation service available as Telegram WebApp and web application.

## Overview

"Разгадай Сон" combines LLM analytics, voice interfaces, and social mechanics to provide instant dream interpretations. The service targets 8M+ monthly searches for "к чему снится..." in Russia.

## Core Features

- Text/voice dream input
- AI interpretation (symbols, emotions, advice)
- OpenAI-TTS voice output
- Personal dream journal with tags and statistics
- Push notifications and drip content
- Pro subscription + Deep-Dive analysis
- Referral program

## Tech Stack

### Backend
- **Framework**: FastAPI 0.109.0 (Python 3.12)
- **Database**: PostgreSQL 16 with SQLAlchemy ORM
- **Cache**: Redis 7 (TTL=1h)
- **Task Queue**: Celery + Redis
- **AI**: OpenAI GPT-4, Whisper ASR, OpenAI TTS
- **Vector Store**: pgvector extension for semantic search

### Frontend
- **Web App**: Next.js + React + Tailwind CSS
- **Telegram WebApp**: React + Tailwind CSS
- **Telegram Bot**: Python (aiogram)

### Infrastructure
- **Hosting**: Self-hosted with Nginx
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **CI/CD**: GitHub Actions / GitLab CI

## Project Structure

```
razgazdayson/
├── backend/              # FastAPI backend service
├── frontend/             # Next.js web application
├── telegram-webapp/      # Telegram WebApp client
├── telegram-bot/         # Telegram bot service
├── shared/              # Shared resources
├── docker/              # Docker configurations
├── docs/                # Project documentation
├── monitoring/          # Monitoring setup
├── feedback/            # Feedback collection service
└── configs/             # Configuration files
```

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20 LTS
- PostgreSQL 16+ with pgvector extension
- Redis 7+
- Docker & Docker Compose
- Make (for development commands)

### Local Development

1. Clone the repository:
```bash
git clone git@github.com:ArtAndrew/razgadayson.git
cd razgazdayson
```

2. Set up environment variables:
```bash
# Use Makefile for easy setup
make env

# Or manually copy environment files
cp backend/.env.example backend/.env
cp telegram-bot/.env.example telegram-bot/.env
cp frontend/.env.example frontend/.env.local
cp telegram-webapp/.env.example telegram-webapp/.env

# Edit .env files with your API keys
```

3. Start services with Docker:
```bash
# Use Makefile for easy development
make start

# Or manually with Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

4. Run database migrations:
```bash
# Database will be automatically initialized with pgvector
# Run migrations if needed
make migrate

# Or manually
# cd backend
# alembic upgrade head
```

5. View logs and manage services:
```bash
# View all logs
make logs

# Follow logs
make logs-f

# View specific service logs
make backend-logs
make frontend-logs
make bot-logs

# Stop services
make stop

# Restart services
make restart
```

### Development Commands

The project includes a comprehensive Makefile for development:

```bash
# Environment setup
make env          # Copy .env.example files
make check-env    # Verify environment setup

# Service management
make start        # Start all services
make stop         # Stop all services
make restart      # Restart all services
make build        # Build Docker images

# Database operations
make migrate      # Run database migrations
make db-shell     # Open PostgreSQL shell
make db-backup    # Create database backup

# Development utilities
make test         # Run all tests
make logs         # View service logs
make health       # Check service health
make clean        # Clean up (removes data!)
```

## Key Features

- **AI Dream Interpretation**: GPT-4 powered analysis with symbols and emotions
- **Semantic Search**: pgvector-based similarity search for dream patterns
- **Multi-Interface**: Telegram Bot, WebApp, and web application
- **Voice Support**: Whisper ASR for voice dreams, TTS for audio responses
- **Analytics**: Personal dream statistics and symbol patterns
- **Subscription Tiers**: Free and Pro plans with different features

## KPIs

- Retention D7 ≥ 35%
- Retention D30 ≥ 25%
- LTV/CAC ≥ 3
- Viral k-factor ≥ 0.25

## Service URLs

When running locally with `make start`:

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Telegram WebApp**: http://localhost:3001
- **pgAdmin**: http://localhost:5050 (admin@razgazdayson.ru / admin)
- **Redis Commander**: http://localhost:8081
- **API Documentation**: http://localhost:8000/docs

## Documentation

- [Architecture](docs/architecture.md)
- [API Specification](docs/api_specification.md)
- [Deployment Guide](docs/deployment.md)
- [Security Policy](docs/security_policy.md)
- [Development Guide](CLAUDE.md)

## License

Proprietary - All rights reserved