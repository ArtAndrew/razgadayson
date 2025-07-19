// ai_context_v3
/**
 * 🎯 main_goal: React Query хуки для работы со снами
 * ⚡ critical_requirements:
 *   - Оптимистичные обновления для UX
 *   - Инвалидация кеша при изменениях
 *   - Пагинация и поиск
 * 📥 inputs_outputs: Dream operations -> UI state
 * 🔧 functions_list:
 *   - useDreams: Список снов с пагинацией
 *   - useDream: Конкретный сон
 *   - useInterpretDream: Интерпретация сна
 *   - useDeleteDream: Удаление сна
 * 🚫 forbidden_changes: Не нарушать консистентность кеша
 * 🧪 tests: Mock dream data
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dreamService } from '@/lib/api';
import type {
  Dream,
  DreamInterpretRequest,
  DreamInterpretResponse,
  DreamListParams,
  DreamUpdateRequest
} from '@/types/dream';

// Query keys
const dreamKeys = {
  all: ['dreams'] as const,
  lists: () => [...dreamKeys.all, 'list'] as const,
  list: (params: DreamListParams) => [...dreamKeys.lists(), params] as const,
  details: () => [...dreamKeys.all, 'detail'] as const,
  detail: (id: string) => [...dreamKeys.details(), id] as const,
};

/**
 * Hook to get dreams list with pagination
 */
export function useDreams(params?: DreamListParams) {
  return useQuery({
    queryKey: dreamKeys.list(params || {}),
    queryFn: () => dreamService.getDreams(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for infinite scroll dreams
 */
export function useInfiniteDreams(params?: Omit<DreamListParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['dreams', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      dreamService.getDreams({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

/**
 * Hook to get single dream
 */
export function useDream(dreamId: string | null) {
  return useQuery({
    queryKey: dreamKeys.detail(dreamId!),
    queryFn: () => dreamService.getDream(dreamId!),
    enabled: !!dreamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to interpret dream
 */
export function useInterpretDream() {
  const queryClient = useQueryClient();
  const [lastInterpretation, setLastInterpretation] = useState<DreamInterpretResponse | null>(null);

  return useMutation({
    mutationFn: (data: DreamInterpretRequest) => dreamService.interpretDream(data),
    onSuccess: (data) => {
      // Save last interpretation
      setLastInterpretation(data);
      
      // Invalidate dreams list to show new dream
      queryClient.invalidateQueries({ queryKey: dreamKeys.lists() });
      
      // Add new dream to cache if saved
      if (data.is_saved && data.dream_id) {
        queryClient.setQueryData(
          dreamKeys.detail(data.dream_id),
          {
            id: data.dream_id,
            interpretation: data.interpretation,
            // Other fields will be fetched when needed
          }
        );
      }
    },
  });
}

/**
 * Hook to interpret dream with voice
 */
export function useInterpretDreamWithVoice() {
  const queryClient = useQueryClient();
  const [lastInterpretation, setLastInterpretation] = useState<DreamInterpretResponse | null>(null);

  return useMutation({
    mutationFn: ({
      audioFile,
      language = 'ru',
      includeSimilar = true
    }: {
      audioFile: File;
      language?: string;
      includeSimilar?: boolean;
    }) => dreamService.interpretDreamWithVoice(audioFile, language, includeSimilar),
    onSuccess: (data) => {
      // Save last interpretation
      setLastInterpretation(data);
      
      // Invalidate dreams list to show new dream
      queryClient.invalidateQueries({ queryKey: dreamKeys.lists() });
      
      // Add new dream to cache if saved
      if (data.is_saved && data.dream_id) {
        queryClient.setQueryData(
          dreamKeys.detail(data.dream_id),
          {
            id: data.dream_id,
            interpretation: data.interpretation,
            // Other fields will be fetched when needed
          }
        );
      }
    },
  });
}

/**
 * Hook to update dream
 */
export function useUpdateDream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dreamId, data }: { dreamId: string; data: DreamUpdateRequest }) =>
      dreamService.updateDream(dreamId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific dream
      queryClient.invalidateQueries({ 
        queryKey: dreamKeys.detail(variables.dreamId) 
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: dreamKeys.lists() });
    },
  });
}

/**
 * Hook to delete dream
 */
export function useDeleteDream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dreamId: string) => dreamService.deleteDream(dreamId),
    onMutate: async (dreamId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: dreamKeys.detail(dreamId) });
      await queryClient.cancelQueries({ queryKey: dreamKeys.lists() });

      // Optimistically remove from lists
      queryClient.setQueriesData(
        { queryKey: dreamKeys.lists() },
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((dream: Dream) => dream.id !== dreamId),
            total: old.total - 1,
          };
        }
      );
    },
    onSuccess: () => {
      // Invalidate to refetch correct data
      queryClient.invalidateQueries({ queryKey: dreamKeys.lists() });
    },
    onError: () => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: dreamKeys.lists() });
    },
  });
}

/**
 * Hook to generate TTS
 */
export function useGenerateTTS() {
  return useMutation({
    mutationFn: ({ dreamId, voice }: { dreamId: string; voice?: string }) =>
      dreamService.generateTTS(dreamId, voice as any),
  });
}

/**
 * Hook to search dreams
 */
export function useSearchDreams(query: string, enabled = true) {
  return useQuery({
    queryKey: ['dreams', 'search', query],
    queryFn: () => dreamService.searchDreams(query),
    enabled: enabled && query.length >= 3,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for dream catalog (mock data for now)
 */
export function useDreamCatalog(params: any) {
  // В реальном приложении это будет API запрос
  return {
    data: null,
    isLoading: false,
    error: null
  };
}

/**
 * Combined dreams hook
 */
export function useDreamOperations() {
  const interpretDream = useInterpretDream();
  const interpretWithVoice = useInterpretDreamWithVoice();
  const updateDream = useUpdateDream();
  const deleteDream = useDeleteDream();
  const generateTTS = useGenerateTTS();

  return {
    interpret: interpretDream.mutate,
    interpretWithVoice: interpretWithVoice.mutate,
    update: updateDream.mutate,
    delete: deleteDream.mutate,
    generateTTS: generateTTS.mutateAsync,
    isInterpreting: interpretDream.isPending || interpretWithVoice.isPending,
    lastInterpretation: interpretDream.data,
    error: interpretDream.error || interpretWithVoice.error,
  };
}