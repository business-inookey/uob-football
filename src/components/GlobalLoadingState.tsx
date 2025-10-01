"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppLoader } from './ui/AppLoader';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      setLoading,
      loadingMessage,
      setLoadingMessage
    }}>
      {isLoading ? (
        <AppLoader message={loadingMessage} showLogo={false} />
      ) : (
        children
      )}
    </LoadingContext.Provider>
  );
}

// Hook for showing loading during async operations
export function useAsyncLoading() {
  const { setLoading, setLoadingMessage } = useLoading();

  const executeWithLoading = async <T,>(
    asyncFn: () => Promise<T>,
    message: string = 'Loading...'
  ): Promise<T | null> => {
    setLoadingMessage(message);
    setLoading(true);
    
    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      console.error('Async operation failed:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { executeWithLoading };
}
