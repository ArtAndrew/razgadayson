# ai_context_v3
"""
🎯 main_goal: Pydantic schemas for authentication
⚡ critical_requirements: 
   - JWT token schemas
   - Telegram OAuth validation
   - Secure data handling
📥 inputs_outputs: Auth data -> Validated schemas
🔧 functions_list: Auth model schemas with validation
🚫 forbidden_changes: Do not store sensitive data
🧪 tests: test_auth_schemas.py
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
import hashlib
import hmac

from pydantic import BaseModel, Field, field_validator


class Token(BaseModel):
    """JWT token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Seconds until token expires")


class TokenPayload(BaseModel):
    """JWT token payload schema"""
    sub: UUID  # User ID
    exp: datetime
    iat: datetime
    type: str = Field(..., pattern="^(access|refresh)$")
    telegram_id: Optional[int] = None


class TelegramAuthData(BaseModel):
    """Telegram OAuth data schema"""
    id: int = Field(..., description="Telegram user ID")
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int = Field(..., description="Unix timestamp")
    hash: str = Field(..., description="Data hash for validation")
    
    @field_validator('auth_date')
    @classmethod
    def validate_auth_date(cls, v: int) -> int:
        # Check if auth_date is not too old (5 minutes)
        current_time = int(datetime.now().timestamp())
        if current_time - v > 300:
            raise ValueError("Authentication data is too old")
        return v
    
    def validate_hash(self, bot_token: str) -> bool:
        """Validate Telegram data hash"""
        # Create data check string
        data_check_arr = []
        for key, value in self.model_dump(exclude={'hash'}).items():
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
        
        return calculated_hash == self.hash


class LoginRequest(BaseModel):
    """Login request schema"""
    telegram_data: TelegramAuthData


class LoginResponse(BaseModel):
    """Login response schema"""
    user: dict  # UserResponse
    tokens: Token
    is_new_user: bool = False


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str


class MagicLinkRequest(BaseModel):
    """Magic link request schema (for web)"""
    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class MagicLinkVerify(BaseModel):
    """Magic link verification schema"""
    token: str
    email: str