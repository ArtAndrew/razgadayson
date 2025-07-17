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
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Cache**: Redis (TTL=1h)
- **Task Queue**: Celery + Redis
- **AI**: OpenAI GPT-4.1, Whisper ASR, OpenAI TTS
- **Vector Store**: pgvector for semantic search

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
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Local Development

1. Clone the repository:
```bash
git clone [repository-url]
cd razgazdayson
```

2. Set up environment variables:
```bash
cp configs/env.example .env
# Edit .env with your configuration
```

3. Start services with Docker:
```bash
docker-compose up -d
```

4. Install dependencies and run migrations:
```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head

# Frontend
cd ../frontend
npm install

# Telegram WebApp
cd ../telegram-webapp
npm install
```

5. Start development servers:
```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev

# Telegram WebApp
cd telegram-webapp
npm start
```

## KPIs

- Retention D7 ≥ 35%
- Retention D30 ≥ 25%
- LTV/CAC ≥ 3
- Viral k-factor ≥ 0.25

## Documentation

- [Architecture](docs/architecture.md)
- [API Specification](docs/api_specification.md)
- [Deployment Guide](docs/deployment.md)
- [Security Policy](docs/security_policy.md)

## License

Proprietary - All rights reserved