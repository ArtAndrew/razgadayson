"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInterpretDream } from "@/hooks/useDreams";
import { dreamService } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";

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
      toast.error(validation.error || 'Текст сна не соответствует требованиям');
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
        toast.warning('Вы превысили дневной лимит толкований. Оформите подписку Pro для безлимитного доступа.');
      } else {
        // General error
        toast.error(error.message || 'Произошла ошибка при интерпретации сна');
      }
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    toast.info('Голосовой ввод будет доступен в ближайшее время');
  };

  const features = [
    {
      icon: "✨",
      title: "Глубинный анализ",
      description: "AI анализирует символы, эмоции и скрытые значения вашего сна"
    },
    {
      icon: "🔮",
      title: "Мгновенный результат",
      description: "Получите детальное толкование всего за 30 секунд"
    },
    {
      icon: "📚",
      title: "База знаний",
      description: "Опирается на психологию, мифологию и культурные традиции"
    },
    {
      icon: "🌟",
      title: "Персонализация",
      description: "Учитывает ваш контекст и историю для точных интерпретаций"
    }
  ];

  const popularSymbols = [
    { name: "Вода", emoji: "💧", description: "Эмоции и подсознание" },
    { name: "Полет", emoji: "🦅", description: "Свобода и амбиции" },
    { name: "Падение", emoji: "📉", description: "Потеря контроля" },
    { name: "Змея", emoji: "🐍", description: "Трансформация" },
    { name: "Деньги", emoji: "💰", description: "Ценности и успех" },
    { name: "Огонь", emoji: "🔥", description: "Страсть и энергия" },
    { name: "Дом", emoji: "🏠", description: "Безопасность и семья" },
    { name: "Море", emoji: "🌊", description: "Бессознательное" }
  ];

  const stats = [
    { value: "100K+", label: "Пользователей" },
    { value: "500K+", label: "Толкований" },
    { value: "98%", label: "Точность" },
    { value: "4.9★", label: "Рейтинг" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold md:text-7xl text-white font-display animate-fade-in">
              <span className="text-gradient">Разгадай Сон</span>
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-mystic-text-secondary animate-slide-up">
              AI-толкование снов с глубинным анализом символов
            </p>
            <p className="mb-10 text-lg text-mystic-text-muted animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Откройте тайны своего подсознания с помощью нейросети GPT-4
            </p>
            
            {/* Quick Dream Input */}
            <div className="mx-auto max-w-2xl animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <Card variant="glass" glow className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Textarea
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    label="Опишите свой сон"
                    placeholder="Я видел во сне..."
                    rows={5}
                    className="min-h-[150px]"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-mystic-text-muted">
                      {dreamText.length}/4000 символов
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleVoiceInput}
                      title="Голосовой ввод"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      disabled={dreamText.length < 20 || interpretDream.isPending}
                      isLoading={interpretDream.isPending}
                    >
                      {interpretDream.isPending ? 'Анализируем сон...' : 'Разгадать сон'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="flex-1"
                      asChild
                    >
                      <Link href="https://t.me/razgazdayson_bot">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.27-1.12 7.79-1.58 10.34-.2 1.08-.58 1.44-.95 1.48-.81.08-1.43-.54-2.22-1.05-1.23-.81-1.93-1.31-3.12-2.1-1.38-.91-.49-1.41.3-2.23.21-.21 3.82-3.5 3.89-3.8.01-.04.01-.19-.07-.27-.08-.08-.2-.05-.28-.03-.12.03-2.02 1.28-5.7 3.76-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.85-.28-1.52-.43-1.46-.91.03-.25.37-.51 1.01-.78 3.96-1.73 6.6-2.86 7.92-3.41 3.77-1.56 4.56-1.83 5.07-1.84.11 0 .37.03.53.18.14.12.18.28.2.46-.01.06.01.24 0 .38z"/>
                        </svg>
                        Telegram Bot
                      </Link>
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-4xl font-bold text-white font-display">
            Как это работает
          </h2>
          <p className="mb-12 text-center text-lg text-mystic-text-muted">
            Передовые технологии для глубокого понимания ваших снов
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="glass"
                hover
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-6">
                  <div className="mb-4 text-5xl">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-mystic-text-muted">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Symbols Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-4xl font-bold text-white font-display">
            Популярные символы снов
          </h2>
          <p className="mb-12 text-center text-lg text-mystic-text-muted">
            Исследуйте значения самых распространенных символов
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {popularSymbols.map((symbol) => (
              <Link
                key={symbol.name}
                href={`/catalog/${symbol.name.toLowerCase()}`}
                className="group"
              >
                <Card variant="solid" hover className="text-center">
                  <CardContent className="pt-6">
                    <div className="mb-3 text-4xl group-hover:scale-110 transition-transform">
                      {symbol.emoji}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {symbol.name}
                    </h3>
                    <p className="text-sm text-mystic-text-muted mt-1">
                      {symbol.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card variant="gradient" className="p-12">
            <div className="grid gap-8 text-center md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="mb-2 text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-mystic-text-secondary">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card variant="glass" glow className="text-center p-12">
            <h2 className="mb-6 text-4xl font-bold text-white font-display">
              Начните разгадывать сны прямо сейчас
            </h2>
            <p className="mb-8 text-xl text-mystic-text-secondary">
              Откройте двери в мир своего подсознания
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="lg" asChild>
                <Link href="/register">
                  Создать аккаунт Pro
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="https://t.me/razgazdayson_bot">
                  Попробовать в Telegram
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative py-16 mt-20">
        <div className="absolute inset-0 glass" />
        <div className="container relative mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-mystic flex items-center justify-center">
                  <span className="text-white text-xl">🌙</span>
                </div>
                <span className="text-xl font-bold text-white font-display">
                  Разгадай Сон
                </span>
              </div>
              <p className="text-mystic-text-muted">
                AI-толкование снов нового поколения
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Продукт</h4>
              <ul className="space-y-2 text-mystic-text-muted">
                <li><Link href="/about" className="hover:text-white transition-colors">О проекте</Link></li>
                <li><Link href="/catalog" className="hover:text-white transition-colors">Каталог снов</Link></li>
                <li><Link href="/journal" className="hover:text-white transition-colors">Журнал снов</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Тарифы</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Поддержка</h4>
              <ul className="space-y-2 text-mystic-text-muted">
                <li><Link href="/help" className="hover:text-white transition-colors">Центр помощи</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">Частые вопросы</Link></li>
                <li><a href="mailto:support@razgazdayson.ru" className="hover:text-white transition-colors">support@razgazdayson.ru</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Правовая информация</h4>
              <ul className="space-y-2 text-mystic-text-muted">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Условия использования</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-mystic-text-muted">
            <p>&copy; 2025 Разгадай Сон. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}