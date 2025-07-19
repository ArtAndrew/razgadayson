"use client";

/**
 * ai_context_v3
 * 
 * 🎯 main_goal: Современный компонент кнопки с трендами 2025 года
 * 
 * ⚡ critical_requirements:
 * - Поддержка светлой и темной темы
 * - Современные анимации и эффекты (hover, focus, active)
 * - Glassmorphism и градиентные стили
 * - Адаптивность для всех устройств
 * - Доступность (WCAG 2.1)
 * 
 * 📥 inputs_outputs:
 * - Input: variant, size, состояние загрузки, иконки
 * - Output: стилизованная кнопка с анимациями
 * 
 * 🔧 functions_list:
 * - Варианты: primary, secondary, ghost, outline, destructive
 * - Размеры: sm, md, lg, icon
 * - Состояния: loading, disabled, focus, hover
 * 
 * 🚫 forbidden_changes:
 * - Нельзя нарушать доступность
 * - Нельзя убирать поддержку тем
 * 
 * 🧪 tests:
 * - Корректные стили для всех вариантов
 * - Правильная работа в светлой/темной теме
 * - Анимации работают плавно
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-smooth focus-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-primary text-white',
          'hover:shadow-glow-primary hover-lift',
          'active:scale-[0.98]',
          'btn-modern btn-shimmer'
        ],
        secondary: [
          'bg-bg-secondary text-text-primary border border-border-medium',
          'hover:bg-bg-tertiary hover:border-border-strong hover-lift',
          'active:scale-[0.98]'
        ],
        ghost: [
          'text-text-secondary bg-transparent',
          'hover:text-text-primary hover:bg-glass-light hover-lift',
          'active:scale-[0.98]'
        ],
        outline: [
          'border border-border-medium bg-transparent text-text-primary',
          'hover:bg-glass-light hover:border-border-strong hover-lift',
          'active:scale-[0.98]'
        ],
        glass: [
          'glass text-text-primary',
          'hover:bg-glass-medium hover-lift',
          'active:scale-[0.98]'
        ],
        gradient: [
          'bg-gradient-secondary text-white',
          'hover:shadow-glow-pink hover-lift',
          'active:scale-[0.98]',
          'btn-modern btn-shimmer'
        ],
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700 hover:shadow-lg hover-lift',
          'active:scale-[0.98]'
        ],
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-lg',
        md: 'h-11 px-6 text-base rounded-xl',
        lg: 'h-14 px-8 text-lg rounded-2xl',
        xl: 'h-16 px-10 text-xl rounded-2xl',
        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    children, 
    variant, 
    size,
    asChild = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    loadingText = 'Загрузка...',
    fullWidth = false,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg 
              className="mr-2 h-4 w-4 animate-spin" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
              role="presentation"
              aria-hidden="true"
            >
              <circle 
                className="opacity-30" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className={cn(
                'flex items-center',
                children && 'mr-2'
              )}>
                {leftIcon}
              </span>
            )}
            {children && <span>{children}</span>}
            {rightIcon && (
              <span className={cn(
                'flex items-center',
                children && 'ml-2'
              )}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Экспорт дополнительных утилит
export const getButtonIcon = (size: 'sm' | 'md' | 'lg' | 'xl' | 'icon' = 'md') => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6', 
    xl: 'w-7 h-7',
    icon: 'w-5 h-5'
  };
  return sizeMap[size];
};

export { Button, buttonVariants };