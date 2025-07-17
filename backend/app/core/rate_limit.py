# ai_context_v3
"""
🎯 main_goal: Rate limiting implementation using slowapi
⚡ critical_requirements:
   - Per-user rate limiting
   - Global rate limiting
   - Redis-based storage
   - Configurable limits
📥 inputs_outputs: Request -> Rate limit check
🔧 functions_list:
   - get_remote_address: Get client IP
   - limiter: Rate limiter instance
🚫 forbidden_changes: Do not bypass rate limits in production
🧪 tests: test_rate_limit.py with limit tests
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address as _get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from starlette.responses import Response
from typing import Optional

from app.core.config import settings


def get_remote_address(request: Request) -> str:
    """
    Get client IP address, checking X-Forwarded-For header first
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return _get_remote_address(request)


def key_func(request: Request) -> str:
    """
    Generate rate limit key based on user ID if authenticated,
    otherwise use IP address
    """
    # Try to get user ID from JWT token
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    
    # Fall back to IP address
    return f"ip:{get_remote_address(request)}"


# Create limiter instance
limiter = Limiter(
    key_func=key_func,
    default_limits=[f"{settings.RATE_LIMIT_GLOBAL_HOURLY}/hour"],
    storage_uri=settings.REDIS_URL,
    strategy="fixed-window",
    headers_enabled=True,
)


# Rate limit decorators for common use cases
def rate_limit_authenticated(limit: str):
    """Rate limit decorator for authenticated endpoints"""
    return limiter.limit(limit, key_func=lambda r: f"user:{r.state.user_id}")


def rate_limit_anonymous(limit: str):
    """Rate limit decorator for anonymous endpoints"""
    return limiter.limit(limit, key_func=lambda r: f"ip:{get_remote_address(r)}")


# Specific rate limits
auth_rate_limit = limiter.limit("5/minute")
dream_rate_limit = limiter.limit(f"{settings.FREE_DAILY_LIMIT}/day")
api_rate_limit = limiter.limit("100/hour")