// ai_context_v3
/**
 * 🎯 main_goal: Персональный журнал снов пользователя
 * ⚡ critical_requirements:
 *   - Отображение истории сохраненных снов
 *   - Поиск и фильтрация по дате/тегам
 *   - Бесконечная прокрутка
 *   - Редактирование и удаление снов
 *   - Экспорт данных (Pro)
 * 📥 inputs_outputs: User dreams -> Dream journal UI
 * 🔧 functions_list:
 *   - JournalPage: Основной компонент
 *   - DreamCard: Карточка сна
 *   - SearchFilters: Поиск и фильтры
 *   - DreamStats: Статистика снов
 * 🚫 forbidden_changes: Не удалять сны без подтверждения
 * 🧪 tests: Check auth, pagination, filters
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteDreams, useDeleteDream, useUpdateDream } from '@/hooks/useDreams';
import type { Dream } from '@/types/dream';

export default function JournalPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; dreamId?: string }>({ isOpen: false });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; dream?: Dream }>({ isOpen: false });
  const [editText, setEditText] = useState('');
  
  // Infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // Hooks
  const deleteDream = useDeleteDream();
  const updateDream = useUpdateDream();
  
  // Infinite dreams query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteDreams({
    search: searchQuery,
    tag: selectedTag || undefined,
    limit: 10
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?reason=journal');
    }
  }, [user, router]);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Get all dreams from pages
  const allDreams = data?.pages.flatMap(page => page.items) || [];
  
  // Get unique tags
  const allTags = Array.from(
    new Set(allDreams.flatMap(dream => dream.tags || []))
  );

  // Calculate stats
  const totalDreams = data?.pages[0]?.total || 0;
  const uniqueSymbols = new Set(allDreams.map(d => d.interpretation?.main_symbol)).size;
  const averageLength = allDreams.length > 0
    ? Math.round(allDreams.reduce((acc, d) => acc + d.text.length, 0) / allDreams.length)
    : 0;

  const handleDelete = async (dreamId: string) => {
    try {
      await deleteDream.mutateAsync(dreamId);
      toast.success('Сон удален');
      setDeleteModal({ isOpen: false });
    } catch (error: any) {
      toast.error(error.message || 'Ошибка удаления');
    }
  };

  const handleEdit = async () => {
    if (!editModal.dream) return;
    
    try {
      await updateDream.mutateAsync({
        dreamId: editModal.dream.id,
        data: { text: editText }
      });
      toast.success('Сон обновлен');
      setEditModal({ isOpen: false });
    } catch (error: any) {
      toast.error(error.message || 'Ошибка обновления');
    }
  };

  const handleExport = async () => {
    if (!user || user.subscription_type === 'free') {
      toast.warning('Экспорт доступен только для Pro пользователей');
      router.push('/subscribe');
      return;
    }

    // Create JSON export
    const exportData = {
      user: user.email,
      exportDate: new Date().toISOString(),
      dreams: allDreams.map(dream => ({
        date: dream.created_at,
        text: dream.text,
        interpretation: dream.interpretation,
        tags: dream.tags,
        emotions: dream.interpretation?.emotions
      }))
    };

    // Download as JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dream-journal-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Журнал экспортирован');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4 animate-fade-in">
              Мой журнал снов
            </h1>
            <p className="text-xl text-mystic-text-secondary animate-slide-up">
              Все ваши сны и их толкования в одном месте
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto mb-8">
            <Card variant="glass" className="text-center animate-scale-in">
              <CardContent className="py-6">
                <div className="text-3xl font-bold text-white mb-1">{totalDreams}</div>
                <p className="text-sm text-mystic-text-muted">Всего снов</p>
              </CardContent>
            </Card>
            <Card variant="glass" className="text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="py-6">
                <div className="text-3xl font-bold text-white mb-1">{uniqueSymbols}</div>
                <p className="text-sm text-mystic-text-muted">Уникальных символов</p>
              </CardContent>
            </Card>
            <Card variant="glass" className="text-center animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="py-6">
                <div className="text-3xl font-bold text-white mb-1">{averageLength}</div>
                <p className="text-sm text-mystic-text-muted">Средняя длина сна</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card variant="glass" className="max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Input */}
                <Input
                  type="search"
                  placeholder="Поиск по снам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />

                {/* Tag Filters */}
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedTag === null ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedTag(null)}
                    >
                      Все теги
                    </Button>
                    {allTags.map(tag => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedTag(tag)}
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExport}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    }
                  >
                    Экспортировать
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dreams List */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ошибка загрузки
                </h3>
                <p className="text-mystic-text-muted">
                  Не удалось загрузить ваши сны
                </p>
              </CardContent>
            </Card>
          ) : allDreams.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Журнал пуст
                </h3>
                <p className="text-mystic-text-muted mb-6">
                  Начните записывать свои сны прямо сейчас
                </p>
                <Button variant="primary" asChild>
                  <Link href="/">Записать первый сон</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {allDreams.map((dream, index) => (
                <Card 
                  key={dream.id} 
                  variant="glass" 
                  hover
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{dream.interpretation?.main_symbol_emoji || '💭'}</span>
                          <div>
                            <h3 className="font-semibold text-white">
                              {dream.interpretation?.main_symbol || 'Сон без интерпретации'}
                            </h3>
                            <p className="text-sm text-mystic-text-muted">
                              {format(new Date(dream.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dream/${dream.id}`)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditText(dream.text);
                            setEditModal({ isOpen: true, dream });
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal({ isOpen: true, dreamId: dream.id })}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-mystic-text-secondary mb-4 line-clamp-3">
                      {dream.text}
                    </p>
                    {dream.tags && dream.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {dream.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-primary-800/30 text-primary-300 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="h-20 flex items-center justify-center">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-mystic-text-muted">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    <span>Загрузка...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title="Удалить сон?"
      >
        <p className="text-mystic-text-secondary mb-6">
          Это действие нельзя отменить. Сон и его толкование будут удалены навсегда.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false })}
          >
            Отмена
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteModal.dreamId && handleDelete(deleteModal.dreamId)}
            isLoading={deleteDream.isPending}
          >
            Удалить
          </Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false })}
        title="Редактировать сон"
        size="lg"
      >
        <div className="space-y-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full min-h-[200px] px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-mystic-text-muted focus:outline-none focus:border-primary-500 transition-colors resize-none"
            placeholder="Опишите ваш сон..."
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setEditModal({ isOpen: false })}
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleEdit}
              isLoading={updateDream.isPending}
            >
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}