# ai_context_v3
"""
🎯 main_goal: Common Pydantic schemas used across the application
⚡ critical_requirements: 
   - Pagination support
   - Standard response formats
   - Error handling schemas
📥 inputs_outputs: Various data -> Standard schemas
🔧 functions_list: Common utility schemas
🚫 forbidden_changes: Do not change response structure
🧪 tests: test_common_schemas.py
"""

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field


T = TypeVar('T')


class PaginationParams(BaseModel):
    """Pagination parameters schema"""
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")
    
    @property
    def offset(self) -> int:
        """Calculate offset for database query"""
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema"""
    items: List[T]
    total: int
    page: int
    limit: int
    pages: int
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        limit: int
    ) -> "PaginatedResponse[T]":
        """Create paginated response"""
        pages = (total + limit - 1) // limit
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )


class ErrorResponse(BaseModel):
    """Standard error response schema"""
    error: str
    message: str
    details: Optional[Any] = None
    code: Optional[str] = None
    request_id: Optional[str] = None


class SuccessResponse(BaseModel):
    """Standard success response schema"""
    success: bool = True
    message: str
    data: Optional[Any] = None


class HealthResponse(BaseModel):
    """Health check response schema"""
    status: str = "healthy"
    version: str
    environment: str
    timestamp: str
    services: dict = Field(default_factory=dict)


class StatsResponse(BaseModel):
    """Statistics response schema"""
    total_users: int = 0
    total_dreams: int = 0
    total_interpretations: int = 0
    active_subscriptions: dict = Field(default_factory=dict)
    popular_symbols: List[dict] = Field(default_factory=list)


class SymbolResponse(BaseModel):
    """Dream symbol response schema"""
    symbol: str
    emoji: Optional[str] = None
    count: int = 0
    description: Optional[str] = None
    related_symbols: List[str] = Field(default_factory=list)