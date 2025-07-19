"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  animation = 'pulse',
  width,
  height,
  style,
  ...props
}) => {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const dimensions = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'text' ? '16px' : '100px'),
  };

  return (
    <div
      className={cn(
        'bg-mystic-bg-tertiary/50',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        ...style,
      }}
      {...props}
    />
  );
};

// Skeleton container for multiple skeleton items
interface SkeletonContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  children,
  className,
}) => {
  return <div className={cn('space-y-3', className)}>{children}</div>;
};

// Pre-built skeleton patterns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('glass rounded-2xl p-6', className)}>
      <SkeletonContainer>
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={60} height={60} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </div>
        </div>
        <Skeleton variant="rounded" height={120} />
        <div className="space-y-2">
          <Skeleton />
          <Skeleton />
          <Skeleton width="80%" />
        </div>
      </SkeletonContainer>
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => {
  return (
    <SkeletonContainer className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </SkeletonContainer>
  );
};

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className 
}) => {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
};

export const SkeletonButton: React.FC<{ width?: string | number; className?: string }> = ({ 
  width = 120, 
  className 
}) => {
  return (
    <Skeleton
      variant="rounded"
      width={width}
      height={44}
      className={className}
    />
  );
};

export default Skeleton;