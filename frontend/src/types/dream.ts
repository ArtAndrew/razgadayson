// ai_context_v3
/**
 * 🎯 main_goal: TypeScript типы для работы со снами
 * ⚡ critical_requirements:
 *   - Соответствие Pydantic моделям backend
 *   - Поддержка всех полей API
 * 📥 inputs_outputs: API responses -> TypeScript types
 * 🔧 functions_list: Типы и интерфейсы для снов
 * 🚫 forbidden_changes: Синхронизация с backend обязательна
 * 🧪 tests: Type checking at compile time
 */

export interface Dream {
  id: string;
  text: string;
  voice_url?: string;
  language: string;
  created_at: string;
  interpretation?: DreamInterpretation;
  tags: string[];
  similar_dreams_count: number;
}

export interface DreamInterpretation {
  id: string;
  dream_id: string;
  main_symbol: string;
  main_symbol_emoji: string;
  interpretation: string;
  emotions: Emotion[];
  advice: string;
  ai_model: string;
  prompt_version: string;
  created_at: string;
  processing_time_ms: number;
}

export interface Emotion {
  name: string;
  intensity: 'низкая' | 'средняя' | 'высокая';
  meaning: string;
}

export interface SimilarDream {
  id: string;
  text: string;
  main_symbol?: string;
  similarity: number;
  created_at: string;
}

// Request types
export interface DreamInterpretRequest {
  text: string;
  voice_data?: string; // Base64 encoded audio
  language?: string;
  include_similar?: boolean;
}

export interface DreamUpdateRequest {
  text?: string;
  is_deleted?: boolean;
}

// Response types
export interface DreamInterpretResponse {
  dream_id: string;
  interpretation: DreamInterpretation;
  similar_dreams: SimilarDream[];
  daily_limit_remaining: number;
  is_saved: boolean;
}

export interface DreamListResponse {
  items: Dream[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// TTS types
export interface TTSRequest {
  voice?: 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
}

export interface TTSResponse {
  audio: string; // Base64 encoded audio
  format: string;
  voice: string;
}

// Query parameters
export interface DreamListParams {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}

// Dream state for UI
export interface DreamFormData {
  text: string;
  voice_data?: File;
  language: string;
}

export interface DreamState {
  dreams: Dream[];
  currentDream: Dream | null;
  interpretation: DreamInterpretation | null;
  isLoading: boolean;
  error: string | null;
  dailyLimitRemaining: number;
}