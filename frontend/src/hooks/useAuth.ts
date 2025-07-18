// ai_context_v3
/**
 * 🎯 main_goal: React Query хуки для аутентификации
 * ⚡ critical_requirements:
 *   - Кеширование данных пользователя
 *   - Автоматическое обновление состояния
 *   - Оптимистичные обновления
 * 📥 inputs_outputs: Auth actions -> User state
 * 🔧 functions_list:
 *   - useAuth: Текущее состояние авторизации
 *   - useLogin: Мутация для входа
 *   - useLogout: Мутация для выхода
 *   - useUser: Данные текущего пользователя
 * 🚫 forbidden_changes: Не нарушать кеш стратегию
 * 🧪 tests: Mock auth states
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import type { User, TelegramAuthData, EmailAuthData, AuthResponse } from '@/types/auth';

// Query keys
const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Hook to get current user
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authService.getCurrentUser(),
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Hook for Telegram login
 */
export function useTelegramLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (authData: TelegramAuthData) => authService.telegramAuth(authData),
    onSuccess: (data: AuthResponse) => {
      // Update user in cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      // Redirect based on new user status
      if (data.is_new_user) {
        router.push('/onboarding');
      } else {
        router.push('/profile');
      }
    },
    onError: (error) => {
      console.error('Telegram login error:', error);
    }
  });
}

/**
 * Hook for email login
 */
export function useEmailLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (authData: EmailAuthData) => authService.emailAuth(authData),
    onSuccess: (data: AuthResponse) => {
      // Update user in cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      // Redirect to profile
      router.push('/profile');
    },
    onError: (error) => {
      console.error('Email login error:', error);
    }
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all auth queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      
      // Clear all cached data
      queryClient.clear();
      
      // Redirect to home
      router.push('/');
    }
  });
}

/**
 * Hook for profile update
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update user in cache
      queryClient.setQueryData(authKeys.user(), updatedUser);
    }
  });
}

/**
 * Combined auth hook
 */
export function useAuth() {
  const { data: user, isLoading, error } = useUser();
  const telegramLogin = useTelegramLogin();
  const emailLogin = useEmailLogin();
  const logout = useLogout();
  const updateProfile = useUpdateProfile();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    telegramLogin: telegramLogin.mutate,
    emailLogin: emailLogin.mutate,
    logout: logout.mutate,
    updateProfile: updateProfile.mutate,
    isLoggingIn: telegramLogin.isPending || emailLogin.isPending,
    isLoggingOut: logout.isPending,
  };
}