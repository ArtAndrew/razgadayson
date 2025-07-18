# ai_context_v3
"""
🎯 main_goal: Authentication endpoints (login, register, refresh, logout)
⚡ critical_requirements:
   - JWT token authentication
   - Telegram OAuth support
   - Magic link authentication
   - Secure password hashing
📥 inputs_outputs: Auth credentials -> JWT tokens
🔧 functions_list:
   - register: User registration
   - login: User login
   - refresh: Token refresh
   - logout: User logout
   - telegram_auth: Telegram OAuth
🚫 forbidden_changes: Do not store plain passwords
🧪 tests: test_auth.py with security tests
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.core.database import get_db
from app.core.config import settings
from app.core.redis import get_redis
from app.models.schemas.auth import (
    LoginResponse,
    RefreshTokenRequest,
    TelegramAuthData,
    Token,
    MagicLinkRequest,
    MagicLinkVerify
)
from app.models.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.api.dependencies import get_current_user
from app.models.db import User

router = APIRouter()
security = HTTPBearer()


@router.post("/telegram", response_model=LoginResponse)
async def telegram_auth(
    auth_data: TelegramAuthData,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Authenticate user via Telegram OAuth"""
    auth_service = AuthService()
    
    try:
        # Authenticate user
        user, is_new_user = await auth_service.authenticate_telegram(auth_data, db)
        
        # Create tokens
        tokens = auth_service.create_tokens(user.id, user.telegram_id)
        
        # Get active subscription info
        active_sub = user.active_subscription
        subscription_type = active_sub.type if active_sub else "free"
        daily_limit = active_sub.daily_limit if active_sub else 1
        
        # Count today's dreams
        redis = await get_redis()
        today_key = f"dream_count:{user.id}:{datetime.now().date()}"
        dreams_today_str = await redis.get(today_key)
        dreams_today = int(dreams_today_str) if dreams_today_str else 0
        
        # Prepare user response
        user_response = UserResponse(
            id=user.id,
            telegram_id=user.telegram_id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            language_code=user.language_code,
            timezone=user.timezone,
            created_at=user.created_at,
            is_active=user.is_active,
            subscription_type=subscription_type,
            daily_limit=daily_limit,
            dreams_today=dreams_today
        )
        
        logger.info(f"Telegram auth successful for user {user.id}")
        
        return LoginResponse(
            user=user_response.model_dump(),
            tokens=tokens,
            is_new_user=is_new_user
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Telegram auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Refresh access token using refresh token"""
    auth_service = AuthService()
    
    new_tokens = await auth_service.refresh_access_token(request.refresh_token, db)
    
    if not new_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    return new_tokens


@router.post("/logout")
async def logout(
    current_user: Annotated[User, Depends(get_current_user)],
    response: Response
):
    """Logout current user"""
    # In JWT auth, logout is handled client-side by removing tokens
    # Here we can blacklist the token if needed
    
    # Optional: Add token to blacklist in Redis
    # redis = await get_redis()
    # await redis.setex(f"blacklist:{token}", 3600, "1")
    
    logger.info(f"User {current_user.id} logged out")
    
    return {"message": "Successfully logged out"}


@router.post("/magic-link/request")
async def request_magic_link(
    request: MagicLinkRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Request magic link for email authentication"""
    # TODO: Implement magic link generation and email sending
    # This is a placeholder for future implementation
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Magic link authentication not yet implemented"
    )


@router.post("/magic-link/verify")
async def verify_magic_link(
    request: MagicLinkVerify,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    """Verify magic link token"""
    # TODO: Implement magic link verification
    # This is a placeholder for future implementation
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Magic link verification not yet implemented"
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Get current user information"""
    # Get subscription info
    active_sub = current_user.active_subscription
    subscription_type = active_sub.type if active_sub else "free"
    daily_limit = active_sub.daily_limit if active_sub else 1
    
    # Count today's dreams
    redis = await get_redis()
    today_key = f"dream_count:{current_user.id}:{datetime.now().date()}"
    dreams_today_str = await redis.get(today_key)
    dreams_today = int(dreams_today_str) if dreams_today_str else 0
    
    return UserResponse(
        id=current_user.id,
        telegram_id=current_user.telegram_id,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        language_code=current_user.language_code,
        timezone=current_user.timezone,
        created_at=current_user.created_at,
        is_active=current_user.is_active,
        subscription_type=subscription_type,
        daily_limit=daily_limit,
        dreams_today=dreams_today
    )


# Import datetime
from datetime import datetime