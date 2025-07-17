# ai_context_v3
"""
🎯 main_goal: User profile handlers
⚡ critical_requirements:
   - Show user stats
   - Manage settings
📥 inputs_outputs: Profile commands -> User info
🔧 functions_list:
   - show_profile: Display profile
   - show_journal: Display journal
🚫 forbidden_changes: None
🧪 tests: test_profile_handler.py
"""

from aiogram import Router, types, F

profile_router = Router(name="profile")


@profile_router.message(F.text == "👤 Профиль")
async def show_profile(message: types.Message) -> None:
    """Show user profile"""
    # TODO: Implement profile display
    await message.answer("Ваш профиль")


@profile_router.message(F.text == "📔 Дневник")
async def show_journal(message: types.Message) -> None:
    """Show dream journal"""
    # TODO: Implement journal display
    await message.answer("Ваш дневник снов")