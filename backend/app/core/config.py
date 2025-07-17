# ai_context_v3
"""
🎯 main_goal: Application configuration using Pydantic settings
⚡ critical_requirements:
   - All configs from environment variables
   - No hardcoded secrets
   - Type validation
   - Default values for development
📥 inputs_outputs: ENV variables -> Settings object
🔧 functions_list:
   - Settings: Main configuration class
   - get_settings: Settings singleton
🚫 forbidden_changes: Never commit real secrets
🧪 tests: test_config.py with env variable tests
"""

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, PostgresDsn
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # Project
    PROJECT_NAME: str = "Razgazdayson"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    ALLOWED_HOSTS: List[str] = []
    
    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "razgazdayson"
    DATABASE_URL: Optional[PostgresDsn] = None
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_MAX_TOKENS: int = 1000
    OPENAI_TEMPERATURE: float = 0.7
    
    # Rate limiting
    RATE_LIMIT_PER_USER_DAILY: int = 1000
    RATE_LIMIT_GLOBAL_HOURLY: int = 50000
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    ENABLE_METRICS: bool = True
    
    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_URL: Optional[str] = None
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Subscriptions
    FREE_DAILY_LIMIT: int = 1
    TRIAL_DAYS: int = 3
    
    # File uploads
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_AUDIO_FORMATS: List[str] = ["mp3", "wav", "ogg", "m4a"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )
    
    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: Optional[str], values) -> str:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=values.data.get("POSTGRES_USER"),
            password=values.data.get("POSTGRES_PASSWORD"),
            host=values.data.get("POSTGRES_HOST"),
            port=values.data.get("POSTGRES_PORT"),
            path=values.data.get("POSTGRES_DB"),
        ).unicode_string()
    
    @field_validator("REDIS_URL", mode="before")
    def assemble_redis_url(cls, v: Optional[str], values) -> str:
        if isinstance(v, str):
            return v
        password = values.data.get("REDIS_PASSWORD")
        if password:
            return f"redis://:{password}@{values.data.get('REDIS_HOST')}:{values.data.get('REDIS_PORT')}/{values.data.get('REDIS_DB')}"
        return f"redis://{values.data.get('REDIS_HOST')}:{values.data.get('REDIS_PORT')}/{values.data.get('REDIS_DB')}"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()