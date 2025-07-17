# ai_context_v3
"""
🎯 main_goal: Subscription management handlers
⚡ critical_requirements:
   - Payment processing
   - Subscription status
📥 inputs_outputs: Subscription commands -> Payment flow
🔧 functions_list:
   - show_subscription: Display plans
   - process_payment: Handle payment
🚫 forbidden_changes: None
🧪 tests: test_subscription_handler.py
"""

from aiogram import Router, types, F

subscription_router = Router(name="subscription")


@subscription_router.message(F.text == "💎 Pro подписка")
async def show_subscription(message: types.Message) -> None:
    """Show subscription plans"""
    # TODO: Implement subscription display
    await message.answer("Тарифы Pro подписки")