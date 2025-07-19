import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Разгадай Сон - Мистическое толкование снов",
  description: "Мгновенная расшифровка снов. Узнайте, что означают ваши сны за 30 секунд.",
  keywords: "толкование снов, сонник, расшифровка снов, мистический сонник, к чему снится",
  openGraph: {
    title: "Разгадай Сон - Мистическое толкование снов",
    description: "Мгновенная расшифровка снов",
    url: "https://razgazdayson.ru",
    siteName: "Разгадай Сон",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Разгадай Сон - Мистическое толкование снов",
    description: "Мгновенная расшифровка снов",
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
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-bg-primary text-text-primary transition-smooth">
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
