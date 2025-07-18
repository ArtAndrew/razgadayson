# ai_context_v3
"""
🎯 main_goal: Pydantic schemas for Dream and DreamInterpretation entities
⚡ critical_requirements: 
   - Text validation (20-4000 chars)
   - Support for voice dreams
   - JSON fields for emotions
📥 inputs_outputs: Dream data -> Validated schemas
🔧 functions_list: Dream model schemas with validation
🚫 forbidden_changes: Do not change field constraints
🧪 tests: test_dream_schemas.py
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, HttpUrl


class DreamBase(BaseModel):
    """Base dream schema with common fields"""
    text: str = Field(..., min_length=20, max_length=4000)
    voice_url: Optional[HttpUrl] = None
    language: str = Field(default="ru", max_length=10)
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v: str) -> str:
        # Clean up whitespace
        v = v.strip()
        if len(v) < 20:
            raise ValueError("Dream description must be at least 20 characters")
        if len(v) > 4000:
            raise ValueError("Dream description must not exceed 4000 characters")
        return v


class DreamCreate(DreamBase):
    """Schema for creating a new dream"""
    pass


class DreamUpdate(BaseModel):
    """Schema for updating a dream"""
    text: Optional[str] = Field(None, min_length=20, max_length=4000)
    is_deleted: Optional[bool] = None


class DreamTag(BaseModel):
    """Schema for dream tags"""
    id: Optional[UUID] = None
    tag: str = Field(..., max_length=50)
    created_at: Optional[datetime] = None
    
    @field_validator('tag')
    @classmethod
    def validate_tag(cls, v: str) -> str:
        v = v.strip().lower()
        if not v:
            raise ValueError("Tag cannot be empty")
        return v


class DreamInterpretation(BaseModel):
    """Schema for dream interpretation"""
    id: Optional[UUID] = None
    dream_id: UUID
    main_symbol: str = Field(..., max_length=255)
    main_symbol_emoji: Optional[str] = Field(None, max_length=10)
    interpretation: str
    emotions: List[Dict[str, Any]] = Field(default_factory=list)
    advice: Optional[str] = None
    ai_model: str = Field(default="gpt-4-turbo-preview", max_length=50)
    prompt_version: str = Field(default="v1.0", max_length=20)
    created_at: Optional[datetime] = None
    processing_time_ms: Optional[int] = None
    
    class Config:
        from_attributes = True


class DreamInDB(DreamBase):
    """Schema for dream stored in database"""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    is_deleted: bool = False
    
    class Config:
        from_attributes = True


class DreamResponse(BaseModel):
    """Schema for dream response to client"""
    id: UUID
    text: str
    voice_url: Optional[str] = None
    language: str
    created_at: datetime
    interpretation: Optional[DreamInterpretation] = None
    tags: List[str] = Field(default_factory=list)
    similar_dreams_count: int = 0
    
    class Config:
        from_attributes = True


class DreamInterpretRequest(BaseModel):
    """Schema for dream interpretation request"""
    text: str = Field(..., min_length=20, max_length=4000)
    voice_data: Optional[str] = Field(None, description="Base64 encoded voice data")
    language: str = Field(default="ru", max_length=10)
    include_similar: bool = Field(default=True, description="Include similar dreams in analysis")


class DreamInterpretResponse(BaseModel):
    """Schema for dream interpretation response"""
    dream_id: UUID
    interpretation: DreamInterpretation
    similar_dreams: List[Dict[str, Any]] = Field(default_factory=list)
    daily_limit_remaining: int
    is_saved: bool = False