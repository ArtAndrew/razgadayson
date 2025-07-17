# ai_context_v3
"""
🎯 main_goal: Telegram bot entry point with aiogram 3.x
⚡ critical_requirements:
   - Webhook support for production
   - Polling for development
   - Proper error handling
   - Graceful shutdown
📥 inputs_outputs: Telegram updates -> Bot responses
🔧 functions_list:
   - main: Bot startup
   - on_startup: Initialization
   - on_shutdown: Cleanup
🚫 forbidden_changes: Do not hardcode bot token
🧪 tests: test_bot.py with mocked updates
"""

import asyncio
import logging
import sys
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application
from aiohttp import web
import sentry_sdk
from sentry_sdk.integrations.aiohttp import AioHttpIntegration
from loguru import logger

from config import settings
from handlers import router
from middlewares import setup_middlewares
from services.database import init_db, close_db
from services.redis import init_redis, close_redis


# Configure logging
logging.basicConfig(level=logging.INFO)


async def on_startup(bot: Bot) -> None:
    """Initialize bot and services on startup"""
    logger.info("Starting Razgazdayson Telegram Bot...")
    
    # Initialize database
    await init_db()
    
    # Initialize Redis
    await init_redis()
    
    # Set webhook if in production
    if settings.USE_WEBHOOK:
        await bot.set_webhook(
            url=f"{settings.WEBHOOK_URL}{settings.WEBHOOK_PATH}",
            drop_pending_updates=True,
            secret_token=settings.WEBHOOK_SECRET
        )
        logger.info(f"Webhook set to {settings.WEBHOOK_URL}")
    else:
        # Delete webhook for polling mode
        await bot.delete_webhook(drop_pending_updates=True)
        logger.info("Using polling mode")
    
    # Initialize Sentry if configured
    if settings.SENTRY_DSN:
        sentry_sdk.init(
            dsn=settings.SENTRY_DSN,
            integrations=[AioHttpIntegration()],
            traces_sample_rate=0.1,
            environment=settings.ENVIRONMENT
        )
    
    logger.info("Bot started successfully")


async def on_shutdown(bot: Bot) -> None:
    """Cleanup on shutdown"""
    logger.info("Shutting down bot...")
    
    # Close database
    await close_db()
    
    # Close Redis
    await close_redis()
    
    # Delete webhook
    if settings.USE_WEBHOOK:
        await bot.delete_webhook()
    
    logger.info("Bot shutdown complete")


def create_app() -> web.Application:
    """Create aiohttp application for webhook mode"""
    bot = Bot(token=settings.BOT_TOKEN, parse_mode=ParseMode.HTML)
    dp = Dispatcher()
    
    # Setup middlewares
    setup_middlewares(dp)
    
    # Include routers
    dp.include_router(router)
    
    # Register startup/shutdown handlers
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    
    # Create aiohttp app
    app = web.Application()
    
    # Setup webhook handler
    webhook_handler = SimpleRequestHandler(
        dispatcher=dp,
        bot=bot,
        secret_token=settings.WEBHOOK_SECRET
    )
    webhook_handler.register(app, path=settings.WEBHOOK_PATH)
    
    return app


async def main() -> None:
    """Main function for polling mode"""
    bot = Bot(token=settings.BOT_TOKEN, parse_mode=ParseMode.HTML)
    dp = Dispatcher()
    
    # Setup middlewares
    setup_middlewares(dp)
    
    # Include routers
    dp.include_router(router)
    
    # Register startup/shutdown handlers
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    
    # Start polling
    await dp.start_polling(bot)


if __name__ == "__main__":
    if settings.USE_WEBHOOK:
        # Run webhook server
        web.run_app(
            create_app(),
            host=settings.WEBHOOK_HOST,
            port=settings.WEBHOOK_PORT
        )
    else:
        # Run polling
        asyncio.run(main())