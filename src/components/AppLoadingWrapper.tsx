"use client";
import { useState, useEffect } from 'react';
import { InitialAppLoader } from './ui/AppLoader';

interface AppLoadingWrapperProps {
  children: React.ReactNode;
}

export function AppLoadingWrapper({ children }: AppLoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds to show the loader

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <InitialAppLoader />;
  }

  return <>{children}</>;
}
