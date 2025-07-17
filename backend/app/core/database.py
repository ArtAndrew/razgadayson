# ai_context_v3
"""
🎯 main_goal: Database connection and session management
⚡ critical_requirements:
   - Async PostgreSQL with SQLAlchemy
   - Connection pooling
   - Proper session lifecycle
   - Migrations with Alembic
📥 inputs_outputs: Database URL -> AsyncSession
🔧 functions_list:
   - init_db: Initialize database connection
   - close_db: Close database connection
   - get_db: Dependency for database session
🚫 forbidden_changes: Do not use sync database operations
🧪 tests: test_database.py with connection tests
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool
from loguru import logger

from app.core.config import settings

# Create base class for models
Base = declarative_base()

# Global engine and session factory
engine = None
async_session_factory = None


async def init_db() -> None:
    """Initialize database connection"""
    global engine, async_session_factory
    
    logger.info(f"Connecting to database: {settings.DATABASE_URL}")
    
    engine = create_async_engine(
        str(settings.DATABASE_URL),
        echo=settings.DEBUG,
        pool_size=20,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
        poolclass=NullPool if settings.ENVIRONMENT == "test" else None,
    )
    
    async_session_factory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    
    # Test connection
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database connected successfully")


async def close_db() -> None:
    """Close database connection"""
    global engine
    
    if engine:
        await engine.dispose()
        logger.info("Database connection closed")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get database session.
    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    if not async_session_factory:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()