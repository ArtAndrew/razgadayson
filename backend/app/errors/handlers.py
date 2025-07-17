# ai_context_v3
"""
🎯 main_goal: Global exception handlers for FastAPI
⚡ critical_requirements:
   - Consistent error responses
   - Proper logging
   - Security (no sensitive data in errors)
   - User-friendly messages
📥 inputs_outputs: Exceptions -> JSON error responses
🔧 functions_list:
   - validation_exception_handler: Pydantic validation errors
   - http_exception_handler: HTTP exceptions
   - generic_exception_handler: Unhandled exceptions
   - setup_exception_handlers: Register all handlers
🚫 forbidden_changes: Do not expose internal errors in production
🧪 tests: test_error_handlers.py
"""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from loguru import logger
import traceback

from app.core.config import settings


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(x) for x in error["loc"])
        errors.append({
            "field": field,
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "Invalid input data",
            "details": errors
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail or "HTTP Error",
            "message": exc.detail or f"HTTP {exc.status_code} error",
            "status_code": exc.status_code
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle unhandled exceptions"""
    # Log the full exception
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    
    # Return generic error in production
    if settings.ENVIRONMENT == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred"
            }
        )
    
    # Return detailed error in development
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "type": exc.__class__.__name__,
            "traceback": traceback.format_exc().split("\n") if settings.DEBUG else None
        }
    )


def setup_exception_handlers(app: FastAPI) -> None:
    """Register all exception handlers"""
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)