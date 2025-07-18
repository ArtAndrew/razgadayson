# ai_context_v3
"""
🎯 main_goal: Export all Pydantic schemas for easy imports
⚡ critical_requirements: Maintain consistent naming and exports
📥 inputs_outputs: None -> Exported schemas
🔧 functions_list: Module exports only
🚫 forbidden_changes: Do not modify export structure without updating imports
🧪 tests: Import tests in test_schemas.py
"""

from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserInDB,
    UserResponse,
    UserStats
)

from .dream import (
    DreamBase,
    DreamCreate,
    DreamUpdate,
    DreamInDB,
    DreamResponse,
    DreamInterpretation,
    DreamTag
)

from .subscription import (
    SubscriptionBase,
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionInDB,
    SubscriptionResponse,
    SubscriptionType,
    SubscriptionStatus
)

from .auth import (
    Token,
    TokenPayload,
    TelegramAuthData,
    LoginResponse
)

from .common import (
    PaginationParams,
    PaginatedResponse,
    ErrorResponse,
    SuccessResponse
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate", 
    "UserInDB",
    "UserResponse",
    "UserStats",
    
    # Dream schemas
    "DreamBase",
    "DreamCreate",
    "DreamUpdate",
    "DreamInDB",
    "DreamResponse",
    "DreamInterpretation",
    "DreamTag",
    
    # Subscription schemas
    "SubscriptionBase",
    "SubscriptionCreate",
    "SubscriptionUpdate",
    "SubscriptionInDB",
    "SubscriptionResponse",
    "SubscriptionType",
    "SubscriptionStatus",
    
    # Auth schemas
    "Token",
    "TokenPayload",
    "TelegramAuthData",
    "LoginResponse",
    
    # Common schemas
    "PaginationParams",
    "PaginatedResponse",
    "ErrorResponse",
    "SuccessResponse"
]