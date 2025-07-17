# ai_context_v3
"""
🎯 main_goal: Bot handlers package with main router
⚡ critical_requirements: Organize all handlers
📥 inputs_outputs: None
🔧 functions_list: Router aggregation
🚫 forbidden_changes: None
🧪 tests: Handler tests
"""

from aiogram import Router

from .start import start_router
from .dream import dream_router
from .profile import profile_router
from .subscription import subscription_router
from .admin import admin_router

# Main router that includes all sub-routers
router = Router(name="main")

# Include all routers
router.include_router(start_router)
router.include_router(dream_router)
router.include_router(profile_router)
router.include_router(subscription_router)
router.include_router(admin_router)