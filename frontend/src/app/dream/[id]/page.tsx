// ai_context_v3
/**
 * 🎯 main_goal: Страница отображения результата интерпретации сна
 * ⚡ critical_requirements:
 *   - Показ интерпретации с символами и эмоциями
 *   - Кнопки сохранения и шаринга
 *   - Генерация TTS для Pro пользователей
 * 📥 inputs_outputs: Dream ID -> Interpretation display
 * 🔧 functions_list:
 *   - DreamResultPage: Основной компонент страницы
 *   - showInterpretation: Отображение интерпретации
 *   - handleTTS: Генерация озвучки
 * 🚫 forbidden_changes: Не показывать Pro функции бесплатным пользователям
 * 🧪 tests: Проверка отображения всех элементов
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDream, useGenerateTTS } from '@/hooks/useDreams';
import { useAuth } from '@/hooks/useAuth';
import type { DreamInterpretResponse } from '@/types/dream';

export default function DreamResultPage() {
  const params = useParams();
  const router = useRouter();
  const dreamId = params.id as string;
  
  const { user } = useAuth();
  const { data: dream, isLoading, error } = useDream(dreamId);
  const generateTTS = useGenerateTTS();
  
  const [sessionInterpretation, setSessionInterpretation] = useState<DreamInterpretResponse | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load interpretation from session storage if available
  useEffect(() => {
    const stored = sessionStorage.getItem('lastInterpretation');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.dream_id === dreamId) {
          setSessionInterpretation(data);
        }
      } catch {
        // Ignore parse errors
      }
      sessionStorage.removeItem('lastInterpretation');
    }
  }, [dreamId]);

  const interpretation = dream?.interpretation || sessionInterpretation?.interpretation;
  const similarDreams = sessionInterpretation?.similar_dreams || [];

  const handleShare = async () => {
    const shareData = {
      title: `Мой сон: ${interpretation?.main_symbol}`,
      text: `Я видел сон про ${interpretation?.main_symbol}. Узнай, что означают твои сны!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        alert('Ссылка скопирована в буфер обмена');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGenerateTTS = async () => {
    if (!user || user.subscription_type === 'free') {
      alert('Озвучка доступна только для Pro пользователей');
      router.push('/subscribe');
      return;
    }

    try {
      const result = await generateTTS.mutateAsync({ 
        dreamId, 
        voice: 'nova' 
      });
      
      // Create audio URL from base64
      const blob = new Blob(
        [Uint8Array.from(atob(result.audio), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      // Auto-play
      const audio = new Audio(url);
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => setIsPlaying(false);
    } catch (error: any) {
      alert(error.message || 'Ошибка генерации озвучки');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600">Загружаем интерпретацию...</p>
        </div>
      </div>
    );
  }

  if (error || (!dream && !sessionInterpretation)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Интерпретация не найдена</h1>
          <p className="mb-6 text-gray-600">Возможно, ссылка устарела или сон был удален</p>
          <Link
            href="/"
            className="rounded-lg bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-purple-600 hover:text-purple-700">
            ← Вернуться на главную
          </Link>
        </div>

        {/* Main Symbol Card */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-8 text-center text-white shadow-xl">
          <div className="mb-4 text-6xl">{interpretation?.main_symbol_emoji}</div>
          <h1 className="mb-2 text-3xl font-bold">{interpretation?.main_symbol}</h1>
          <p className="text-lg opacity-90">Главный символ вашего сна</p>
        </div>

        {/* Interpretation */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold">Толкование</h2>
          <p className="whitespace-pre-wrap text-gray-700">{interpretation?.interpretation}</p>
        </div>

        {/* Emotions */}
        {interpretation?.emotions && interpretation.emotions.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Эмоции во сне</h2>
            <div className="space-y-3">
              {interpretation.emotions.map((emotion, index) => (
                <div key={index} className="border-l-4 border-purple-500 bg-gray-50 p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className="font-semibold">{emotion.name}</h3>
                    <span className={`rounded-full px-3 py-1 text-sm ${
                      emotion.intensity === 'высокая' ? 'bg-red-100 text-red-700' :
                      emotion.intensity === 'средняя' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {emotion.intensity}
                    </span>
                  </div>
                  <p className="text-gray-600">{emotion.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advice */}
        {interpretation?.advice && (
          <div className="mb-8 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Совет</h2>
            <p className="text-gray-700">{interpretation.advice}</p>
          </div>
        )}

        {/* Similar Dreams */}
        {similarDreams.length > 0 && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-2xl font-bold">Похожие сны</h2>
            <div className="space-y-3">
              {similarDreams.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/dream/${similar.id}`}
                  className="block rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:bg-purple-50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">{similar.main_symbol}</span>
                    <span className="text-sm text-gray-500">
                      Сходство: {Math.round(similar.similarity * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{similar.text}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleShare}
            className="flex-1 rounded-lg border border-purple-600 bg-white px-6 py-3 font-semibold text-purple-600 hover:bg-purple-50 sm:flex-none"
          >
            Поделиться
          </button>
          
          <button
            onClick={handleGenerateTTS}
            disabled={generateTTS.isPending || isPlaying}
            className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 sm:flex-none"
          >
            {generateTTS.isPending ? 'Генерируем...' : 
             isPlaying ? 'Воспроизводится...' : 
             '🔊 Озвучить'}
          </button>

          {user ? (
            <Link
              href="/profile/dreams"
              className="flex-1 rounded-lg bg-gray-600 px-6 py-3 text-center font-semibold text-white hover:bg-gray-700 sm:flex-none"
            >
              Мои сны
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex-1 rounded-lg bg-gray-600 px-6 py-3 text-center font-semibold text-white hover:bg-gray-700 sm:flex-none"
            >
              Войти
            </Link>
          )}
        </div>

        {/* Pro Features Hint */}
        {(!user || user.subscription_type === 'free') && (
          <div className="mt-8 rounded-lg bg-purple-50 p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold">Откройте больше возможностей с Pro</h3>
            <p className="mb-4 text-gray-600">
              Безлимитные толкования, озвучка, глубокий анализ и многое другое
            </p>
            <Link
              href="/subscribe"
              className="inline-block rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
            >
              Попробовать Pro бесплатно
            </Link>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>AI модель: {interpretation?.ai_model}</p>
          <p>Время обработки: {interpretation?.processing_time_ms}мс</p>
        </div>
      </div>
    </div>
  );
}