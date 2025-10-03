"use client";
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppLoader } from './AppLoader';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Listen for route changes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (isLoading) {
    return <AppLoader message="Loading page..." showLogo={false} />;
  }

  return <>{children}</>;
}

export function SmoothTransition({ 
  children, 
  isTransitioning 
}: { 
  children: React.ReactNode;
  isTransitioning: boolean;
}) {
  return (
    <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
      {children}
    </div>
  );
}
