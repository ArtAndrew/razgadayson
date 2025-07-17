# ai_context_v3
"""
🎯 main_goal: Logging middleware for all messages
⚡ critical_requirements:
   - Log all updates
   - Performance metrics
📥 inputs_outputs: Message -> Logged message
🔧 functions_list:
   - LoggingMiddleware: Logger
🚫 forbidden_changes: None
🧪 tests: test_logging.py
"""

from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware
from aiogram.types import Message
from loguru import logger
import time


class LoggingMiddleware(BaseMiddleware):
    """Logging middleware"""
    
    async def __call__(
        self,
        handler: Callable[[Message, Dict[str, Any]], Awaitable[Any]],
        event: Message,
        data: Dict[str, Any]
    ) -> Any:
        user_id = event.from_user.id
        username = event.from_user.username or "no_username"
        
        start_time = time.time()
        
        logger.info(
            f"Received message from user {user_id} (@{username}): "
            f"{event.text[:50] if event.text else 'non-text'}"
        )
        
        try:
            result = await handler(event, data)
            elapsed = time.time() - start_time
            logger.info(f"Processed in {elapsed:.2f}s for user {user_id}")
            return result
        except Exception as e:
            logger.error(f"Error processing message from {user_id}: {e}")
            raise