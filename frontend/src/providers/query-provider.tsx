// ai_context_v3
/**
 * 🎯 main_goal: React Query провайдер для приложения
 * ⚡ critical_requirements:
 *   - Настройка React Query Client
 *   - Обработка ошибок
 *   - Оптимальные настройки кеширования
 * 📥 inputs_outputs: Children -> Wrapped with providers
 * 🔧 functions_list:
 *   - QueryProvider: Основной провайдер
 *   - queryClient: Настроенный клиент
 * 🚫 forbidden_changes: Не изменять стратегию кеширования
 * 🧪 tests: Provider wrapping tests
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApiError } from '@/lib/api';

// Dynamically import devtools for development only
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(d => ({ default: d.ReactQueryDevtools })),
  { ssr: false }
);

// Query client configuration
const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time: 1 minute by default
      staleTime: 60 * 1000,
      // Cache time: 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
    mutations: {
      // Show error notifications on mutation failure
      onError: (error: any) => {
        console.error('Mutation error:', error);
        // TODO: Show toast notification
      },
    },
  },
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance for each user session
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}