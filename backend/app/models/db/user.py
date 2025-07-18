# ai_context_v3
"""
🎯 main_goal: SQLAlchemy User model matching database schema
⚡ critical_requirements: 
   - Unique telegram_id constraint
   - Relationships to dreams and subscriptions
   - Default values for language and timezone
📥 inputs_outputs: None -> User ORM model
🔧 functions_list: User table model with relationships
🚫 forbidden_changes: Do not change column names or types
🧪 tests: test_user_model.py
"""

from typing import List, TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .dream import Dream
    from .subscription import Subscription
    from .user_stats import UserStats


class User(Base):
    """User model for database"""
    __tablename__ = "users"
    
    # Columns
    telegram_id: Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        nullable=False,
        index=True
    )
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    language_code: Mapped[str] = mapped_column(
        String(10),
        default="ru",
        server_default="ru"
    )
    timezone: Mapped[str] = mapped_column(
        String(50),
        default="Europe/Moscow",
        server_default="Europe/Moscow"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default="true"
    )
    
    # Relationships
    dreams: Mapped[List["Dream"]] = relationship(
        "Dream",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Subscription.created_at)"
    )
    stats: Mapped["UserStats"] = relationship(
        "UserStats",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False
    )
    
    @property
    def active_subscription(self) -> "Subscription | None":
        """Get current active subscription"""
        for sub in self.subscriptions:
            if sub.status == "active":
                return sub
        return None
    
    @property
    def display_name(self) -> str:
        """Get user display name"""
        if self.first_name:
            name = self.first_name
            if self.last_name:
                name += f" {self.last_name}"
            return name
        return self.username or f"User {self.telegram_id}"
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, telegram_id={self.telegram_id}, username={self.username})>"