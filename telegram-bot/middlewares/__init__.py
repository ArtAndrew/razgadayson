# ai_context_v3
"""
🎯 main_goal: Middlewares package with setup function
⚡ critical_requirements: Register all middlewares
📥 inputs_outputs: Dispatcher -> Configured dispatcher
🔧 functions_list:
   - setup_middlewares: Register middlewares
🚫 forbidden_changes: None
🧪 tests: test_middlewares.py
"""

from aiogram import Dispatcher

from .throttling import ThrottlingMiddleware
from .logging import LoggingMiddleware


def setup_middlewares(dp: Dispatcher) -> None:
    """Setup all middlewares"""
    # Logging middleware (outer)
    dp.message.outer_middleware(LoggingMiddleware())
    
    # Rate limiting middleware
    dp.message.middleware(ThrottlingMiddleware())