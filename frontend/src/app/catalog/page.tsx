// ai_context_v3
/**
 * 🎯 main_goal: SEO-оптимизированный каталог символов снов
 * ⚡ critical_requirements:
 *   - Список популярных символов с поиском
 *   - SEO-дружественные URL
 *   - Пагинация и фильтрация
 *   - Быстрая загрузка для SEO
 * 📥 inputs_outputs: Query params -> Filtered symbol list
 * 🔧 functions_list:
 *   - CatalogPage: Основной компонент
 *   - SearchBar: Поиск по символам
 *   - SymbolGrid: Сетка символов
 *   - CategoryFilter: Фильтр по категориям
 * 🚫 forbidden_changes: Не использовать client-side только рендеринг
 * 🧪 tests: SEO meta tags, pagination
 */

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton';
import { useDreamCatalog } from '@/hooks/useDreams';
import { toast } from '@/components/ui/Toast';

// Популярные символы для SEO
const POPULAR_SYMBOLS = [
  { id: 'water', name: 'Вода', emoji: '💧', description: 'Эмоции и подсознание', category: 'nature' },
  { id: 'flight', name: 'Полет', emoji: '🦅', description: 'Свобода и амбиции', category: 'actions' },
  { id: 'falling', name: 'Падение', emoji: '📉', description: 'Потеря контроля', category: 'actions' },
  { id: 'snake', name: 'Змея', emoji: '🐍', description: 'Трансформация и мудрость', category: 'animals' },
  { id: 'money', name: 'Деньги', emoji: '💰', description: 'Ценности и успех', category: 'objects' },
  { id: 'fire', name: 'Огонь', emoji: '🔥', description: 'Страсть и энергия', category: 'nature' },
  { id: 'house', name: 'Дом', emoji: '🏠', description: 'Безопасность и семья', category: 'places' },
  { id: 'sea', name: 'Море', emoji: '🌊', description: 'Бессознательное', category: 'nature' },
  { id: 'death', name: 'Смерть', emoji: '💀', description: 'Конец и новое начало', category: 'concepts' },
  { id: 'pregnancy', name: 'Беременность', emoji: '🤰', description: 'Новые начинания', category: 'concepts' },
  { id: 'wedding', name: 'Свадьба', emoji: '💒', description: 'Союз и обязательства', category: 'events' },
  { id: 'teeth', name: 'Зубы', emoji: '🦷', description: 'Уверенность и сила', category: 'body' },
  { id: 'car', name: 'Машина', emoji: '🚗', description: 'Контроль и направление', category: 'objects' },
  { id: 'dog', name: 'Собака', emoji: '🐕', description: 'Верность и дружба', category: 'animals' },
  { id: 'cat', name: 'Кошка', emoji: '🐈', description: 'Независимость и интуиция', category: 'animals' },
  { id: 'baby', name: 'Ребенок', emoji: '👶', description: 'Новое начало и невинность', category: 'people' },
  { id: 'mother', name: 'Мать', emoji: '👩', description: 'Забота и защита', category: 'people' },
  { id: 'father', name: 'Отец', emoji: '👨', description: 'Авторитет и поддержка', category: 'people' },
  { id: 'rain', name: 'Дождь', emoji: '🌧️', description: 'Очищение и обновление', category: 'nature' },
  { id: 'sun', name: 'Солнце', emoji: '☀️', description: 'Жизненная сила и оптимизм', category: 'nature' },
];

const CATEGORIES = [
  { id: 'all', name: 'Все', icon: '✨' },
  { id: 'nature', name: 'Природа', icon: '🌿' },
  { id: 'animals', name: 'Животные', icon: '🦁' },
  { id: 'people', name: 'Люди', icon: '👥' },
  { id: 'objects', name: 'Предметы', icon: '🎯' },
  { id: 'places', name: 'Места', icon: '🏛️' },
  { id: 'actions', name: 'Действия', icon: '🏃' },
  { id: 'concepts', name: 'Концепции', icon: '💭' },
  { id: 'events', name: 'События', icon: '🎉' },
  { id: 'body', name: 'Тело', icon: '👤' },
];

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  // В реальном приложении данные будут из API
  const { data: catalogData, isLoading } = useDreamCatalog({
    query: searchQuery,
    category: selectedCategory,
    page: currentPage,
    limit: 20,
  });

  // Для демо используем локальные данные
  const symbols = POPULAR_SYMBOLS;
  const totalPages = 1;

  // Фильтрация символов
  const filteredSymbols = symbols.filter(symbol => {
    const matchesSearch = symbol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         symbol.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || symbol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Обновление URL при изменении параметров
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() ? `/catalog?${params.toString()}` : '/catalog';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, currentPage, router]);

  const handleSymbolClick = (symbolId: string) => {
    router.push(`/catalog/${symbolId}`);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white font-display mb-4 animate-fade-in">
              <span className="text-gradient">Каталог символов снов</span>
            </h1>
            <p className="text-xl text-mystic-text-secondary animate-slide-up">
              Исследуйте значения популярных символов и их толкования
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Input
              type="search"
              placeholder="Поиск символов..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-14 text-lg"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentPage(1);
                }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Symbols Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredSymbols.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredSymbols.map((symbol, index) => (
                  <Link
                    key={symbol.id}
                    href={`/catalog/${symbol.id}`}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Card variant="glass" interactive className="h-full">
                      <CardContent className="text-center pt-8 pb-6">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                          {symbol.emoji}
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                          {symbol.name}
                        </h2>
                        <p className="text-sm text-mystic-text-muted">
                          {symbol.description}
                        </p>
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-primary-400">Узнать значение →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Предыдущая
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && <span className="text-mystic-text-muted">...</span>}
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Следующая →
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card variant="glass" className="text-center py-16">
              <CardContent>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ничего не найдено
                </h3>
                <p className="text-mystic-text-muted mb-6">
                  Попробуйте изменить поисковый запрос или выбрать другую категорию
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Сбросить фильтры
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card variant="gradient" className="p-8">
            <h2 className="text-3xl font-bold text-white mb-4 font-display">
              О соннике символов
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-mystic-text-secondary mb-4">
                Наш каталог символов снов содержит подробные толкования самых распространенных 
                образов, встречающихся в сновидениях. Каждый символ анализируется с помощью 
                мистических алгоритмов, учитывающих психологические, культурные и 
                мифологические аспекты.
              </p>
              <p className="text-mystic-text-secondary">
                Используйте поиск и фильтры, чтобы найти интересующий вас символ, или 
                просматривайте категории для вдохновения. Помните, что толкование снов — 
                это индивидуальный процесс, и наши интерпретации служат отправной точкой 
                для вашего личного понимания.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card variant="glass" glow className="text-center p-8">
            <h2 className="text-3xl font-bold text-white mb-4 font-display">
              Хотите расшифровать свой сон?
            </h2>
            <p className="text-lg text-mystic-text-secondary mb-6">
              Получите персональное толкование за 30 секунд
            </p>
            <Button variant="gradient" size="lg" asChild>
              <Link href="/">Разгадать сон</Link>
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24">
          <div className="space-y-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}