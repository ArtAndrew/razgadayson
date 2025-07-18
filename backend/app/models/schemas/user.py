# ai_context_v3
"""
🎯 main_goal: Pydantic schemas for User entity
⚡ critical_requirements: 
   - Match database schema exactly
   - Proper validation for all fields
   - Support for Telegram OAuth data
📥 inputs_outputs: User data -> Validated schemas
🔧 functions_list: User model schemas with validation
🚫 forbidden_changes: Do not change field names that match DB
🧪 tests: test_user_schemas.py
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """Base user schema with common fields"""
    username: Optional[str] = Field(None, max_length=255)
    first_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    language_code: str = Field(default="ru", max_length=10)
    timezone: str = Field(default="Europe/Moscow", max_length=50)


class UserCreate(UserBase):
    """Schema for creating a new user from Telegram data"""
    telegram_id: int = Field(..., description="Telegram user ID")
    
    @field_validator('telegram_id')
    @classmethod
    def validate_telegram_id(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Telegram ID must be positive")
        return v


class UserUpdate(BaseModel):
    """Schema for updating user data"""
    username: Optional[str] = Field(None, max_length=255)
    first_name: Optional[str] = Field(None, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    language_code: Optional[str] = Field(None, max_length=10)
    timezone: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None


class UserInDB(UserBase):
    """Schema for user stored in database"""
    id: UUID
    telegram_id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    
    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """Schema for user response to client"""
    id: UUID
    telegram_id: int
    created_at: datetime
    is_active: bool = True
    subscription_type: Optional[str] = "free"
    daily_limit: int = 1
    dreams_today: int = 0
    
    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """Schema for user statistics"""
    user_id: UUID
    total_dreams: int = 0
    current_streak: int = 0
    longest_streak: int = 0
    last_dream_date: Optional[datetime] = None
    favorite_symbol: Optional[str] = None
    favorite_symbol_count: int = 0
    updated_at: datetime
    
    class Config:
        from_attributes = True