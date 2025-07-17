# ai_context_v3
"""
🎯 main_goal: Main menu keyboards
⚡ critical_requirements:
   - Responsive keyboard layout
   - Clear navigation
📥 inputs_outputs: None -> Keyboard markup
🔧 functions_list:
   - get_main_keyboard: Main menu
🚫 forbidden_changes: None
🧪 tests: test_keyboards.py
"""

from aiogram.types import ReplyKeyboardMarkup, KeyboardButton


def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Get main menu keyboard"""
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="🌙 Новый сон"),
                KeyboardButton(text="📔 Дневник")
            ],
            [
                KeyboardButton(text="👤 Профиль"),
                KeyboardButton(text="💎 Pro подписка")
            ],
            [
                KeyboardButton(text="🎁 Пригласить друга"),
                KeyboardButton(text="❓ Помощь")
            ]
        ],
        resize_keyboard=True,
        input_field_placeholder="Выберите действие..."
    )
    return keyboard