// ai_context_v3
/**
 * 🎯 main_goal: TypeScript типы для аутентификации
 * ⚡ critical_requirements:
 *   - Полное соответствие backend моделям
 *   - Типобезопасность для всех auth операций
 * 📥 inputs_outputs: Backend JSON -> TypeScript types
 * 🔧 functions_list: Только типы и интерфейсы
 * 🚫 forbidden_changes: Не изменять без синхронизации с backend
 * 🧪 tests: Проверка типов при компиляции
 */

export interface User {
  id: string;
  telegram_id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  language_code: string;
  timezone: string;
  created_at: string;
  last_active: string;
  is_active: boolean;
  subscription_type: SubscriptionType;
  daily_limit: number;
  dreams_today: number;
}

export type SubscriptionType = 'free' | 'trial' | 'pro' | 'yearly';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface EmailAuthData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  is_new_user: boolean;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse extends AuthTokens {}

// Auth error types
export interface AuthError {
  error: string;
  message: string;
  code: string;
  details?: any;
}

// Auth state for Zustand store
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}