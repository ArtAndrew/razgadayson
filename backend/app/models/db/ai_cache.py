# ai_context_v3
"""
🎯 main_goal: SQLAlchemy AIResponseCache model for caching LLM responses
⚡ critical_requirements: 
   - Hash-based cache lookup
   - Expiration time support
   - JSON response storage
📥 inputs_outputs: None -> AIResponseCache ORM model
🔧 functions_list: AIResponseCache table model
🚫 forbidden_changes: Do not change hash algorithm
🧪 tests: test_ai_cache_model.py
"""

from datetime import datetime, timedelta

from sqlalchemy import String, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class AIResponseCache(Base):
    """AI response cache model for database"""
    __tablename__ = "ai_response_cache"
    
    # Columns
    prompt_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        index=True
    )
    response: Mapped[dict] = mapped_column(
        JSON,
        nullable=False
    )
    model: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        nullable=False
    )
    
    # Unique constraint on prompt_hash + model
    __table_args__ = (
        UniqueConstraint("prompt_hash", "model", name="uq_prompt_hash_model"),
    )
    
    @property
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        return datetime.now() > self.expires_at
    
    @classmethod
    def create_cache_entry(
        cls,
        prompt_hash: str,
        response: dict,
        model: str,
        ttl_hours: int = 24
    ) -> "AIResponseCache":
        """Create a new cache entry with TTL"""
        return cls(
            prompt_hash=prompt_hash,
            response=response,
            model=model,
            expires_at=datetime.now() + timedelta(hours=ttl_hours)
        )
    
    def __repr__(self) -> str:
        return f"<AIResponseCache(id={self.id}, model={self.model}, expires_at={self.expires_at})>"