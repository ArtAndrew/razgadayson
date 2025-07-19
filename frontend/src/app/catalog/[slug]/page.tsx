// ai_context_v3
/**
 * 🎯 main_goal: SEO-оптимизированная страница символа сна
 * ⚡ critical_requirements:
 *   - Детальное толкование символа
 *   - SEO meta tags и structured data
 *   - Похожие символы
 *   - CTA для интерпретации
 * 📥 inputs_outputs: Symbol slug -> Symbol interpretation
 * 🔧 functions_list:
 *   - SymbolDetailPage: Основной компонент
 *   - SymbolInterpretation: Толкование
 *   - RelatedSymbols: Похожие символы
 *   - ShareButtons: Социальный шеринг
 * 🚫 forbidden_changes: Не менять URL структуру
 * 🧪 tests: SEO tags, share functionality
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from '@/components/ui/Toast';

// Символы для демо (в реальном приложении будут из API)
const SYMBOLS_DATABASE: Record<string, any> = {
  'water': {
    id: 'water',
    name: 'Вода',
    emoji: '💧',
    title: 'К чему снится вода',
    shortDescription: 'Эмоции и подсознание',
    fullDescription: `Вода во сне — один из самых многозначных символов, тесно связанный с эмоциональным состоянием сновидца и его подсознательными процессами.

**Основные значения:**
- Чистая, прозрачная вода символизирует ясность мыслей, эмоциональное равновесие и духовное очищение
- Мутная или грязная вода может указывать на смятение, неопределенность или подавленные эмоции
- Спокойная вода отражает внутренний покой и гармонию
- Бурная вода или волны предупреждают о эмоциональных потрясениях или переменах

**Психологический аспект:**
С точки зрения психологии, вода представляет бессознательное, интуицию и женское начало. Карл Юнг интерпретировал воду как символ коллективного бессознательного и источник жизненной энергии.`,
    interpretations: [
      'Плавать в чистой воде — к успеху и благополучию',
      'Тонуть — страх потерять контроль над ситуацией',
      'Пить воду — жажда новых знаний или духовного роста',
      'Переходить воду вброд — преодоление препятствий'
    ],
    relatedSymbols: ['sea', 'rain', 'swimming', 'river'],
    category: 'nature',
    tags: ['эмоции', 'подсознание', 'очищение', 'интуиция']
  },
  'flight': {
    id: 'flight',
    name: 'Полет',
    emoji: '🦅',
    title: 'К чему снится полет',
    shortDescription: 'Свобода и амбиции',
    fullDescription: `Полет во сне — один из самых ярких и запоминающихся символов, часто связанный с ощущением свободы, преодолением ограничений и стремлением к высоким целям.

**Основные значения:**
- Легкий, приятный полет символизирует освобождение от проблем, достижение целей
- Трудный полет или страх высоты может указывать на амбиции, превышающие возможности
- Полет над знакомыми местами — желание посмотреть на ситуацию с новой перспективы
- Падение во время полета — страх неудачи или потери контроля

**Психологический аспект:**
Фрейд связывал полеты во сне с сексуальными желаниями и либидо. Современная психология чаще интерпретирует их как символ личностного роста, креативности и стремления к самореализации.`,
    interpretations: [
      'Летать высоко — большие амбиции и уверенность в себе',
      'Летать низко — осторожность и реалистичный подход',
      'Учиться летать — освоение новых навыков или ролей',
      'Летать с кем-то — совместные планы и проекты'
    ],
    relatedSymbols: ['falling', 'birds', 'wings', 'sky'],
    category: 'actions',
    tags: ['свобода', 'амбиции', 'успех', 'контроль']
  },
  // Добавьте больше символов по необходимости
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const symbol = SYMBOLS_DATABASE[slug];
  
  if (!symbol) {
    return {
      title: 'Символ не найден',
    };
  }

  return {
    title: symbol.title,
    description: `${symbol.title} - подробное толкование сна. ${symbol.shortDescription}. Узнайте, что означает ${symbol.name.toLowerCase()} в вашем сне.`,
    keywords: symbol.tags.join(', '),
    openGraph: {
      title: symbol.title,
      description: symbol.shortDescription,
      type: 'article',
    },
  };
}

export default async function SymbolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const symbol = SYMBOLS_DATABASE[slug];

  if (!symbol) {
    notFound();
  }

  const handleShare = async () => {
    const shareData = {
      title: symbol.title,
      text: `${symbol.title} - ${symbol.shortDescription}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Ссылка скопирована в буфер обмена');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // JSON-LD для SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: symbol.title,
    description: symbol.shortDescription,
    author: {
      '@type': 'Organization',
      name: 'Разгадай Сон',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Разгадай Сон',
      logo: {
        '@type': 'ImageObject',
        url: 'https://razgadayson.ru/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://razgadayson.ru/catalog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          </div>
          
          <div className="container relative mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-8 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-mystic-text-muted">
                <li><Link href="/" className="hover:text-white transition-colors">Главная</Link></li>
                <li className="text-mystic-text-muted">/</li>
                <li><Link href="/catalog" className="hover:text-white transition-colors">Каталог снов</Link></li>
                <li className="text-mystic-text-muted">/</li>
                <li className="text-white">{symbol.name}</li>
              </ol>
            </nav>

            <div className="text-center">
              <div className="text-8xl mb-6 animate-float">{symbol.emoji}</div>
              <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4 animate-fade-in">
                {symbol.title}
              </h1>
              <p className="text-xl text-mystic-text-secondary animate-slide-up">
                {symbol.shortDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Full Description */}
            <Card variant="glass" className="mb-8 animate-fade-in">
              <CardHeader>
                <CardTitle>Подробное толкование</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  {symbol.fullDescription.split('\n\n').map((paragraph: string, index: number) => {
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return (
                        <h3 key={index} className="text-xl font-semibold text-white mt-6 mb-3">
                          {paragraph.replace(/\*\*/g, '')}
                        </h3>
                      );
                    }
                    return (
                      <p key={index} className="text-mystic-text-secondary mb-4">
                        {paragraph.split('\n').map((line: string, lineIndex: number) => (
                          <span key={lineIndex}>
                            {line.startsWith('- ') ? (
                              <span className="block ml-4">• {line.substring(2)}</span>
                            ) : (
                              line
                            )}
                          </span>
                        ))}
                      </p>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Interpretations */}
            <Card variant="glass" className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Распространенные сценарии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {symbol.interpretations.map((interpretation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-primary-400 mt-1">•</span>
                      <p className="text-mystic-text-secondary">{interpretation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {symbol.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-primary-800/30 text-primary-300 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button
                variant="secondary"
                onClick={handleShare}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.732-1.684m5.732 1.684a3 3 0 01-5.732 1.684m0-9.368a3 3 0 105.732-1.684m-5.732 1.684m5.732-1.684m-5.732 1.684M12 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                Поделиться
              </Button>
              
              <Button variant="primary" asChild>
                <Link href={`/?symbol=${symbol.id}`}>
                  Толковать свой сон с {symbol.name}
                </Link>
              </Button>
            </div>

            {/* Related Symbols */}
            {symbol.relatedSymbols && symbol.relatedSymbols.length > 0 && (
              <Card variant="glass" className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <CardTitle>Связанные символы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {symbol.relatedSymbols.map((relatedId: string) => {
                      const related = SYMBOLS_DATABASE[relatedId];
                      if (!related) return null;
                      
                      return (
                        <Link
                          key={relatedId}
                          href={`/catalog/${relatedId}`}
                          className="text-center p-4 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className="text-3xl mb-2">{related.emoji}</div>
                          <p className="text-sm text-mystic-text-secondary hover:text-white transition-colors">
                            {related.name}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card variant="gradient" className="text-center p-8">
              <h2 className="text-3xl font-bold text-white mb-4 font-display">
                Хотите узнать, что означает ваш сон?
              </h2>
              <p className="text-lg text-mystic-text-secondary mb-6">
                Получите персональное AI-толкование с учетом всех деталей
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link href="/">Разгадать свой сон</Link>
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}