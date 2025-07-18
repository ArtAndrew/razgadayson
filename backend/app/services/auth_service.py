# ai_context_v3
"""
🎯 main_goal: Authentication service with JWT and Telegram OAuth
⚡ critical_requirements: 
   - Secure JWT token generation
   - Telegram data validation
   - Token refresh mechanism
   - User session management
📥 inputs_outputs: Auth data -> JWT tokens
🔧 functions_list:
   - create_tokens: Generate access and refresh tokens
   - verify_token: Validate and decode JWT
   - authenticate_telegram: Validate Telegram OAuth
   - refresh_access_token: Refresh expired token
🚫 forbidden_changes: Do not expose secret keys
🧪 tests: test_auth_service.py
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple
from uuid import UUID
import hashlib
import hmac

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from loguru import logger

from app.core.config import settings
from app.models.db import User, Subscription
from app.models.schemas.auth import Token, TokenPayload, TelegramAuthData
from app.models.schemas.user import UserCreate, UserResponse


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service for authentication and authorization"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        self.refresh_token_expire = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    def create_access_token(self, user_id: UUID, telegram_id: int) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + self.access_token_expire
        
        payload = TokenPayload(
            sub=user_id,
            exp=expire,
            iat=datetime.utcnow(),
            type="access",
            telegram_id=telegram_id
        )
        
        encoded_jwt = jwt.encode(
            payload.model_dump(mode="json"),
            self.secret_key,
            algorithm=self.algorithm
        )
        
        return encoded_jwt
    
    def create_refresh_token(self, user_id: UUID, telegram_id: int) -> str:
        """Create JWT refresh token"""
        expire = datetime.utcnow() + self.refresh_token_expire
        
        payload = TokenPayload(
            sub=user_id,
            exp=expire,
            iat=datetime.utcnow(),
            type="refresh",
            telegram_id=telegram_id
        )
        
        encoded_jwt = jwt.encode(
            payload.model_dump(mode="json"),
            self.secret_key,
            algorithm=self.algorithm
        )
        
        return encoded_jwt
    
    def create_tokens(self, user_id: UUID, telegram_id: int) -> Token:
        """Create both access and refresh tokens"""
        access_token = self.create_access_token(user_id, telegram_id)
        refresh_token = self.create_refresh_token(user_id, telegram_id)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=int(self.access_token_expire.total_seconds())
        )
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[TokenPayload]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            
            token_data = TokenPayload(**payload)
            
            # Verify token type
            if token_data.type != token_type:
                logger.warning(f"Invalid token type: expected {token_type}, got {token_data.type}")
                return None
                
            # Check expiration
            if datetime.utcnow() > token_data.exp:
                logger.warning("Token has expired")
                return None
                
            return token_data
            
        except JWTError as e:
            logger.error(f"JWT validation error: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in token verification: {e}")
            return None
    
    def validate_telegram_auth(self, auth_data: TelegramAuthData) -> bool:
        """Validate Telegram OAuth data"""
        bot_token = settings.TELEGRAM_BOT_TOKEN
        
        # Create data check string
        data_check_arr = []
        data_dict = auth_data.model_dump(exclude={'hash'})
        
        for key, value in data_dict.items():
            if value is not None:
                data_check_arr.append(f"{key}={value}")
        
        data_check_arr.sort()
        data_check_string = "\n".join(data_check_arr)
        
        # Create secret key
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Validate hash
        is_valid = calculated_hash == auth_data.hash
        
        if not is_valid:
            logger.warning("Invalid Telegram auth hash")
            
        return is_valid
    
    async def authenticate_telegram(
        self,
        auth_data: TelegramAuthData,
        db: AsyncSession
    ) -> Tuple[User, bool]:
        """Authenticate user via Telegram OAuth"""
        
        # Validate auth data
        if not self.validate_telegram_auth(auth_data):
            raise ValueError("Invalid Telegram authentication data")
        
        # Check if user exists
        result = await db.execute(
            select(User).where(User.telegram_id == auth_data.id)
        )
        user = result.scalar_one_or_none()
        
        is_new_user = False
        
        if not user:
            # Create new user
            user = User(
                telegram_id=auth_data.id,
                username=auth_data.username,
                first_name=auth_data.first_name,
                last_name=auth_data.last_name
            )
            db.add(user)
            
            # Create default free subscription
            subscription = Subscription(
                user_id=user.id,
                type="free",
                status="active"
            )
            db.add(subscription)
            
            await db.commit()
            await db.refresh(user)
            
            is_new_user = True
            logger.info(f"Created new user: {user.id}")
        else:
            # Update user info if changed
            if auth_data.username and user.username != auth_data.username:
                user.username = auth_data.username
            if auth_data.first_name and user.first_name != auth_data.first_name:
                user.first_name = auth_data.first_name
            if auth_data.last_name and user.last_name != auth_data.last_name:
                user.last_name = auth_data.last_name
                
            await db.commit()
            logger.info(f"User logged in: {user.id}")
        
        return user, is_new_user
    
    async def refresh_access_token(
        self,
        refresh_token: str,
        db: AsyncSession
    ) -> Optional[Token]:
        """Refresh access token using refresh token"""
        
        # Verify refresh token
        token_data = self.verify_token(refresh_token, token_type="refresh")
        if not token_data:
            return None
        
        # Get user
        user = await db.get(User, token_data.sub)
        if not user or not user.is_active:
            return None
        
        # Create new tokens
        new_tokens = self.create_tokens(user.id, user.telegram_id)
        
        logger.info(f"Refreshed tokens for user: {user.id}")
        return new_tokens
    
    async def get_current_user(
        self,
        token: str,
        db: AsyncSession
    ) -> Optional[User]:
        """Get current user from JWT token"""
        
        # Verify token
        token_data = self.verify_token(token)
        if not token_data:
            return None
        
        # Get user
        user = await db.get(User, token_data.sub)
        if not user or not user.is_active:
            return None
        
        return user
    
    def hash_password(self, password: str) -> str:
        """Hash password for storage"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)