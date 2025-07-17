# ai_context_v3
"""
🎯 main_goal: Start command and onboarding handlers
⚡ critical_requirements:
   - Welcome message
   - Main menu keyboard
   - User registration
📥 inputs_outputs: /start command -> Welcome message
🔧 functions_list:
   - start_command: Handle /start
   - help_command: Handle /help
🚫 forbidden_changes: None
🧪 tests: test_start_handler.py
"""

from aiogram import Router, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from loguru import logger

from config import settings
from services.database import get_or_create_user
from keyboards.main import get_main_keyboard

start_router = Router(name="start")


@start_router.message(Command("start"))
async def start_command(message: types.Message) -> None:
    """Handle /start command"""
    user_id = message.from_user.id
    
    # Register or update user in database
    await get_or_create_user(
        telegram_id=user_id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
        last_name=message.from_user.last_name
    )
    
    # Welcome message
    welcome_text = (
        f"👋 Привет, {message.from_user.first_name}!\n\n"
        "🌙 Я помогу разгадать ваши сны с помощью AI.\n\n"
        "Просто опишите свой сон текстом или голосовым сообщением, "
        "и через 30 секунд получите подробное толкование!\n\n"
        "Что вы хотите сделать?"
    )
    
    # Main menu keyboard
    keyboard = get_main_keyboard()
    
    await message.answer(
        text=welcome_text,
        reply_markup=keyboard
    )
    
    logger.info(f"User {user_id} started the bot")


@start_router.message(Command("help"))
async def help_command(message: types.Message) -> None:
    """Handle /help command"""
    help_text = (
        "🤖 *Как пользоваться ботом:*\n\n"
        "1️⃣ Нажмите «Новый сон» или отправьте описание сна\n"
        "2️⃣ Опишите сон подробно (минимум 20 символов)\n"
        "3️⃣ Получите AI-толкование за 30 секунд\n\n"
        "💎 *Pro подписка дает:*\n"
        "• Безлимитные толкования\n"
        "• Глубокий анализ с советами\n"
        "• Голосовые толкования\n"
        "• Приоритетная поддержка\n\n"
        "📱 Используйте кнопки меню для навигации"
    )
    
    await message.answer(
        text=help_text,
        parse_mode="Markdown"
    )


@start_router.message(Command("webapp"))
async def webapp_command(message: types.Message) -> None:
    """Open WebApp"""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[[
            InlineKeyboardButton(
                text="🌐 Открыть WebApp",
                web_app=WebAppInfo(url=settings.WEBAPP_URL)
            )
        ]]
    )
    
    await message.answer(
        text="Нажмите кнопку ниже, чтобы открыть полную версию:",
        reply_markup=keyboard
    )