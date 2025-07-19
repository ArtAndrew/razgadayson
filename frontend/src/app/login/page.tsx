"use client";

/**
 * ai_context_v3
 * 
 * 🎯 main_goal: Революционная страница авторизации в стиле Apple с Glassmorphism эффектами
 * 
 * ⚡ critical_requirements:
 * - Обязательная авторизация для анализа снов
 * - Telegram OAuth как основной способ
 * - Email авторизация (в разработке)
 * - Обработка pending сна после входа
 * - Apple-стиль дизайн с крупной типографикой
 * - Glassmorphism карточки и эффекты
 * - Адаптивность mobile-first
 * - Плавные анимации и микроинтеракции
 * 
 * 📥 inputs_outputs:
 * - Input: Telegram auth data, email/password, URL params (reason, redirect)
 * - Output: Authenticated user session, navigation to target page
 * 
 * 🔧 functions_list:
 * - LoginContent: Основной компонент с формами
 * - handleTelegramAuth: Обработка Telegram OAuth
 * - handleEmailSubmit: Email авторизация (отключена)
 * - handleAuthSuccess: Redirect после успешной авторизации
 * 
 * 🚫 forbidden_changes:
 * - Нельзя хранить пароли в открытом виде
 * - Нельзя нарушать security flow
 * - Нельзя убирать проверку pending сна
 * 
 * 🧪 tests:
 * - Корректная работа Telegram OAuth
 * - Правильный redirect после входа
 * - Обработка pending сна
 * - Адаптивность на всех устройствах
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useTelegramLogin, useEmailLogin } from '@/hooks/useAuth';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { GlassCard, BentoCard } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import type { TelegramAuthData } from '@/types/auth';

// Telegram Bot username from environment
const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'razgazdayson_bot';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const redirect = searchParams.get('redirect');
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const telegramLogin = useTelegramLogin();
  const emailLogin = useEmailLogin();

  // Параллакс эффекты
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) - 0.5, 
        y: (e.clientY / window.innerHeight) - 0.5 
      });
    };
    
    const handleLoad = () => {
      setIsLoaded(true);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('load', handleLoad);
    setIsLoaded(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Handle Telegram auth callback
  useEffect(() => {
    // Expose callback function for Telegram widget
    (window as any).onTelegramAuth = (user: TelegramAuthData) => {
      handleTelegramAuth(user);
    };

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, []);

  const handleTelegramAuth = async (authData: TelegramAuthData) => {
    try {
      await telegramLogin.mutateAsync(authData);
      handleAuthSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа через Telegram');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await emailLogin.mutateAsync({ email, password });
      handleAuthSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Ошибка входа');
    }
  };

  const handleAuthSuccess = () => {
    // Check if there's a pending dream
    const pendingDream = sessionStorage.getItem('pendingDream');
    
    if (pendingDream) {
      sessionStorage.removeItem('pendingDream');
      toast.success('Добро пожаловать! Сейчас проанализируем ваш сон');
      router.push(`/?dream=${encodeURIComponent(pendingDream)}`);
    } else if (redirect) {
      router.push(decodeURIComponent(redirect));
    } else {
      toast.success('Добро пожаловать!');
      router.push('/');
    }
  };

  // Получаем сообщение в зависимости от причины
  const getReasonMessage = () => {
    switch (reason) {
      case 'dream_analysis':
        return {
          title: 'Войдите для анализа сна',
          description: 'Авторизация необходима для сохранения и анализа ваших снов',
          color: 'from-primary-500/20 to-accent-cyan/20',
          icon: '🌙'
        };
      case 'get_started':
        return {
          title: 'Добро пожаловать!',
          description: 'Создайте аккаунт и начните разгадывать свои сны',
          color: 'from-accent-emerald/20 to-primary-500/20',
          icon: '✨'
        };
      case 'session_expired':
        return {
          title: 'Сессия истекла',
          description: 'Пожалуйста, войдите в систему еще раз',
          color: 'from-accent-pink/20 to-red-400/20',
          icon: '⏰'
        };
      default:
        return {
          title: 'Войдите в аккаунт',
          description: 'Получите доступ ко всем функциям сервиса',
          color: 'from-primary-500/20 to-accent-cyan/20',
          icon: '🚀'
        };
    }
  };

  const reasonData = getReasonMessage();

  return (
    <div className="min-h-screen relative overflow-hidden bg-bg-primary">
      {/* Modern mesh gradient background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-primary-500/15 to-accent-cyan/15 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-accent-pink/15 to-primary-600/15 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent-emerald/15 to-accent-cyan/15 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(-50%, -50%) translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
            animationDelay: '4s'
          }}
        />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Main Auth Card */}
          <div 
            className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
          >
            <GlassCard className="p-8 md:p-10 text-center relative overflow-hidden">
              {/* Logo and Header */}
              <div className="mb-8">
                <Link href="/" className="inline-block group">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-smooth">
                    <span className="text-white text-2xl">🌙</span>
                  </div>
                  <h1 className="text-4xl font-black text-text-primary font-display mb-2 group-hover:text-primary-500 transition-smooth">
                    Разгадай Сон
                  </h1>
                </Link>
                <p className="text-lg text-text-secondary leading-relaxed">
                  Тайны ваших снов раскрыты
                </p>
              </div>

              {/* Reason Message */}
              {reason && (
                <div className={`mb-8 p-6 rounded-2xl bg-gradient-to-r ${reasonData.color} border border-border-light animate-scale-in`}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-3xl">{reasonData.icon}</span>
                    <h3 className="text-xl font-bold text-text-primary">{reasonData.title}</h3>
                  </div>
                  <p className="text-text-secondary leading-relaxed">{reasonData.description}</p>
                </div>
              )}

              {/* Telegram Login Section */}
              <div className="mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-text-primary mb-2">
                    Войти через Telegram
                  </h2>
                  <p className="text-text-secondary">
                    Мудрость веков в расшифровке снов
                  </p>
                </div>

                <div className="flex justify-center mb-4">
                  <div id="telegram-login-container" className="hover-lift transition-smooth">
                    <Script
                      src="https://telegram.org/js/telegram-widget.js?22"
                      strategy="lazyOnload"
                      onLoad={() => {
                        // Initialize Telegram widget
                        (window as any).TelegramLoginWidget = {
                          dataOnauth: (user: TelegramAuthData) => {
                            (window as any).onTelegramAuth(user);
                          }
                        };
                      }}
                    />
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `
                          <script 
                            async 
                            src="https://telegram.org/js/telegram-widget.js?22" 
                            data-telegram-login="${TELEGRAM_BOT_USERNAME}"
                            data-size="large"
                            data-radius="12"
                            data-onauth="onTelegramAuth(user)"
                            data-request-access="write"
                          ></script>
                        `
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-center text-sm text-text-muted">
                  <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse" />
                  <span>Авторизация за 3 секунды</span>
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-light"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-bg-primary px-4 text-text-muted">или</span>
                </div>
              </div>

              {/* Email Login Section */}
              {!showEmailForm ? (
                <Button
                  onClick={() => setShowEmailForm(true)}
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="mb-6"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Войти с email (скоро)
                </Button>
              ) : (
                <div className="mb-6 animate-slide-up">
                  <form onSubmit={handleEmailSubmit} className="space-y-6">
                    <div className="text-left">
                      <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                        Email адрес
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-border-medium bg-bg-secondary/50 px-4 py-3 text-text-primary placeholder-text-muted focus-ring transition-smooth"
                        placeholder="your@email.com"
                        required
                        disabled
                      />
                    </div>
                    <div className="text-left">
                      <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                        Пароль
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-border-medium bg-bg-secondary/50 px-4 py-3 text-text-primary placeholder-text-muted focus-ring transition-smooth"
                        placeholder="••••••••"
                        required
                        disabled
                      />
                    </div>
                    
                    <div className="bg-bg-tertiary/50 rounded-xl p-4 border border-border-light">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 mt-0.5 rounded-full bg-accent-pink/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-accent-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-sm text-text-secondary">
                          <strong className="text-text-primary">Email авторизация в разработке.</strong><br />
                          Пока доступен только вход через Telegram.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        variant="outline"
                        size="lg"
                        fullWidth
                      >
                        Назад
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        disabled
                        className="opacity-50"
                      >
                        Войти
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Register link */}
              <div className="text-center">
                <span className="text-text-muted">Нет аккаунта? </span>
                <Link href="/register" className="font-semibold text-primary-500 hover:text-primary-600 transition-colors hover-lift">
                  Создайте бесплатно
                </Link>
              </div>

              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-primary-500/10 to-accent-cyan/10 rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-accent-pink/10 to-primary-600/10 rounded-full blur-3xl -z-0" />
            </GlassCard>
          </div>

          {/* Benefits Section */}
          <div 
            className={`mt-8 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            style={{ transitionDelay: '0.2s' }}
          >
            <BentoCard className="p-6 text-center">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Что вы получите
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="w-2 h-2 bg-accent-emerald rounded-full" />
                  <span>Безлимитный дневник</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  <span>Анализ повторяющихся символов</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="w-2 h-2 bg-accent-cyan rounded-full" />
                  <span>Синхронизация устройств</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <div className="w-2 h-2 bg-accent-pink rounded-full" />
                  <span>Экспорт данных</span>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Loading overlay */}
          {(telegramLogin.isPending || emailLogin.isPending) && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
              <GlassCard className="p-8 text-center max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center animate-pulse">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Авторизация...</h3>
                <p className="text-text-secondary">Подключаемся к серверу</p>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <GlassCard className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-primary flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">🌙</span>
          </div>
          <p className="text-text-secondary">Загружаем страницу входа...</p>
        </GlassCard>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}