"use client";

/**
 * ai_context_v3
 * 
 * 🎯 main_goal: Современный компонент карточки с Glassmorphism и Bento UI стилями
 * 
 * ⚡ critical_requirements:
 * - Поддержка светлой и темной темы
 * - Glassmorphism эффекты с backdrop-filter
 * - Bento UI модульные блоки
 * - Плавные анимации и микроинтеракции
 * - Адаптивность
 * 
 * 📥 inputs_outputs:
 * - Input: variant (тип карточки), содержимое, модификаторы
 * - Output: стилизованная карточка с содержимым
 * 
 * 🔧 functions_list:
 * - Варианты: glass, solid, gradient, bento
 * - Модификаторы: hover, glow, interactive
 * - Компоненты: Header, Title, Description, Content, Footer
 * 
 * 🚫 forbidden_changes:
 * - Нельзя нарушать структуру составных компонентов
 * - Нельзя убирать поддержку аксессибилити
 * 
 * 🧪 tests:
 * - Корректное отображение всех вариантов
 * - Плавные переходы между состояниями
 * - Правильная работа в разных темах
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-2xl transition-smooth overflow-hidden',
  {
    variants: {
      variant: {
        glass: [
          'glass border border-border-light',
          'backdrop-blur-md'
        ],
        solid: [
          'bg-bg-card border border-border-light',
          'shadow-md'
        ],
        gradient: [
          'bg-gradient-primary text-white',
          'border border-white/20',
          'shadow-lg'
        ],
        bento: [
          'glass-medium border border-border-medium',
          'backdrop-blur-lg',
          'hover:glass-strong'
        ],
        elevated: [
          'bg-bg-card border border-border-light',
          'shadow-xl',
          'hover:shadow-2xl'
        ],
        minimal: [
          'bg-transparent border-0',
          'hover:bg-glass-light'
        ]
      },
      size: {
        sm: 'p-4 rounded-lg',
        md: 'p-6 rounded-2xl',
        lg: 'p-8 rounded-3xl',
        xl: 'p-10 rounded-3xl'
      },
      interactive: {
        true: [
          'cursor-pointer',
          'hover-lift',
          'active:scale-[0.98]'
        ],
        false: ''
      }
    },
    defaultVariants: {
      variant: 'glass',
      size: 'md',
      interactive: false
    }
  }
);

interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  glow?: boolean;
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive,
    glow = false, 
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive }),
          {
            'shadow-glow-primary': glow && (variant === 'gradient' || variant === 'bento'),
            'shadow-glow-cyan': glow && variant === 'glass',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-6 space-y-2', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-bold leading-tight tracking-tight text-text-primary font-display',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-base text-text-muted leading-relaxed', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between pt-6 mt-6 border-t border-border-light', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

// Специальные карточки для Bento UI
const BentoCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <Card
      ref={ref}
      variant="bento"
      interactive
      className={cn('group', className)}
      {...props}
    >
      {children}
    </Card>
  )
);

BentoCard.displayName = 'BentoCard';

const GlassCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <Card
      ref={ref}
      variant="glass"
      className={cn('backdrop-blur-xl border-border-light/50', className)}
      {...props}
    >
      {children}
    </Card>
  )
);

GlassCard.displayName = 'GlassCard';

const StatCard = React.forwardRef<
  HTMLDivElement,
  CardProps & { value: string; label: string; trend?: 'up' | 'down' | 'neutral' }
>(({ className, value, label, trend = 'neutral', ...props }, ref) => (
  <Card
    ref={ref}
    variant="bento"
    size="md"
    className={cn('text-center', className)}
    {...props}
  >
    <div className="space-y-2">
      <div className={cn(
        'text-3xl font-bold',
        trend === 'up' && 'text-emerald-500',
        trend === 'down' && 'text-red-500',
        trend === 'neutral' && 'text-text-primary'
      )}>
        {value}
      </div>
      <div className="text-sm text-text-muted">
        {label}
      </div>
    </div>
  </Card>
));

StatCard.displayName = 'StatCard';

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  BentoCard,
  GlassCard,
  StatCard,
  cardVariants
};