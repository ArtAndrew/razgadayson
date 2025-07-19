"use client";

/**
 * ai_context_v3
 * 
 * 🎯 main_goal: Революционная главная страница с трендами 2025 года - Bento UI, Glassmorphism, крупная типографика
 * 
 * ⚡ critical_requirements:
 * - Обязательная авторизация перед анализом снов
 * - Bento UI модульная компоновка
 * - Огромная типографика в стиле Apple
 * - Glassmorphism эффекты
 * - Адаптивность mobile-first
 * - Микроинтеракции и плавные анимации
 * - Поддержка светлой/темной темы
 * 
 * 📥 inputs_outputs:
 * - Input: текст сна, голосовой ввод, пользовательские настройки
 * - Output: перенаправление на авторизацию или результат анализа
 * 
 * 🔧 functions_list:
 * - Hero секция с огромной типографикой
 * - Bento Grid со статистикой и функциями
 * - Форма ввода сна с валидацией
 * - Проверка авторизации
 * - Адаптивные компоненты
 * 
 * 🚫 forbidden_changes:
 * - Нельзя позволять анализ без авторизации
 * - Нельзя нарушать адаптивность
 * - Нельзя убирать анимации (кроме prefers-reduced-motion)
 * 
 * 🧪 tests:
 * - Корректная работа на всех размерах экрана
 * - Плавные анимации и переходы
 * - Правильная валидация форм
 * - Перенаправление на авторизацию
 */

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useInterpretDream } from "@/hooks/useDreams";
import { dreamService } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { BentoCard, GlassCard, StatCard } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";

