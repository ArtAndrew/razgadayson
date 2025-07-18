// ai_context_v3
/**
 * 🎯 main_goal: Страница входа с Telegram OAuth и email
 * ⚡ critical_requirements:
 *   - Telegram Login Widget
 *   - Email/password форма (для будущего)
 *   - Обработка pending сна после входа
 * 📥 inputs_outputs: Auth credentials -> User session
 * 🔧 functions_list:
 *   - LoginPage: Основной компонент
 *   - handleTelegramAuth: Обработка Telegram OAuth
 *   - handleEmailAuth: Email авторизация
 * 🚫 forbidden_changes: Не хранить пароли в открытом виде
 * 🧪 tests: Mock auth responses
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useTelegramLogin, useEmailLogin } from '@/hooks/useAuth';
import type { TelegramAuthData } from '@/types/auth';

// Telegram Bot username from environment
const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'razgazdayson_bot';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const telegramLogin = useTelegramLogin();
  const emailLogin = useEmailLogin();

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
      
      // Check if there's a pending dream
      const pendingDream = sessionStorage.getItem('pendingDream');
      if (pendingDream) {
        sessionStorage.removeItem('pendingDream');
        // Navigate back to home with the dream pre-filled
        router.push(`/?dream=${encodeURIComponent(pendingDream)}`);
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await emailLogin.mutateAsync({ email, password });
      
      // Check for pending dream
      const pendingDream = sessionStorage.getItem('pendingDream');
      if (pendingDream) {
        sessionStorage.removeItem('pendingDream');
        router.push(`/?dream=${encodeURIComponent(pendingDream)}`);
      }
    } catch (error: any) {
      alert(error.message || 'Ошибка входа');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-purple-600">Разгадай Сон</h1>
            </Link>
            <p className="mt-2 text-gray-600">Войдите в свой аккаунт</p>
          </div>

          {/* Reason message */}
          {reason === 'interpretation' && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-800">
              Войдите, чтобы сохранить интерпретацию сна
            </div>
          )}
          {reason === 'session_expired' && (
            <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800">
              Ваша сессия истекла. Пожалуйста, войдите снова
            </div>
          )}

          {/* Telegram Login */}
          <div className="mb-6">
            <h2 className="mb-4 text-center text-lg font-semibold">
              Рекомендуемый способ
            </h2>
            <div className="flex justify-center">
              <div id="telegram-login-container">
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
                        data-radius="8"
                        data-onauth="onTelegramAuth(user)"
                        data-request-access="write"
                      ></script>
                    `
                  }}
                />
              </div>
            </div>
            <p className="mt-3 text-center text-sm text-gray-600">
              Безопасный вход через Telegram
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">или</span>
            </div>
          </div>

          {/* Email Login Toggle */}
          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full rounded-lg border border-gray-300 py-3 text-gray-700 hover:bg-gray-50"
            >
              Войти с email (скоро)
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  placeholder="your@email.com"
                  required
                  disabled
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  placeholder="••••••••"
                  required
                  disabled
                />
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                Email авторизация будет доступна в следующей версии
              </div>
              <button
                type="submit"
                disabled
                className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Войти
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Назад
              </button>
            </form>
          )}

          {/* Register link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Нет аккаунта? </span>
            <Link href="/register" className="font-medium text-purple-600 hover:text-purple-700">
              Создайте бесплатно
            </Link>
          </div>

          {/* Loading state */}
          {(telegramLogin.isPending || emailLogin.isPending) && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="rounded-lg bg-white p-6 text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                <p>Входим в систему...</p>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">Войдя в аккаунт, вы получите:</p>
          <ul className="space-y-1">
            <li>✓ Сохранение всех интерпретаций</li>
            <li>✓ Личный дневник снов</li>
            <li>✓ Статистику и аналитику</li>
            <li>✓ Возможность делиться снами</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Загрузка...</div>}>
      <LoginContent />
    </Suspense>
  );
}