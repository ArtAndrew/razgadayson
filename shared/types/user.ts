// ai_context_v3
/**
 * 🎯 main_goal: Shared user types
 * ⚡ critical_requirements: User data consistency
 * 📥 inputs_outputs: None
 * 🔧 functions_list: Type definitions
 * 🚫 forbidden_changes: Breaking changes
 * 🧪 tests: Type tests
 */

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  subscription: Subscription;
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  type: 'free' | 'pro' | 'trial';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  dailyLimit: number;
  deepAnalysis: boolean;
  voiceInterpretation: boolean;
  prioritySupport: boolean;
  customReminders: boolean;
}

export interface UserStats {
  totalDreams: number;
  currentStreak: number;
  longestStreak: number;
  favoriteSymbol?: Symbol;
  totalInterpretations: number;
  lastDreamDate?: Date;
}

export interface UserPreferences {
  language: 'ru' | 'en';
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  dailyReminder: boolean;
  reminderTime?: string; // HH:MM format
  weeklyDigest: boolean;
  promotions: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  shareDreams: boolean;
  allowAnalytics: boolean;
}