# ai_context_v3
"""
🎯 main_goal: Health check endpoints for monitoring
⚡ critical_requirements:
   - Liveness check
   - Readiness check with dependencies
   - No authentication required
   - Fast response times
📥 inputs_outputs: GET requests -> Health status JSON
🔧 functions_list:
   - health_live: Basic liveness check
   - health_ready: Readiness with dependencies
🚫 forbidden_changes: Do not add heavy operations
🧪 tests: test_health.py with all checks
"""

from fastapi import APIRouter, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import time

from app.core.database import get_db
from app.core.redis import get_redis
from app.core.config import settings

router = APIRouter()


@router.get("/health/live", response_model=Dict[str, Any])
async def health_live():
    """
    Liveness probe - checks if the application is running.
    Returns 200 if the app is alive.
    """
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": int(time.time())
    }


@router.get("/health/ready", response_model=Dict[str, Any])
async def health_ready():
    """
    Readiness probe - checks if the application is ready to serve requests.
    Verifies database and Redis connections.
    """
    checks = {
        "database": False,
        "redis": False
    }
    details = {}
    
    # Check database
    try:
        async with get_db() as db:
            result = await db.execute(text("SELECT 1"))
            checks["database"] = result.scalar() == 1
            details["database"] = "connected"
    except Exception as e:
        details["database"] = f"error: {str(e)}"
    
    # Check Redis
    try:
        redis_client = get_redis()
        await redis_client.ping()
        checks["redis"] = True
        details["redis"] = "connected"
    except Exception as e:
        details["redis"] = f"error: {str(e)}"
    
    # Overall status
    all_healthy = all(checks.values())
    
    response = {
        "status": "ok" if all_healthy else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "checks": checks,
        "details": details,
        "timestamp": int(time.time())
    }
    
    return response if all_healthy else (response, status.HTTP_503_SERVICE_UNAVAILABLE)