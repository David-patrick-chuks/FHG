import { apiClient } from '@/lib/api-client';
import { ApiResponse, LoadingState } from '@/types';
import { useCallback, useRef, useState } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
  autoExecute?: boolean;
  initialData?: T;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  state: LoadingState;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
    autoExecute = false,
    initialData = null,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<LoadingState>('idle');
  
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setState('idle');
    retryCountRef.current = 0;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [initialData]);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        // Abort previous request if still running
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError(null);
        setState('loading');

        const response = await apiFunction(...args);
        
        if (abortControllerRef.current.signal.aborted) {
          return null;
        }

        if (response.success && response.data) {
          setData(response.data);
          setState('success');
          onSuccess?.(response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'API request failed');
        }
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted) {
          return null;
        }

        const error = err instanceof Error ? err : new Error('An unexpected error occurred');
        setError(error);
        setState('error');

        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          setState('loading');
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return execute(...args);
        }

        onError?.(error);
        return null;
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
        abortControllerRef.current = null;
      }
    },
    [apiFunction, onSuccess, onError, retryCount, retryDelay]
  );

  // Auto-execute if enabled
  if (autoExecute && state === 'idle') {
    execute();
  }

  return {
    data,
    loading,
    error,
    state,
    execute,
    reset,
    setData,
  };
}

// Specialized hooks for common operations
export function useGet<T = any>(
  endpoint: string,
  options?: Omit<UseApiOptions<T>, 'autoExecute'>
) {
  return useApi(() => apiClient.get<T>(endpoint), { ...options, autoExecute: true });
}

export function usePost<T = any>(
  endpoint: string,
  options?: Omit<UseApiOptions<T>, 'autoExecute'>
) {
  return useApi((data: any) => apiClient.post<T>(endpoint, data), options);
}

export function usePut<T = any>(
  endpoint: string,
  options?: Omit<UseApiOptions<T>, 'autoExecute'>
) {
  return useApi((data: any) => apiClient.put<T>(endpoint, data), options);
}

export function useDelete<T = any>(
  endpoint: string,
  options?: Omit<UseApiOptions<T>, 'autoExecute'>
) {
  return useApi(() => apiClient.delete<T>(endpoint), options);
}
