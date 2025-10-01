import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  rollbackOnError?: boolean;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateOptimistically = useCallback(async (
    optimisticUpdate: (currentData: T) => T,
    apiCall: () => Promise<T>
  ) => {
    const previousData = data;
    
    // Apply optimistic update immediately
    setData(optimisticUpdate);
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      if (options.rollbackOnError !== false) {
        // Rollback to previous data
        setData(previousData);
      }
      
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [data, options]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    updateOptimistically,
    reset
  };
}
