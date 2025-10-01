import React from 'react';
import { cn } from '@/lib/utils';

interface CustomLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export function CustomLoader({ 
  size = 'md', 
  className,
  color = '#3B82F6' // primary color
}: CustomLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11', // 44.8px ≈ 44px
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div 
        className={cn('relative', sizeClasses[size])}
        style={{ color }}
      >
        {/* Main loader circle */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(11.2px, currentColor 94%, transparent)`
          }}
        />
        
        {/* Animated corner elements */}
        <div 
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: `
              radial-gradient(10.08px at bottom right, transparent 94%, currentColor) top left,
              radial-gradient(10.08px at bottom left, transparent 94%, currentColor) top right,
              radial-gradient(10.08px at top right, transparent 94%, currentColor) bottom left,
              radial-gradient(10.08px at top left, transparent 94%, currentColor) bottom right
            `,
            backgroundSize: '22.4px 22.4px',
            backgroundRepeat: 'no-repeat',
            animation: 'customLoader 1.5s infinite cubic-bezier(0.3,1,0,1)'
          }}
        />
      </div>
      
      {/* Custom keyframes via style tag */}
      <style jsx>{`
        @keyframes customLoader {
          33% {
            inset: -11.2px;
            transform: rotate(0deg);
          }
          66% {
            inset: -11.2px;
            transform: rotate(90deg);
          }
          100% {
            inset: 0;
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
}

// Alternative implementation using CSS classes
export function CustomLoaderCSS({ 
  size = 'md', 
  className,
  color = '#3B82F6'
}: CustomLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div 
        className={cn('custom-loader', sizeClasses[size])}
        style={{ '--loader-color': color } as React.CSSProperties}
      />
    </div>
  );
}

export default CustomLoader;
