# ai_context_v3
"""
🎯 main_goal: SQLAlchemy Subscription model matching database schema
⚡ critical_requirements: 
   - Type and status enums validation
   - Relationship to user
   - Payment tracking fields
📥 inputs_outputs: None -> Subscription ORM model
🔧 functions_list: Subscription table model
🚫 forbidden_changes: Do not change subscription types
🧪 tests: test_subscription_model.py
"""

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID as PythonUUID

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .user import User


class Subscription(Base):
    """Subscription model for database"""
    __tablename__ = "subscriptions"
    
    # Columns
    user_id: Mapped[PythonUUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True
    )
    start_date: Mapped[datetime] = mapped_column(
        nullable=False,
        server_default="CURRENT_TIMESTAMP"
    )
    end_date: Mapped[datetime | None] = mapped_column(nullable=True)
    payment_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Constraints
    __table_args__ = (
        CheckConstraint(
            "type IN ('free', 'trial', 'pro', 'yearly')",
            name="check_subscription_type"
        ),
        CheckConstraint(
            "status IN ('active', 'cancelled', 'expired')",
            name="check_subscription_status"
        ),
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="subscriptions")
    
    @property
    def is_active(self) -> bool:
        """Check if subscription is currently active"""
        if self.status != "active":
            return False
        
        if self.end_date and self.end_date < datetime.now():
            return False
        
        return True
    
    @property
    def daily_limit(self) -> int:
        """Get daily dream limit for subscription type"""
        limits = {
            "free": 1,
            "trial": 3,
            "pro": 999999,
            "yearly": 999999
        }
        return limits.get(self.type, 1)
    
    def __repr__(self) -> str:
        return f"<Subscription(id={self.id}, user_id={self.user_id}, type={self.type}, status={self.status})>"