# Claude Development Guide for Razgazdayson

## Project Overview

Razgazdayson is an AI-powered dream interpretation service implemented as:
- Telegram Bot + WebApp
- Web application with Next.js
- FastAPI backend with PostgreSQL and Redis
- OpenAI GPT-4 for dream analysis

## Key Development Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Telegram Bot
```bash
cd telegram-bot
pip install -r requirements.txt
python main.py
```

### Docker Development
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## Project Structure

```
razgazdayson/
├── backend/              # FastAPI backend
│   ├── app/             # Application code
│   ├── migrations/      # Alembic migrations
│   └── tests/          # Backend tests
├── frontend/            # Next.js web app
│   ├── src/            # Source code
│   └── public/         # Static assets
├── telegram-webapp/     # Telegram Mini App
│   └── src/            # React app
├── telegram-bot/        # Telegram bot
│   ├── handlers/       # Message handlers
│   └── services/       # Business logic
├── shared/             # Shared types/utils
├── docker/             # Docker configs
├── docs/               # Documentation
├── monitoring/         # Prometheus/Grafana
└── configs/            # Production configs
```

## Key Features to Implement

1. **Dream Input Processing**
   - Text input validation (20-4000 chars)
   - Voice message transcription (Whisper API)
   - Language detection

2. **AI Interpretation**
   - GPT-4 prompt engineering
   - Symbol extraction
   - Emotion analysis
   - Psychological insights

3. **User Management**
   - Telegram OAuth
   - JWT authentication
   - Subscription tiers (Free/Pro)

4. **Rate Limiting**
   - Free users: 1 dream/day
   - Pro users: Unlimited
   - Redis-based counters

5. **Data Storage**
   - PostgreSQL for user data
   - pgvector for semantic search
   - Redis for caching

## Testing Strategy

- Unit tests with pytest/jest
- Integration tests for API
- E2E tests with Playwright
- Load testing with Locust

## Security Considerations

- Input sanitization
- Rate limiting
- HTTPS everywhere
- Telegram webhook validation
- Environment-based secrets

## Performance Optimization

- Redis caching for AI responses
- Database query optimization
- CDN for static assets
- Lazy loading in frontend
- WebP images

## Monitoring

- Prometheus metrics
- Grafana dashboards
- Sentry error tracking
- Custom business metrics

## CI/CD Pipeline

1. Lint and type check
2. Run tests
3. Build Docker images
4. Deploy to staging
5. Run E2E tests
6. Deploy to production

## Common Issues & Solutions

1. **OpenAI Rate Limits**: Implement exponential backoff
2. **Database Connections**: Use connection pooling
3. **Telegram Timeouts**: Async processing with webhooks
4. **Memory Leaks**: Monitor with Prometheus
5. **CORS Issues**: Check security.config.json5