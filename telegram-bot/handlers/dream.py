# ai_context_v3
"""
🎯 main_goal: Dream interpretation handlers
⚡ critical_requirements:
   - Text and voice input
   - Rate limiting
   - API integration
📥 inputs_outputs: Dream text/voice -> Interpretation
🔧 functions_list:
   - new_dream: Start new dream
   - process_text_dream: Handle text
   - process_voice_dream: Handle voice
🚫 forbidden_changes: None
🧪 tests: test_dream_handler.py
"""

from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

dream_router = Router(name="dream")


class DreamStates(StatesGroup):
    waiting_for_dream = State()


@dream_router.message(F.text == "🌙 Новый сон")
async def new_dream(message: types.Message, state: FSMContext) -> None:
    """Start new dream interpretation"""
    await state.set_state(DreamStates.waiting_for_dream)
    
    await message.answer(
        "Опишите свой сон подробно (минимум 20 символов).\n\n"
        "Вы можете отправить текст или голосовое сообщение 🎤",
        reply_markup=types.ReplyKeyboardRemove()
    )


@dream_router.message(DreamStates.waiting_for_dream, F.text)
async def process_text_dream(message: types.Message, state: FSMContext) -> None:
    """Process text dream"""
    # TODO: Implement dream processing
    await message.answer("Обрабатываю ваш сон...")
    await state.clear()


@dream_router.message(DreamStates.waiting_for_dream, F.voice)
async def process_voice_dream(message: types.Message, state: FSMContext) -> None:
    """Process voice dream"""
    # TODO: Implement voice processing
    await message.answer("Обрабатываю голосовое сообщение...")
    await state.clear()