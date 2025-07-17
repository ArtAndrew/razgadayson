"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [dreamText, setDreamText] = useState("");

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
              <form className="space-y-4">
                <textarea
                  value={dreamText}
                  onChange={(e) => setDreamText(e.target.value)}
                  placeholder="Опишите свой сон..."
                  className="w-full rounded-lg bg-white/10 p-4 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                  rows={4}
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={dreamText.length < 20}
                    className="flex-1 rounded-lg bg-white px-6 py-3 font-semibold text-purple-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Разгадать сон
                  </button>
                  <Link
                    href="https://t.me/razgazdayson_bot"
                    className="flex-1 rounded-lg border-2 border-white px-6 py-3 text-center font-semibold transition hover:bg-white hover:text-purple-600"
                  >
                    Открыть в Telegram
                  </Link>
                </div>
              </form>
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
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Опишите сон</h3>
              <p className="text-gray-600">
                Введите текст или надиктуйте голосом описание вашего сна
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI анализ</h3>
              <p className="text-gray-600">
                GPT-4 анализирует символы, эмоции и скрытые значения
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                3
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
            {["Вода", "Полет", "Падение", "Змея", "Деньги", "Смерть", "Беременность", "Свадьба"].map((symbol) => (
              <Link
                key={symbol}
                href={`/sonnik/${symbol.toLowerCase()}`}
                className="rounded-lg bg-white p-4 text-center shadow transition hover:shadow-lg"
              >
                <span className="text-lg font-medium">{symbol}</span>
              </Link>
            ))}
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
            Более 100 000 пользователей уже раскрыли тайны своих снов
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="https://t.me/razgazdayson_bot"
              className="rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 transition hover:bg-gray-100"
            >
              Telegram Bot
            </Link>
            <Link
              href="/app"
              className="rounded-lg border-2 border-white px-8 py-3 font-semibold transition hover:bg-white hover:text-purple-600"
            >
              Web App
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
                <li><Link href="/about">О проекте</Link></li>
                <li><Link href="/catalog">Каталог снов</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Поддержка</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help">Помощь</Link></li>
                <li><Link href="/contact">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Правовая информация</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy">Политика конфиденциальности</Link></li>
                <li><Link href="/terms">Пользовательское соглашение</Link></li>
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