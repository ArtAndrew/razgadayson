"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    const duration = toast.duration || 5000;
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [toast]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStyles = () => {
    const baseStyles = "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border";
    const typeStyles = {
      success: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
      error: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
      warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
      info: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
    };
    return `${baseStyles} ${typeStyles[toast.type]}`;
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className={getStyles()}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 text-sm font-medium">
          {toast.message}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-4 hover:opacity-70 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
};

// Toast Hook for easy usage
let toastIdCounter = 0;
let addToast: ((toast: Omit<ToastMessage, 'id'>) => void) | null = null;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToast = (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${++toastIdCounter}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
    };

    return () => {
      addToast = null;
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    removeToast,
    success: (message: string, duration?: number) => 
      addToast?.({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => 
      addToast?.({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) => 
      addToast?.({ type: 'warning', message, duration }),
    info: (message: string, duration?: number) => 
      addToast?.({ type: 'info', message, duration }),
  };
};

// Global toast function for use outside of React components
export const toast = {
  success: (message: string, duration?: number) => 
    addToast?.({ type: 'success', message, duration }),
  error: (message: string, duration?: number) => 
    addToast?.({ type: 'error', message, duration }),
  warning: (message: string, duration?: number) => 
    addToast?.({ type: 'warning', message, duration }),
  info: (message: string, duration?: number) => 
    addToast?.({ type: 'info', message, duration }),
};