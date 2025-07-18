"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInterpretDream } from "@/hooks/useDreams";
import { dreamService } from "@/lib/api";

export default function Home() {
  const [dreamText, setDreamText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const router = useRouter();
  
  const interpretDream = useInterpretDream();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dream text
    const validation = dreamService.validateDreamText(dreamText);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      // Interpret dream
      const result = await interpretDream.mutateAsync({
        text: dreamText,
        language: "ru",
        include_similar: true
      });

      // Store result in sessionStorage for the result page
      sessionStorage.setItem('lastInterpretation', JSON.stringify(result));
      
      // Navigate to result page
      router.push(`/dream/${result.dream_id}`);
    } catch (error: any) {
      // Handle specific errors
      if (error.statusCode === 401) {
        // Not authenticated - save dream and redirect to login
        sessionStorage.setItem('pendingDream', dreamText);
        router.push('/login?reason=interpretation');
      } else if (error.statusCode === 429) {
        // Rate limit exceeded
        alert('Вы превысили дневной лимит толкований. Оформите подписку Pro для безлимитного доступа.');
      } else {
        // General error
        alert(error.message || 'Произошла ошибка при интерпретации сна');
      }
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice recording
    setIsRecording(!isRecording);
    alert('Голосовой ввод будет доступен в следующей версии');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 py-20 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-7xl">
              Разгадай Сон
            </h1>
            <p className="mb-8 text-xl md:text-2xl">
              AI-толкование снов за 30 секунд
            </p>
            <p className="mb-10 text-lg opacity-90">
              Введите описание своего сна и получите мгновенную интерпретацию от искусственного интеллекта
            </p>
            
            {/* Quick Dream Input */}
            <div className="mx-auto max-w-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    placeholder="Опишите свой сон..."
                    className="w-full rounded-lg bg-white/10 p-4 pr-12 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                    rows={4}
                    minLength={20}
                    maxLength={4000}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="absolute bottom-4 right-4 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                    title="Голосовой ввод"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-sm text-white/70">
                  {dreamText.length}/4000 символов (минимум 20)
                </div>
                
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={dreamText.length < 20 || interpretDream.isPending}
                    className="flex-1 rounded-lg bg-white px-6 py-3 font-semibold text-purple-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {interpretDream.isPending ? 'Анализируем...' : 'Разгадать сон'}
                  </button>
                  <Link
                    href="https://t.me/razgazdayson_bot"
                    className="flex-1 rounded-lg border-2 border-white px-6 py-3 text-center font-semibold transition hover:bg-white hover:text-purple-600"
                  >
                    Открыть в Telegram
                  </Link>
                </div>
              </form>
              
              {/* Error display */}
              {interpretDream.error && (
                <div className="mt-4 rounded-lg bg-red-500/20 p-4 text-white">
                  {interpretDream.error.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">
            Как это работает
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Опишите сон</h3>
              <p className="text-gray-600">
                Введите текст или надиктуйте голосом описание вашего сна
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI анализ</h3>
              <p className="text-gray-600">
                GPT-4 анализирует символы, эмоции и скрытые значения
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Получите толкование</h3>
              <p className="text-gray-600">
                Мгновенная расшифровка с советами и рекомендациями
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Dreams Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold">
            Популярные символы
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              { name: "Вода", emoji: "💧" },
              { name: "Полет", emoji: "🦅" },
              { name: "Падение", emoji: "📉" },
              { name: "Змея", emoji: "🐍" },
              { name: "Деньги", emoji: "💰" },
              { name: "Смерть", emoji: "💀" },
              { name: "Беременность", emoji: "🤰" },
              { name: "Свадьба", emoji: "💒" }
            ].map((symbol) => (
              <Link
                key={symbol.name}
                href={`/catalog/${symbol.name.toLowerCase()}`}
                className="group rounded-lg bg-white p-4 text-center shadow transition hover:shadow-lg"
              >
                <div className="mb-2 text-3xl">{symbol.emoji}</div>
                <span className="text-lg font-medium group-hover:text-purple-600">{symbol.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold text-purple-600">100K+</div>
              <div className="text-gray-600">Пользователей</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-purple-600">500K+</div>
              <div className="text-gray-600">Разгаданных снов</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-purple-600">30 сек</div>
              <div className="text-gray-600">Время анализа</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-purple-600">4.8★</div>
              <div className="text-gray-600">Рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold">
            Начните разгадывать сны прямо сейчас
          </h2>
          <p className="mb-8 text-xl">
            Получите глубокое понимание своего подсознания с помощью AI
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="https://t.me/razgazdayson_bot"
              className="rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 transition hover:bg-gray-100"
            >
              Telegram Bot
            </Link>
            <Link
              href="/register"
              className="rounded-lg border-2 border-white px-8 py-3 font-semibold transition hover:bg-white hover:text-purple-600"
            >
              Создать аккаунт
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold">Разгадай Сон</h3>
              <p className="text-gray-400">
                AI-толкование снов для современного мира
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Продукт</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">О проекте</Link></li>
                <li><Link href="/catalog" className="hover:text-white">Каталог снов</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Поддержка</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Помощь</Link></li>
                <li><a href="mailto:support@razgazdayson.ru" className="hover:text-white">support@razgazdayson.ru</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Правовая информация</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Политика конфиденциальности</Link></li>
                <li><Link href="/terms" className="hover:text-white">Пользовательское соглашение</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Разгадай Сон. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}