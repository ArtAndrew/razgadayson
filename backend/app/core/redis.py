# ai_context_v3
"""
🎯 main_goal: Redis connection and cache management
⚡ critical_requirements:
   - Async Redis operations
   - Connection pooling
   - TTL management
   - JSON serialization
📥 inputs_outputs: Redis URL -> Redis client
🔧 functions_list:
   - init_redis: Initialize Redis connection
   - close_redis: Close Redis connection
   - get_redis: Get Redis client
   - cache_key: Generate cache keys
🚫 forbidden_changes: Do not use sync Redis operations
🧪 tests: test_redis.py with cache operation tests
"""

import json
from typing import Optional, Any
import redis.asyncio as redis
from loguru import logger

from app.core.config import settings

# Global Redis client
redis_client: Optional[redis.Redis] = None


async def init_redis() -> None:
    """Initialize Redis connection"""
    global redis_client
    
    logger.info(f"Connecting to Redis: {settings.REDIS_HOST}:{settings.REDIS_PORT}")
    
    redis_client = redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
        max_connections=50,
    )
    
    # Test connection
    await redis_client.ping()
    logger.info("Redis connected successfully")


async def close_redis() -> None:
    """Close Redis connection"""
    global redis_client
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")


def get_redis() -> redis.Redis:
    """Get Redis client"""
    if not redis_client:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return redis_client


def cache_key(prefix: str, *args) -> str:
    """
    Generate cache key with prefix.
    Example: cache_key("dream", user_id, dream_id) -> "dream:123:456"
    """
    parts = [prefix] + [str(arg) for arg in args]
    return ":".join(parts)


class CacheManager:
    """Helper class for cache operations"""
    
    def __init__(self, default_ttl: int = 3600):
        self.default_ttl = default_ttl
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        client = get_redis()
        value = await client.get(key)
        if value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with TTL"""
        client = get_redis()
        ttl = ttl or self.default_ttl
        
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        
        await client.setex(key, ttl, value)
    
    async def delete(self, key: str) -> None:
        """Delete value from cache"""
        client = get_redis()
        await client.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        client = get_redis()
        return bool(await client.exists(key))
    
    async def increment(self, key: str, amount: int = 1) -> int:
        """Increment counter"""
        client = get_redis()
        return await client.incrby(key, amount)
    
    async def get_ttl(self, key: str) -> int:
        """Get remaining TTL for key"""
        client = get_redis()
        return await client.ttl(key)


# Default cache manager instance
cache = CacheManager()