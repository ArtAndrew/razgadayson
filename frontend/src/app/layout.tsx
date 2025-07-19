import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Разгадай Сон - AI-толкование снов",
  description: "Мгновенная расшифровка снов с помощью искусственного интеллекта. Узнайте, что означают ваши сны за 30 секунд.",
  keywords: "толкование снов, сонник, расшифровка снов, AI сонник, к чему снится",
  openGraph: {
    title: "Разгадай Сон - AI-толкование снов",
    description: "Мгновенная расшифровка снов с помощью искусственного интеллекта",
    url: "https://razgazdayson.ru",
    siteName: "Разгадай Сон",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Разгадай Сон - AI-толкование снов",
    description: "Мгновенная расшифровка снов с помощью искусственного интеллекта",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
