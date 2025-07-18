// ai_context_v3
/**
 * 🎯 main_goal: Общие TypeScript типы
 * ⚡ critical_requirements:
 *   - Переиспользуемые типы для всего приложения
 *   - Соответствие backend common схемам
 * 📥 inputs_outputs: Shared types across modules
 * 🔧 functions_list: Общие интерфейсы и типы
 * 🚫 forbidden_changes: Изменения влияют на все модули
 * 🧪 tests: Compile-time type checking
 */

// API Response wrappers
export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  code?: string;
  request_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Health check types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  version: string;
  environment: string;
  timestamp: string;
  services: Record<string, string>;
}

// Subscription types
export interface Subscription {
  id: string;
  type: 'free' | 'trial' | 'pro' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  daily_limit: number;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  daily_limit: number;
  voice_input: boolean;
  tts_output: boolean;
  deep_analysis: boolean;
  similar_dreams: boolean;
  export_data: boolean;
  priority_support: boolean;
}

// User statistics
export interface UserStats {
  user_id: string;
  total_dreams: number;
  current_streak: number;
  longest_streak: number;
  last_dream_date?: string;
  favorite_symbol?: string;
  favorite_symbol_count: number;
  updated_at: string;
}

// Common UI types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface FormError {
  field: string;
  message: string;
}

// Pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Sort options
export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  field: string;
  order: SortOrder;
}

// File upload types
export interface FileUploadResponse {
  url: string;
  size: number;
  type: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}