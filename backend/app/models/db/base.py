# ai_context_v3
"""
🎯 main_goal: Base SQLAlchemy model class with common fields
⚡ critical_requirements: 
   - UUID primary keys
   - Automatic timestamps
   - Async SQLAlchemy support
📥 inputs_outputs: None -> Base model class
🔧 functions_list: Base model with common columns
🚫 forbidden_changes: Do not change Base class structure
🧪 tests: Inherited by all model tests
"""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base model class with common fields"""
    
    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name"""
        return cls.__name__.lower() + "s"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default=func.uuid_generate_v4()
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.current_timestamp()
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp()
    )