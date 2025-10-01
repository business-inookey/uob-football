import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useLoadingState(initialState: LoadingState = {
  isLoading: false,
  error: null,
  success: false
}) {
  const [state, setState] = useState<LoadingState>(initialState);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? null : prev.error,
      success: loading ? false : prev.success
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      success: false
    }));
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    setState(prev => ({
      ...prev,
      success,
      isLoading: false,
      error: null
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false
    });
  }, []);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
      successMessage?: string;
    } = {}
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await asyncFn();
      setSuccess(true);
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSuccess]);

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    reset,
    executeAsync
  };
}
