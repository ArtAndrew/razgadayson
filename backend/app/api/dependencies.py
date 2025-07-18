# ai_context_v3
"""
🎯 main_goal: FastAPI dependencies for auth and common functionality
⚡ critical_requirements: 
   - JWT token extraction from headers
   - Current user dependency
   - Database session management
   - Rate limiting checks
📥 inputs_outputs: Request headers -> User object
🔧 functions_list:
   - get_current_user: Extract and validate user from token
   - get_current_active_user: Ensure user is active
   - get_user_with_subscription: Load user with subscription
   - check_dream_limit: Verify daily limits
🚫 forbidden_changes: Do not bypass security checks
🧪 tests: test_dependencies.py
"""

from typing import Annotated, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from loguru import logger

from app.core.database import get_db
from app.core.redis import get_redis
from app.models.db import User, Subscription
from app.services.auth_service import AuthService


# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """Get current user from JWT token"""
    
    auth_service = AuthService()
    token = credentials.credentials
    
    # Verify token and get user
    user = await auth_service.get_current_user(token, db)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """Ensure current user is active"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


async def get_user_with_subscription(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> User:
    """Get user with loaded subscription relationship"""
    
    # Load user with subscription
    result = await db.execute(
        select(User)
        .options(selectinload(User.subscriptions))
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()
    
    return user


async def check_dream_limit(
    user: Annotated[User, Depends(get_user_with_subscription)],
    redis = Depends(get_redis)
) -> User:
    """Check if user has reached daily dream limit"""
    
    # Get active subscription
    active_sub = user.active_subscription
    if not active_sub:
        # Create default free subscription if missing
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active subscription found"
        )
    
    # Check daily limit
    daily_limit = active_sub.daily_limit
    if daily_limit >= 999999:  # Unlimited
        return user
    
    # Check Redis for today's count
    today_key = f"dream_count:{user.id}:{datetime.now().date()}"
    
    try:
        count_str = await redis.get(today_key)
        today_count = int(count_str) if count_str else 0
    except:
        today_count = 0
    
    if today_count >= daily_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily limit of {daily_limit} dreams reached",
            headers={"X-Daily-Limit": str(daily_limit), "X-Used-Today": str(today_count)}
        )
    
    return user


async def increment_dream_count(
    user_id: UUID,
    redis = Depends(get_redis)
) -> None:
    """Increment user's daily dream count"""
    today_key = f"dream_count:{user_id}:{datetime.now().date()}"
    
    try:
        await redis.incr(today_key)
        # Set expiration to end of day
        await redis.expire(today_key, 86400)  # 24 hours
    except Exception as e:
        logger.error(f"Failed to increment dream count: {e}")


# Optional dependencies for endpoints that work with/without auth
async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise None"""
    
    if not credentials:
        return None
    
    auth_service = AuthService()
    user = await auth_service.get_current_user(credentials.credentials, db)
    
    return user


# Pagination dependencies
from app.models.schemas.common import PaginationParams

def get_pagination(
    page: int = 1,
    limit: int = 20
) -> PaginationParams:
    """Get pagination parameters"""
    return PaginationParams(page=page, limit=limit)


# Import for missing datetime
from datetime import datetime