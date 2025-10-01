"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dataTitle?: string;
  dataText?: string;
  dataStart?: string;
  isActive?: boolean;
}

export function AnimatedButton({
  children,
  variant = 'default',
  size = 'md',
  className,
  dataTitle,
  dataText,
  dataStart,
  isActive = false,
  ...props
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'w-32 h-10 text-xs',
    md: 'w-40 h-12 text-sm',
    lg: 'w-48 h-14 text-base'
  };

  const variantClasses = {
    default: 'bg-white text-primary border-primary',
    primary: 'bg-primary text-white border-primary',
    success: 'bg-emerald-500 text-white border-emerald-500',
    destructive: 'bg-red-500 text-white border-red-500',
    outline: 'bg-transparent text-primary border-primary',
    ghost: 'bg-transparent text-primary border-transparent'
  };

  return (
    <button
      className={cn(
        'animated-btn relative overflow-hidden font-medium uppercase tracking-wide transition-all duration-300 ease-in-out cursor-pointer border-0 flex items-center justify-center rounded-sm',
        sizeClasses[size],
        variantClasses[variant],
        isActive && 'animated-btn-active',
        className
      )}
      data-title={dataTitle}
      data-text={dataText}
      data-start={dataStart}
      {...props}
    >
      <span className="absolute inset-0 z-10" />
      <p className="animated-btn-text m-0 p-0 transition-all duration-400 ease-out absolute w-full h-full">
        {children}
      </p>
    </button>
  );
}

export default AnimatedButton;
