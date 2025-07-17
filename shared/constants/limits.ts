// ai_context_v3
/**
 * 🎯 main_goal: Shared constants for limits
 * ⚡ critical_requirements: Consistent limits
 * 📥 inputs_outputs: None
 * 🔧 functions_list: Constants
 * 🚫 forbidden_changes: None
 * 🧪 tests: None
 */

export const LIMITS = {
  FREE_DAILY_DREAMS: 1,
  PRO_DAILY_DREAMS: Infinity,
  MIN_DREAM_LENGTH: 20,
  MAX_DREAM_LENGTH: 4000,
  MAX_VOICE_DURATION: 60, // seconds
  MAX_TAGS_PER_DREAM: 10,
  TRIAL_DAYS: 3,
} as const;

export const SUBSCRIPTION_PRICES = {
  MONTHLY: 349, // RUB
  YEARLY: 2990, // RUB
  DEEP_DIVE: 59, // RUB per analysis
} as const;

export const RATE_LIMITS = {
  COMMANDS_PER_MINUTE: 30,
  MESSAGES_PER_MINUTE: 60,
  API_REQUESTS_PER_HOUR: 1000,
} as const;