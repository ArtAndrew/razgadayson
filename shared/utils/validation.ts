// ai_context_v3
/**
 * 🎯 main_goal: Shared validation utilities
 * ⚡ critical_requirements: Consistent validation
 * 📥 inputs_outputs: Data -> Validation result
 * 🔧 functions_list:
 *    - validateDreamText: Validate dream input
 *    - validateEmail: Email validation
 *    - validateTelegramAuth: Telegram auth validation
 * 🚫 forbidden_changes: None
 * 🧪 tests: test_validation.ts
 */

import { LIMITS } from '../constants/limits';

export function validateDreamText(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Dream text is required' };
  }
  
  if (text.length < LIMITS.MIN_DREAM_LENGTH) {
    return { valid: false, error: `Dream must be at least ${LIMITS.MIN_DREAM_LENGTH} characters` };
  }
  
  if (text.length > LIMITS.MAX_DREAM_LENGTH) {
    return { valid: false, error: `Dream must not exceed ${LIMITS.MAX_DREAM_LENGTH} characters` };
  }
  
  return { valid: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateTelegramAuth(authData: any, botToken: string): boolean {
  // TODO: Implement Telegram auth validation
  // https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
  return true;
}