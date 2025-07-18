# Makefile for Razgazdayson Development
# ai_context_v3
# 🎯 main_goal: Simplify development workflow with common commands
# ⚡ critical_requirements: Easy-to-use commands for developers
# 📥 inputs_outputs: Make commands -> Docker/development actions
# 🔧 functions_list: help, env, start, stop, logs, test, migrate, clean
# 🚫 forbidden_changes: Do not hardcode credentials
# 🧪 tests: Manual testing of each command

.PHONY: help env start stop restart logs test migrate clean db-shell redis-cli build

# Default target
help:
	@echo "Razgazdayson Development Commands:"
	@echo ""
	@echo "  make env        - Copy .env.example files to .env (first time setup)"
	@echo "  make start      - Start all services with Docker Compose"
	@echo "  make stop       - Stop all services"
	@echo "  make restart    - Restart all services"
	@echo "  make logs       - Show logs from all services"
	@echo "  make logs-f     - Follow logs from all services"
	@echo "  make test       - Run all tests"
	@echo "  make migrate    - Run database migrations"
	@echo "  make clean      - Remove containers and volumes (WARNING: data loss)"
	@echo "  make db-shell   - Open PostgreSQL shell"
	@echo "  make redis-cli  - Open Redis CLI"
	@echo "  make build      - Build all Docker images"
	@echo "  make check-env  - Verify environment setup"
	@echo ""
	@echo "Service-specific commands:"
	@echo "  make backend-logs    - Show backend logs"
	@echo "  make bot-logs        - Show telegram bot logs"
	@echo "  make frontend-logs   - Show frontend logs"
	@echo ""

# Environment setup
env:
	@echo "Setting up environment files..."
	@test -f backend/.env || cp backend/.env.example backend/.env
	@test -f telegram-bot/.env || cp telegram-bot/.env.example telegram-bot/.env
	@test -f frontend/.env.local || (echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > frontend/.env.local)
	@test -f telegram-webapp/.env || (echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > telegram-webapp/.env)
	@echo "✅ Environment files created. Please update them with your API keys!"

# Check environment setup
check-env:
	@echo "Checking environment setup..."
	@test -f backend/.env || (echo "❌ backend/.env not found" && exit 1)
	@test -f telegram-bot/.env || (echo "❌ telegram-bot/.env not found" && exit 1)
	@grep -q "OPENAI_API_KEY=sk-" backend/.env || echo "⚠️  Warning: OpenAI API key not configured"
	@grep -q "BOT_TOKEN=.*:.*" telegram-bot/.env || echo "⚠️  Warning: Telegram bot token not configured"
	@echo "✅ Environment check complete"

# Docker commands
start: check-env
	@echo "Starting all services..."
	docker-compose -f docker/docker-compose.yml up -d
	@echo "✅ Services started!"
	@echo ""
	@echo "Access points:"
	@echo "  - Backend API:    http://localhost:8000"
	@echo "  - Frontend:       http://localhost:3000"
	@echo "  - Telegram WebApp: http://localhost:3001"
	@echo "  - pgAdmin:        http://localhost:5050 (admin@razgazdayson.ru / admin)"
	@echo "  - Redis Commander: http://localhost:8081"

stop:
	@echo "Stopping all services..."
	docker-compose -f docker/docker-compose.yml down
	@echo "✅ Services stopped"

restart: stop start

logs:
	docker-compose -f docker/docker-compose.yml logs

logs-f:
	docker-compose -f docker/docker-compose.yml logs -f

# Service-specific logs
backend-logs:
	docker-compose -f docker/docker-compose.yml logs -f backend

bot-logs:
	docker-compose -f docker/docker-compose.yml logs -f telegram-bot

frontend-logs:
	docker-compose -f docker/docker-compose.yml logs -f frontend

# Build images
build:
	@echo "Building all Docker images..."
	docker-compose -f docker/docker-compose.yml build
	@echo "✅ Build complete"

# Database operations
migrate:
	@echo "Running database migrations..."
	docker-compose -f docker/docker-compose.yml exec backend alembic upgrade head
	@echo "✅ Migrations complete"

db-shell:
	@echo "Connecting to PostgreSQL..."
	docker-compose -f docker/docker-compose.yml exec postgres psql -U postgres -d razgazdayson

db-backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	docker-compose -f docker/docker-compose.yml exec postgres pg_dump -U postgres razgazdayson | gzip > backups/razgazdayson_$(shell date +%Y%m%d_%H%M%S).sql.gz
	@echo "✅ Backup saved to backups/"

# Redis operations
redis-cli:
	@echo "Connecting to Redis..."
	docker-compose -f docker/docker-compose.yml exec redis redis-cli

# Testing
test:
	@echo "Running tests..."
	# Backend tests
	docker-compose -f docker/docker-compose.yml exec backend pytest
	# Frontend tests
	docker-compose -f docker/docker-compose.yml exec frontend npm test -- --passWithNoTests
	@echo "✅ All tests complete"

test-backend:
	docker-compose -f docker/docker-compose.yml exec backend pytest -v

test-frontend:
	docker-compose -f docker/docker-compose.yml exec frontend npm test

# Development utilities
shell-backend:
	docker-compose -f docker/docker-compose.yml exec backend /bin/bash

shell-bot:
	docker-compose -f docker/docker-compose.yml exec telegram-bot /bin/bash

# Clean up (WARNING: removes all data)
clean:
	@echo "⚠️  WARNING: This will remove all containers and volumes (data loss)!"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	docker-compose -f docker/docker-compose.yml down -v
	@echo "✅ Cleanup complete"

# Quick development setup
dev: env start
	@echo "✅ Development environment ready!"
	@echo "Run 'make logs-f' to see logs"

# Production-like build
prod-build:
	docker-compose -f docker/docker-compose.yml build --no-cache
	@echo "✅ Production build complete"

# Check services health
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8000/health/ready | jq '.' || echo "❌ Backend not responding"
	@curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend is running" || echo "❌ Frontend not responding"
	@docker-compose -f docker/docker-compose.yml ps