# ai_context_v3
"""
🎯 main_goal: SQLAlchemy DreamEmbedding model for pgvector storage
⚡ critical_requirements: 
   - pgvector type support
   - Relationship to dreams
   - Metadata JSON field
📥 inputs_outputs: None -> DreamEmbedding ORM model
🔧 functions_list: DreamEmbedding table model with vector column
🚫 forbidden_changes: Do not change vector dimensions
🧪 tests: test_dream_embedding_model.py
"""

from typing import TYPE_CHECKING, List
from uuid import UUID as PythonUUID

from sqlalchemy import ForeignKey, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from .base import Base

if TYPE_CHECKING:
    from .dream import Dream


class DreamEmbedding(Base):
    """Dream embedding model for vector similarity search"""
    __tablename__ = "dream_embeddings"
    __table_args__ = {"schema": "vector_store"}
    
    # Columns
    dream_id: Mapped[PythonUUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.dreams.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    embedding: Mapped[List[float]] = mapped_column(
        Vector(1536),  # OpenAI ada-002 dimension
        nullable=True
    )
    model: Mapped[str] = mapped_column(
        String(50),
        default="text-embedding-ada-002",
        server_default="text-embedding-ada-002"
    )
    metadata: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        server_default="{}"
    )
    
    # Unique constraint on dream_id + model
    __table_args__ = (
        {"unique_constraint": ("dream_id", "model")},
        {"schema": "vector_store"}
    )
    
    # Relationships
    dream: Mapped["Dream"] = relationship("Dream", back_populates="embeddings")
    
    def __repr__(self) -> str:
        return f"<DreamEmbedding(id={self.id}, dream_id={self.dream_id}, model={self.model})>"