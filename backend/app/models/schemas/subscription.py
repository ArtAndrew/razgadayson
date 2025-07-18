# ai_context_v3
"""
🎯 main_goal: Pydantic schemas for Subscription entity
⚡ critical_requirements: 
   - Strict enum validation for type and status
   - Payment data handling
   - Date validation
📥 inputs_outputs: Subscription data -> Validated schemas
🔧 functions_list: Subscription model schemas with validation
🚫 forbidden_changes: Do not change subscription types/statuses
🧪 tests: test_subscription_schemas.py
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class SubscriptionType(str, Enum):
    """Subscription types enum"""
    FREE = "free"
    TRIAL = "trial"
    PRO = "pro"
    YEARLY = "yearly"


class SubscriptionStatus(str, Enum):
    """Subscription status enum"""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class SubscriptionBase(BaseModel):
    """Base subscription schema"""
    type: SubscriptionType
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    payment_provider: Optional[str] = Field(None, max_length=50)
    payment_id: Optional[str] = Field(None, max_length=255)


class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a new subscription"""
    user_id: UUID
    end_date: Optional[datetime] = None
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[datetime], values: dict) -> Optional[datetime]:
        if v and 'type' in values:
            if values['type'] == SubscriptionType.FREE and v is not None:
                raise ValueError("Free subscriptions should not have an end date")
        return v


class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription"""
    status: Optional[SubscriptionStatus] = None
    end_date: Optional[datetime] = None
    payment_provider: Optional[str] = Field(None, max_length=50)
    payment_id: Optional[str] = Field(None, max_length=255)


class SubscriptionInDB(SubscriptionBase):
    """Schema for subscription stored in database"""
    id: UUID
    user_id: UUID
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    """Schema for subscription response to client"""
    id: UUID
    type: SubscriptionType
    status: SubscriptionStatus
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool = True
    daily_limit: int = 1
    features: dict = Field(default_factory=dict)
    
    @field_validator('daily_limit', mode='before')
    @classmethod
    def set_daily_limit(cls, v: int, values: dict) -> int:
        if 'type' in values:
            if values['type'] in [SubscriptionType.PRO, SubscriptionType.YEARLY]:
                return 999999  # Unlimited
            elif values['type'] == SubscriptionType.TRIAL:
                return 3
        return 1  # Free default
    
    @field_validator('features', mode='before')
    @classmethod
    def set_features(cls, v: dict, values: dict) -> dict:
        if 'type' in values:
            sub_type = values['type']
            features = {
                "daily_limit": 1,
                "voice_input": True,
                "tts_output": False,
                "deep_analysis": False,
                "similar_dreams": False,
                "export_data": False,
                "priority_support": False
            }
            
            if sub_type == SubscriptionType.TRIAL:
                features.update({
                    "daily_limit": 3,
                    "tts_output": True,
                    "similar_dreams": True
                })
            elif sub_type == SubscriptionType.PRO:
                features.update({
                    "daily_limit": 999999,
                    "tts_output": True,
                    "deep_analysis": True,
                    "similar_dreams": True,
                    "export_data": True
                })
            elif sub_type == SubscriptionType.YEARLY:
                features.update({
                    "daily_limit": 999999,
                    "tts_output": True,
                    "deep_analysis": True,
                    "similar_dreams": True,
                    "export_data": True,
                    "priority_support": True
                })
            
            return features
        return v
    
    class Config:
        from_attributes = True