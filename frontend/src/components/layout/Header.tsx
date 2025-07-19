"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/catalog', label: 'Каталог снов' },
    { href: '/journal', label: 'Журнал' },
    { href: '/about', label: 'О проекте' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'glass-medium shadow-lg backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center transition-smooth group-hover:scale-110">
              <span className="text-white text-xl">🌙</span>
            </div>
            <span className="text-xl font-bold text-text-primary font-display transition-smooth group-hover:text-primary-500">
              Разгадай Сон
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-smooth hover-lift px-3 py-2 rounded-lg',
                  pathname === link.href
                    ? 'text-primary-500 bg-glass-light'
                    : 'text-text-secondary hover:text-text-primary hover:bg-glass-light'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-text-secondary hover:text-text-primary hover:bg-glass-light transition-smooth"
              asChild
            >
              <Link href="/login">Войти</Link>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="bg-gradient-primary hover:shadow-glow-primary transition-smooth btn-modern"
              asChild
            >
              <Link href="/register">Начать</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-primary hover:bg-glass-light transition-smooth focus-ring"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-strong rounded-2xl mt-2 p-4 animate-slide-up border border-border-light">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">Настройки</span>
                <ThemeToggle />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-smooth',
                    pathname === link.href
                      ? 'bg-glass-medium text-primary-500 border border-border-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass-light'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border-light" />
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-glass-light transition-smooth"
              >
                Войти
              </Link>
              <Button 
                variant="primary" 
                size="sm" 
                className="bg-gradient-primary hover:shadow-glow-primary transition-smooth btn-modern w-full"
                asChild
              >
                <Link href="/register">Начать</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;