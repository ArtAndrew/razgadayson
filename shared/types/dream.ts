// ai_context_v3
/**
 * 🎯 main_goal: Shared dream types for frontend apps
 * ⚡ critical_requirements: Type consistency
 * 📥 inputs_outputs: None
 * 🔧 functions_list: Type definitions
 * 🚫 forbidden_changes: Breaking changes
 * 🧪 tests: Type tests
 */

export interface Dream {
  id: string;
  userId: string;
  text: string;
  createdAt: Date;
  interpretation?: DreamInterpretation;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
}

export interface DreamInterpretation {
  id: string;
  dreamId: string;
  mainSymbol: Symbol;
  interpretation: string;
  emotions: Emotion[];
  advice?: string;
  deepAnalysis?: DeepAnalysis;
  createdAt: Date;
}

export interface Symbol {
  name: string;
  emoji: string;
  meaning: string;
}

export interface Emotion {
  name: string;
  intensity: 'low' | 'medium' | 'high';
  color: string;
}

export interface DeepAnalysis {
  tarotCards: TarotCard[];
  psychologicalInsight: string;
  actionableAdvice: string[];
}

export interface TarotCard {
  name: string;
  position: 'past' | 'present' | 'future';
  meaning: string;
  imageUrl?: string;
}