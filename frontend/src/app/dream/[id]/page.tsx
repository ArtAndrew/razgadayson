'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDream, useGenerateTTS } from '@/hooks/useDreams';
import { useAuth } from '@/hooks/useAuth';
import type { DreamInterpretResponse } from '@/types/dream';
import { toast } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Skeleton, { SkeletonText, SkeletonCard } from '@/components/ui/Skeleton';

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
        toast.success('Ссылка скопирована в буфер обмена');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleGenerateTTS = async () => {
    if (!user || user.subscription_type === 'free') {
      toast.warning('Озвучка доступна только для Pro пользователей');
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
      toast.error(error.message || 'Ошибка генерации озвучки');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 pt-24">
          {/* Loading State */}
          <div className="mb-8">
            <Skeleton variant="rounded" height={200} className="w-full" />
          </div>
          <SkeletonCard />
          <div className="mt-6">
            <SkeletonText lines={5} />
          </div>
        </div>
      </div>
    );
  }

  if (error || (!dream && !sessionInterpretation)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Header />
        <Card variant="glass" className="text-center max-w-md">
          <CardContent className="pt-6">
            <div className="mb-4 text-6xl">😔</div>
            <h1 className="mb-4 text-2xl font-bold text-white">Интерпретация не найдена</h1>
            <p className="mb-6 text-mystic-text-muted">
              Возможно, ссылка устарела или сон был удален
            </p>
            <Button variant="primary" asChild>
              <Link href="/">Вернуться на главную</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="container relative mx-auto max-w-4xl px-4 pt-24 pb-12">
        {/* Main Symbol Card */}
        <Card variant="gradient" className="mb-8 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-600/20" />
          <CardContent className="relative z-10 py-12">
            <div className="mb-6 text-8xl animate-float">{interpretation?.main_symbol_emoji}</div>
            <h1 className="mb-3 text-4xl font-bold text-white font-display">
              {interpretation?.main_symbol}
            </h1>
            <p className="text-xl text-mystic-text-secondary">
              Главный символ вашего сна
            </p>
          </CardContent>
        </Card>

        {/* Interpretation */}
        <Card variant="glass" className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">📜</span>
              Толкование
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-mystic-text-secondary leading-relaxed">
              {interpretation?.interpretation}
            </p>
          </CardContent>
        </Card>

        {/* Emotions */}
        {interpretation?.emotions && interpretation.emotions.length > 0 && (
          <Card variant="glass" className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">💭</span>
                Эмоции во сне
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interpretation.emotions.map((emotion, index) => (
                  <div 
                    key={index} 
                    className="glass rounded-lg p-4 border-l-4"
                    style={{
                      borderColor: emotion.intensity === 'высокая' ? '#ef4444' :
                                  emotion.intensity === 'средняя' ? '#f59e0b' : '#10b981'
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-white">{emotion.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                        emotion.intensity === 'высокая' ? 'bg-red-500/20 text-red-400' :
                        emotion.intensity === 'средняя' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {emotion.intensity}
                      </span>
                    </div>
                    <p className="text-mystic-text-muted">{emotion.meaning}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advice */}
        {interpretation?.advice && (
          <Card variant="glass" glow className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">✨</span>
                Совет
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-mystic-text-secondary">{interpretation.advice}</p>
            </CardContent>
          </Card>
        )}

        {/* Similar Dreams */}
        {similarDreams.length > 0 && (
          <Card variant="glass" className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">🔗</span>
                Похожие сны
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {similarDreams.map((similar) => (
                  <Link
                    key={similar.id}
                    href={`/dream/${similar.id}`}
                    className="block glass rounded-lg p-4 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-white">{similar.main_symbol}</span>
                      <span className="text-sm text-mystic-text-muted">
                        Сходство: {Math.round(similar.similarity * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-mystic-text-muted line-clamp-2">{similar.text}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleShare}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.732-1.684m5.732 1.684a3 3 0 01-5.732 1.684m0-9.368a3 3 0 105.732-1.684m-5.732 1.684m5.732-1.684m-5.732 1.684M12 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            Поделиться
          </Button>
          
          <Button
            variant="gradient"
            size="lg"
            onClick={handleGenerateTTS}
            disabled={generateTTS.isPending || isPlaying}
            isLoading={generateTTS.isPending}
            leftIcon={<span>🔊</span>}
          >
            {isPlaying ? 'Воспроизводится...' : 'Озвучить'}
          </Button>

          {user ? (
            <Button variant="primary" size="lg" asChild>
              <Link href="/journal">Мой журнал снов</Link>
            </Button>
          ) : (
            <Button variant="primary" size="lg" asChild>
              <Link href="/login">Войти в аккаунт</Link>
            </Button>
          )}
        </div>

        {/* Pro Features Hint */}
        {(!user || user.subscription_type === 'free') && (
          <Card variant="gradient" className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardContent className="py-8">
              <h3 className="mb-3 text-2xl font-bold text-white font-display">
                Откройте больше возможностей с Pro
              </h3>
              <p className="mb-6 text-mystic-text-secondary">
                Безлимитные толкования, озвучка, глубокий анализ и многое другое
              </p>
              <Button variant="gradient" size="lg" asChild>
                <Link href="/subscribe">Попробовать Pro бесплатно</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-mystic-text-muted">
          <p>AI модель: {interpretation?.ai_model}</p>
          <p>Время обработки: {interpretation?.processing_time_ms}мс</p>
        </div>
      </div>
    </div>
  );
}