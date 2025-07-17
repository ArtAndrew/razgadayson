# ai_context_v3
"""
🎯 main_goal: Main FastAPI application entry point with middleware and routers
⚡ critical_requirements: 
   - Proper CORS configuration
   - Security middleware
   - Health checks
   - Rate limiting
   - Structured logging
📥 inputs_outputs: HTTP requests -> JSON responses
🔧 functions_list:
   - create_app: Application factory
   - lifespan: Startup/shutdown lifecycle
   - setup_middleware: Configure all middleware
   - setup_routes: Mount all API routes
🚫 forbidden_changes: Do not hardcode secrets or configuration
🧪 tests: test_main.py with health check and middleware tests
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from loguru import logger

from app.api.v1 import health, dreams, auth, users, subscriptions
from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.redis import init_redis, close_redis
from app.core.rate_limit import limiter
from app.errors.handlers import setup_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle management"""
    logger.info("Starting up Razgazdayson API...")
    
    # Initialize database
    await init_db()
    
    # Initialize Redis
    await init_redis()
    
    # Initialize Sentry if configured
    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.1,
            environment=settings.ENVIRONMENT
        )
    
    yield
    
    # Cleanup
    logger.info("Shutting down Razgazdayson API...")
    await close_db()
    await close_redis()


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="AI Dream Interpretation Service API",
        lifespan=lifespan,
        docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
    )
    
    # Setup middleware
    setup_middleware(app)
    
    # Setup routes
    setup_routes(app)
    
    # Setup exception handlers
    setup_exception_handlers(app)
    
    # Add rate limiter error handler
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Setup metrics
    if settings.ENABLE_METRICS:
        Instrumentator().instrument(app).expose(app)
    
    return app


def setup_middleware(app: FastAPI) -> None:
    """Configure all middleware"""
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Trusted host
    if settings.ALLOWED_HOSTS:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS
        )
    
    # Rate limiting
    app.state.limiter = limiter


def setup_routes(app: FastAPI) -> None:
    """Mount all API routes"""
    # Health checks
    app.include_router(health.router, tags=["health"])
    
    # API v1 routes
    api_v1_prefix = "/api/v1"
    app.include_router(auth.router, prefix=f"{api_v1_prefix}/auth", tags=["auth"])
    app.include_router(users.router, prefix=f"{api_v1_prefix}/users", tags=["users"])
    app.include_router(dreams.router, prefix=f"{api_v1_prefix}/dreams", tags=["dreams"])
    app.include_router(subscriptions.router, prefix=f"{api_v1_prefix}/subscriptions", tags=["subscriptions"])


# Create app instance
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development"
    )