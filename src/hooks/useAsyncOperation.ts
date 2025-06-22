// Custom hook for handling async operations with proper cleanup
import { useState, useCallback, useRef, useEffect } from 'react';
import { extractApiError, type ApiErrorDetails } from '../utils/apiErrorHandler';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiErrorDetails | null;
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiErrorDetails) => void;
  showToast?: boolean;
}

export const useAsyncOperation = <T = any>(
  options: UseAsyncOperationOptions = {}
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async <R = T>(
    asyncFunction: (signal?: AbortSignal) => Promise<R>
  ): Promise<R | null> => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (!isMountedRef.current) return null;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const result = await asyncFunction(signal);
      
      if (!isMountedRef.current) return null;

      setState({
        data: result as T,
        loading: false,
        error: null
      });

      options.onSuccess?.(result);
      return result;
    } catch (error: any) {
      if (!isMountedRef.current) return null;

      // Don't handle aborted requests as errors
      if (error.name === 'AbortError') {
        return null;
      }

      const errorDetails = extractApiError(error);
      
      setState({
        data: null,
        loading: false,
        error: errorDetails
      });

      options.onError?.(errorDetails);
      return null;
    }
  }, [options]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data
    }));
  }, []);

  const setError = useCallback((error: ApiErrorDetails) => {
    setState(prev => ({
      ...prev,
      error,
      loading: false
    }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    isLoading: state.loading
  };
};
