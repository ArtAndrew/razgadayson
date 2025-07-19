"use client";

/**
 * ai_context_v3
 * 
 * 🎯 main_goal: Управление темами приложения с автоматическим определением системной темы
 * 
 * ⚡ critical_requirements:
 * - Автоматическое определение системной темы пользователя
 * - Плавные переходы между светлой и темной темой
 * - Сохранение выбора пользователя в localStorage
 * - TypeScript типизация для всех состояний
 * 
 * 📥 inputs_outputs:
 * - Input: системные настройки темы, пользовательский выбор
 * - Output: активная тема, функции переключения
 * 
 * 🔧 functions_list:
 * - useTheme(): хук для использования контекста темы
 * - ThemeProvider: провайдер контекста
 * - автоматическое определение системной темы
 * - переключение между темами
 * 
 * 🚫 forbidden_changes:
 * - Нельзя блокировать рендеринг при загрузке темы
 * - Нельзя игнорировать системные настройки
 * 
 * 🧪 tests:
 * - Корректное определение системной темы
 * - Сохранение выбора в localStorage
 * - Плавные переходы между темами
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Определение системной темы
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Получение эффективной темы
  const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Применение темы к документу
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    root.setAttribute('data-theme', newTheme);
    
    // Также добавляем/убираем класс dark для совместимости
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Инициализация темы
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Загружаем сохраненную тему или используем системную
    const savedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = savedTheme || 'system';
    
    setTheme(initialTheme);
    const effective = getEffectiveTheme(initialTheme);
    setEffectiveTheme(effective);
    applyTheme(effective);
    setIsLoaded(true);
  }, []);

  // Отслеживание изменений системной темы
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newEffectiveTheme = getSystemTheme();
        setEffectiveTheme(newEffectiveTheme);
        applyTheme(newEffectiveTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Обновление темы
  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    const effective = getEffectiveTheme(newTheme);
    setEffectiveTheme(effective);
    applyTheme(effective);
    
    // Сохраняем в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  // Переключение между светлой и темной темой
  const toggleTheme = () => {
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    updateTheme(newTheme);
  };

  // Предотвращаем flash of incorrect theme
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const value: ThemeContextType = {
    theme,
    effectiveTheme,
    setTheme: updateTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Компонент для переключения темы
export function ThemeToggle() {
  const { theme, effectiveTheme, setTheme } = useTheme();

  const handleThemeChange = () => {
    // Циклическое переключение: system -> light -> dark -> system
    const themeOrder: Theme[] = ['system', 'light', 'dark'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return effectiveTheme === 'dark' ? '🌙' : '☀️';
    }
    return theme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'system':
        return `Системная (${effectiveTheme === 'dark' ? 'Темная' : 'Светлая'})`;
      case 'light':
        return 'Светлая';
      case 'dark':
        return 'Темная';
      default:
        return 'Системная';
    }
  };

  return (
    <button
      onClick={handleThemeChange}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth hover-lift focus-ring bg-glass-light border border-border-light hover:bg-glass-medium"
      title={`Текущая тема: ${getThemeLabel()}`}
    >
      <span className="text-lg">{getThemeIcon()}</span>
      <span className="hidden sm:inline text-text-secondary">
        {getThemeLabel()}
      </span>
    </button>
  );
}