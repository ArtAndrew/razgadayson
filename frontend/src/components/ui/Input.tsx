"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, rightElement, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value || props.defaultValue;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative">
        {label && (
          <label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none z-10',
              isFocused || hasValue
                ? 'top-0 -translate-y-1/2 text-xs bg-mystic-bg px-1 text-primary-400'
                : 'top-1/2 -translate-y-1/2 text-mystic-text-muted'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-mystic-text-muted">
              {icon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'flex h-12 w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-all duration-200',
              'placeholder:text-mystic-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-mystic-bg',
              'disabled:cursor-not-allowed disabled:opacity-50',
              {
                'border-mystic-bg-tertiary hover:border-primary-600': !error,
                'border-red-500 focus:ring-red-500': error,
                'pl-10': icon,
                'pr-10': rightElement,
              },
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-500 animate-slide-down">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component with same styling
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value || props.defaultValue;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="relative">
        {label && (
          <label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none z-10',
              isFocused || hasValue
                ? 'top-0 -translate-y-1/2 text-xs bg-mystic-bg px-1 text-primary-400'
                : 'top-6 -translate-y-1/2 text-mystic-text-muted'
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-lg border bg-transparent px-3 py-4 text-sm transition-all duration-200',
            'placeholder:text-mystic-text-muted resize-none',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-mystic-bg',
            'disabled:cursor-not-allowed disabled:opacity-50',
            {
              'border-mystic-bg-tertiary hover:border-primary-600': !error,
              'border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-xs text-red-500 animate-slide-down">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };