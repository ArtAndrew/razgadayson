# ai_context_v3
"""
🎯 main_goal: SQLAlchemy UserStats model matching database schema
⚡ critical_requirements: 
   - One-to-one relationship with User
   - Track dream statistics
   - Auto-update timestamps
📥 inputs_outputs: None -> UserStats ORM model
🔧 functions_list: UserStats table model
🚫 forbidden_changes: Do not change primary key structure
🧪 tests: test_user_stats_model.py
"""

from datetime import date, datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .user import User


class UserStats(Base):
    """User statistics model for database"""
    __tablename__ = "user_stats"
    
    # Override primary key - use user_id as primary key
    __table_args__ = {'extend_existing': True}
    
    # Columns
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )
    total_dreams: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0"
    )
    current_streak: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0"
    )
    longest_streak: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0"
    )
    last_dream_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    favorite_symbol: Mapped[str | None] = mapped_column(String(255), nullable=True)
    favorite_symbol_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        server_default="0"
    )
    updated_at: Mapped[datetime] = mapped_column(
        server_default="CURRENT_TIMESTAMP",
        onupdate=datetime.now
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="stats")
    
    def update_dream_count(self) -> None:
        """Update dream count and streak"""
        self.total_dreams += 1
        
        today = date.today()
        if self.last_dream_date:
            days_diff = (today - self.last_dream_date).days
            
            if days_diff == 0:
                # Same day, no streak change
                pass
            elif days_diff == 1:
                # Consecutive day, increment streak
                self.current_streak += 1
                if self.current_streak > self.longest_streak:
                    self.longest_streak = self.current_streak
            else:
                # Streak broken, reset to 1
                self.current_streak = 1
        else:
            # First dream
            self.current_streak = 1
            self.longest_streak = 1
        
        self.last_dream_date = today
    
    def update_favorite_symbol(self, symbol: str) -> None:
        """Update favorite symbol if it appears more frequently"""
        # This would be called from a service that counts symbol occurrences
        pass
    
    def __repr__(self) -> str:
        return f"<UserStats(user_id={self.user_id}, total_dreams={self.total_dreams}, streak={self.current_streak})>"