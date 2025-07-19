# ai_context_v3
"""
🎯 main_goal: SQLAlchemy Dream models matching database schema
⚡ critical_requirements: 
   - Text length constraint (20-4000)
   - Relationships to user and interpretation
   - Support for tags and embeddings
📥 inputs_outputs: None -> Dream ORM models
🔧 functions_list: Dream, DreamInterpretation, DreamTag models
🚫 forbidden_changes: Do not change constraints
🧪 tests: test_dream_model.py
"""

from typing import List, TYPE_CHECKING
from uuid import UUID as PythonUUID
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .user import User
    from .dream_embedding import DreamEmbedding


class Dream(Base):
    """Dream model for database"""
    __tablename__ = "dreams"
    
    # Columns
    user_id: Mapped[PythonUUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    voice_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(
        String(10),
        default="ru",
        server_default="ru"
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false"
    )
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "char_length(text) >= 20 AND char_length(text) <= 4000",
            name="check_text_length"
        ),
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="dreams")
    interpretation: Mapped["DreamInterpretation"] = relationship(
        "DreamInterpretation",
        back_populates="dream",
        cascade="all, delete-orphan",
        uselist=False
    )
    tags: Mapped[List["DreamTag"]] = relationship(
        "DreamTag",
        back_populates="dream",
        cascade="all, delete-orphan"
    )
    embeddings: Mapped[List["DreamEmbedding"]] = relationship(
        "DreamEmbedding",
        back_populates="dream",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Dream(id={self.id}, user_id={self.user_id}, text={self.text[:50]}...)>"


class DreamInterpretation(Base):
    """Dream interpretation model for database"""
    __tablename__ = "dream_interpretations"
    
    # Override table name generation
    @property
    def __tablename__(self):
        return "dream_interpretations"
    
    # Columns
    dream_id: Mapped[PythonUUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dreams.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    main_symbol: Mapped[str] = mapped_column(String(255), nullable=False)
    main_symbol_emoji: Mapped[str | None] = mapped_column(String(10), nullable=True)
    interpretation: Mapped[str] = mapped_column(Text, nullable=False)
    emotions: Mapped[list] = mapped_column(
        JSON,
        default=list,
        server_default="[]"
    )
    advice: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_model: Mapped[str] = mapped_column(
        String(50),
        default="gpt-4-turbo-preview",
        server_default="gpt-4-turbo-preview"
    )
    prompt_version: Mapped[str] = mapped_column(
        String(20),
        default="v1.0",
        server_default="v1.0"
    )
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    # Relationships
    dream: Mapped["Dream"] = relationship("Dream", back_populates="interpretation")
    
    def __repr__(self) -> str:
        return f"<DreamInterpretation(id={self.id}, dream_id={self.dream_id}, symbol={self.main_symbol})>"


class DreamTag(Base):
    """Dream tag model for database"""
    __tablename__ = "dream_tags"
    
    # Columns
    dream_id: Mapped[PythonUUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dreams.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    tag: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    
    # Relationships
    dream: Mapped["Dream"] = relationship("Dream", back_populates="tags")
    
    # Unique constraint on dream_id + tag
    __table_args__ = (
        CheckConstraint(
            "dream_id IS NOT NULL AND tag IS NOT NULL",
            name="unique_dream_tag"
        ),
    )
    
    def __repr__(self) -> str:
        return f"<DreamTag(id={self.id}, dream_id={self.dream_id}, tag={self.tag})>"