export default function Home() {
  const [dreamText, setDreamText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const router = useRouter();
  
  const interpretDream = useInterpretDream();

  // Параллакс и анимации
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) - 0.5, 
        y: (e.clientY / window.innerHeight) - 0.5 
      });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleLoad = () => {
      setIsLoaded(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('load', handleLoad);
    setIsLoaded(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Сразу проверяем авторизацию - главное изменение!
    // TODO: Заменить на реальную проверку авторизации
    const isAuthenticated = false; // localStorage.getItem('auth_token');
    
    if (!isAuthenticated) {
      // Сохраняем сон и перенаправляем на авторизацию
      if (dreamText.length >= 20) {
        sessionStorage.setItem('pendingDream', dreamText);
      }
      toast.info('Войдите в аккаунт, чтобы разгадать ваш сон');
      router.push('/login?reason=dream_analysis&redirect=' + encodeURIComponent('/'));
      return;
    }
    
    // Валидация текста сна
    const validation = dreamService.validateDreamText(dreamText);
    if (!validation.valid) {
      toast.error(validation.error || 'Текст сна не соответствует требованиям');
      return;
    }

    try {
      // Анализ сна
      const result = await interpretDream.mutateAsync({
        text: dreamText,
        language: "ru",
        include_similar: true
      });

      // Сохраняем результат
      sessionStorage.setItem('lastInterpretation', JSON.stringify(result));
      
      // Переходим к результату
      router.push(`/dream/${result.dream_id}`);
    } catch (error: any) {
      if (error.statusCode === 429) {
        toast.warning('Вы превысили дневной лимит толкований. Оформите подписку Pro для безлимитного доступа.');
      } else {
        toast.error(error.message || 'Произошла ошибка при интерпретации сна');
      }
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    toast.info('🎤 Голосовой ввод скоро появится');
  };

  const handleGetStarted = () => {
    router.push('/login?reason=get_started');
  };

  // Современная статистика для Bento UI
  const stats = [
    { value: "847K+", label: "снов проанализировано", trend: "up" as const },
    { value: "98.7%", label: "точность анализа", trend: "up" as const },
    { value: "14s", label: "средняя скорость", trend: "neutral" as const },
    { value: "4.9⭐", label: "рейтинг пользователей", trend: "up" as const }
  ];

  // Популярные символы для быстрого доступа
  const popularSymbols = [
    { name: "Вода", emoji: "💧", description: "Эмоции и подсознание", color: "from-blue-400 to-cyan-400" },
    { name: "Огонь", emoji: "🔥", description: "Страсть и энергия", color: "from-red-400 to-orange-400" },
    { name: "Змея", emoji: "🐍", description: "Трансформация", color: "from-green-400 to-emerald-400" },
    { name: "Луна", emoji: "🌙", description: "Мистика и интуиция", color: "from-purple-400 to-violet-400" },
    { name: "Полет", emoji: "🦅", description: "Свобода и амбиции", color: "from-sky-400 to-blue-400" },
    { name: "Дом", emoji: "🏠", description: "Безопасность и семья", color: "from-amber-400 to-yellow-400" }
  ];

  // Преимущества AI анализа
  const features = [
    {
      icon: "🧠",
      title: "Нейросеть GPT-4o",
      description: "Самая продвинутая модель для анализа символов и паттернов"
    },
    {
      icon: "⚡",
      title: "Мгновенный результат", 
      description: "Полный анализ за 15 секунд с детальными объяснениями"
    },
    {
      icon: "🎯",
      title: "Персональный подход",
      description: "Учитывает ваш контекст, эмоции и жизненную ситуацию"
    },
    {
      icon: "📊",
      title: "Аналитика паттернов",
      description: "Отслеживает повторяющиеся символы и их эволюцию"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-bg-primary">
      {/* Modern mesh gradient background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary-500/20 to-accent-cyan/20 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-accent-pink/20 to-primary-600/20 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent-emerald/20 to-accent-cyan/20 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
            animationDelay: '4s'
          }}
        />
        
        {/* Parallax elements */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`
          }}
        >
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-accent-cyan rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 bg-accent-pink rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
      
      <Header />

      {/* Revolutionary Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="container relative mx-auto px-4 max-w-7xl">
          {/* Hero Text - Apple-style Typography */}
          <div className="text-center mb-20">
            <div 
              className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transform: `translateY(${scrollY * -0.1}px)` }}
            >
              <h1 className="text-hero font-black leading-[0.8] mb-8 tracking-tight">
                <span className="block text-gradient animate-fade-in">
                  Разгадай
                </span>
                <span className="block text-text-primary/80 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  любой сон
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl lg:text-4xl text-text-secondary font-light leading-relaxed max-w-4xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                AI-толкование снов нового поколения.
                <br />
                <span className="text-primary-500">Мгновенно. Точно. Персонально.</span>
              </p>
              
              <div className="flex items-center justify-center gap-6 mb-12 animate-scale-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
                  <span className="text-accent-emerald font-semibold">GPT-4o активна</span>
                </div>
                <div className="w-px h-6 bg-border-light" />
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <span className="text-primary-500 font-semibold">847K+ снов</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: '0.8s' }}>
                <Button
                  size="xl"
                  variant="primary"
                  onClick={handleGetStarted}
                  className="min-w-[240px] shadow-glow-primary"
                >
                  Начать анализ
                </Button>
                <Button
                  size="xl"
                  variant="ghost"
                  asChild
                  className="min-w-[200px]"
                >
                  <Link href="#features">Узнать больше</Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Statistics Cards */}
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`animate-scale-in`}
                style={{ animationDelay: `${1 + index * 0.1}s` }}
              >
                <StatCard
                  value={stat.value}
                  label={stat.label}
                  trend={stat.trend}
                  glow
                />
              </div>
            ))}
          </div>

          {/* Dream Input Section - требует авторизации */}
          <div className="max-w-4xl mx-auto">
            <GlassCard 
              className="p-8 md:p-12 animate-scale-in" 
              style={{ animationDelay: '1.4s' }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">Попробуйте прямо сейчас</h2>
                <p className="text-text-secondary text-lg">Опишите ваш сон для получения детального AI-анализа</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="Расскажите о вашем сне подробно... Например: 'Я видел во сне, как летал над городом...'"
                    rows={6}
                    className="min-h-[200px] bg-bg-secondary/50 border border-border-medium rounded-2xl text-text-primary placeholder-text-muted text-lg leading-relaxed p-6 focus-ring transition-smooth resize-none"
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-text-muted">
                    {dreamText.length}/4000
                  </div>
                </div>
                
                <div className="bg-bg-tertiary/50 rounded-xl p-4 border border-border-light">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 mt-0.5 rounded-full bg-accent-emerald/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-text-secondary">
                      <strong className="text-text-primary">Войдите в аккаунт</strong> для анализа снов. 
                      Регистрация займет 30 секунд через Telegram или email.
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    fullWidth
                    disabled={dreamText.length < 20 || interpretDream.isPending}
                    isLoading={interpretDream.isPending}
                    loadingText="Обрабатываем..."
                    className="shadow-glow-primary"
                  >
                    {dreamText.length < 20 
                      ? `Введите еще ${20 - dreamText.length} символов`
                      : 'Войти и разгадать сон'
                    }
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleVoiceInput}
                    size="lg"
                    variant="glass"
                    className="sm:w-auto w-full sm:px-4"
                    title="Голосовой ввод (скоро)"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span className="sm:hidden">Голосовой ввод</span>
                  </Button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>
      
      {/* Popular Symbols Section */}
      <section id="symbols" className="py-20 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-display font-bold text-text-primary mb-4">Популярные символы</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Изучите самые частые символы в снах и их значения
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularSymbols.map((symbol, index) => (
              <Link
                key={symbol.name}
                href={`/catalog/${symbol.name.toLowerCase()}`}
                className="group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BentoCard className="text-center h-full hover:scale-105 transition-all">
                  <div className="space-y-3">
                    <div className={`text-4xl group-hover:scale-110 transition-transform inline-block p-4 rounded-2xl bg-gradient-to-r ${symbol.color}`}>
                      {symbol.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary group-hover:text-primary-500 transition-colors">
                        {symbol.name}
                      </h3>
                      <p className="text-sm text-text-muted">{symbol.description}</p>
                    </div>
                  </div>
                </BentoCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-display font-bold text-text-primary mb-4">Почему выбирают нас</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Самая продвинутая технология анализа снов с персональным подходом к каждому пользователю
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BentoCard className="text-center h-full group hover:scale-105 transition-all">
                  <div className="space-y-4">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary-500 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-text-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </BentoCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <GlassCard className="text-center p-12 md:p-16 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-title font-bold text-text-primary mb-6">
                Готовы узнать тайны своих снов?
              </h2>
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Присоединяйтесь к 847K+ пользователей, которые уже разгадывают свои сны с помощью AI
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl"
                  variant="primary"
                  onClick={handleGetStarted}
                  className="min-w-[240px] shadow-glow-primary"
                >
                  Начать бесплатно
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  asChild
                  className="min-w-[200px]"
                >
                  <Link href="https://t.me/razgazdayson_bot">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.27-1.12 7.79-1.58 10.34-.2 1.08-.58 1.44-.95 1.48-.81.08-1.43-.54-2.22-1.05-1.23-.81-1.93-1.31-3.12-2.1-1.38-.91-.49-1.41.3-2.23.21-.21 3.82-3.5 3.89-3.8.01-.04.01-.19-.07-.27-.08-.08-.2-.05-.28-.03-.12.03-2.02 1.28-5.7 3.76-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.85-.28-1.52-.43-1.46-.91.03-.25.37-.51 1.01-.78 3.96-1.73 6.6-2.86 7.92-3.41 3.77-1.56 4.56-1.83 5.07-1.84.11 0 .37.03.53.18.14.12.18.28.2.46-.01.06.01.24 0 .38z"/>
                    </svg>
                    Telegram Bot
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-r from-primary-500/20 to-accent-cyan/20 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-r from-accent-pink/20 to-primary-600/20 rounded-full blur-3xl -z-0" />
          </GlassCard>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="relative py-20 mt-20">
        <div className="absolute inset-0 glass-light" />
        <div className="container relative mx-auto px-4 max-w-7xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
                  <span className="text-white text-xl">🌙</span>
                </div>
                <span className="text-2xl font-bold text-text-primary font-display">
                  Разгадай Сон
                </span>
              </div>
              <p className="text-text-secondary text-lg leading-relaxed mb-6 max-w-md">
                AI-платформа нового поколения для глубокого анализа и толкования снов
              </p>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
                <span className="text-accent-emerald font-medium">847K+ проанализированных снов</span>
              </div>
            </div>
            
            <div>
              <h4 className="mb-6 font-bold text-text-primary text-lg">Продукт</h4>
              <ul className="space-y-3 text-text-secondary">
                <li><Link href="/catalog" className="hover:text-primary-500 transition-colors hover-lift">Каталог символов</Link></li>
                <li><Link href="/journal" className="hover:text-primary-500 transition-colors hover-lift">Дневник снов</Link></li>
                <li><Link href="/pricing" className="hover:text-primary-500 transition-colors hover-lift">Тарифы</Link></li>
                <li><Link href="/about" className="hover:text-primary-500 transition-colors hover-lift">О проекте</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-6 font-bold text-text-primary text-lg">Поддержка</h4>
              <ul className="space-y-3 text-text-secondary">
                <li><Link href="/help" className="hover:text-primary-500 transition-colors hover-lift">Центр помощи</Link></li>
                <li><Link href="/faq" className="hover:text-primary-500 transition-colors hover-lift">Частые вопросы</Link></li>
                <li><a href="mailto:support@razgazdayson.ru" className="hover:text-primary-500 transition-colors hover-lift">Написать в поддержку</a></li>
                <li><Link href="https://t.me/razgazdayson_bot" className="hover:text-primary-500 transition-colors hover-lift">Telegram Bot</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border-light">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-text-muted">
                &copy; 2025 Разгадай Сон. Все права защищены.
              </p>
              <div className="flex items-center gap-6 text-sm text-text-muted">
                <Link href="/privacy" className="hover:text-text-primary transition-colors">Конфиденциальность</Link>
                <Link href="/terms" className="hover:text-text-primary transition-colors">Условия использования</Link>
                <Link href="/cookies" className="hover:text-text-primary transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}