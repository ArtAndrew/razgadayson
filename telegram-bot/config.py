# ai_context_v3
"""
🎯 main_goal: Bot configuration using Pydantic settings
⚡ critical_requirements:
   - Environment-based configuration
   - Type validation
   - No hardcoded secrets
📥 inputs_outputs: ENV variables -> Settings object
🔧 functions_list:
   - Settings: Configuration class
   - get_settings: Settings singleton
🚫 forbidden_changes: Never commit real tokens
🧪 tests: test_config.py
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Bot configuration from environment variables"""
    
    # Bot
    BOT_TOKEN: str
    BOT_USERNAME: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Webhook
    USE_WEBHOOK: bool = False
    WEBHOOK_HOST: str = "0.0.0.0"
    WEBHOOK_PORT: int = 8080
    WEBHOOK_URL: str = ""
    WEBHOOK_PATH: str = "/webhook"
    WEBHOOK_SECRET: Optional[str] = None
    
    # API Backend
    API_BASE_URL: str = "http://localhost:8000"
    API_TIMEOUT: int = 30
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost/razgazdayson"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/1"
    
    # Rate limiting
    RATE_LIMIT_COMMANDS: int = 30  # per minute
    RATE_LIMIT_MESSAGES: int = 60  # per minute
    
    # Features
    FREE_DAILY_LIMIT: int = 1
    MAX_MESSAGE_LENGTH: int = 4000
    MAX_VOICE_DURATION: int = 60  # seconds
    
    # WebApp
    WEBAPP_URL: str = "https://razgazdayson.ru/app"
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    
    # Payment providers
    PAYMENT_PROVIDER_TOKEN: Optional[str] = None
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()