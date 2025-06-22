// Custom hook for admin data management with caching and optimistic updates
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAsyncOperation } from './useAsyncOperation';
import { useToast } from '../contexts/ToastContext';
import type { ApiErrorDetails } from '../utils/apiErrorHandler';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface UseAdminDataOptions<T> {
  cacheKey?: string;
  cacheExpiry?: number; // in milliseconds
  onSuccess?: (data: T) => void;
  onError?: (error: ApiErrorDetails) => void;
  showToast?: boolean;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export const useAdminData = <T = any>(
  fetchFunction: (params?: any) => Promise<any>,
  options: UseAdminDataOptions<T> = {}
) => {
  const { success, error: showError } = useToast();
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());
  
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });

  const {
    data,
    loading,
    error,
    execute,
    setData
  } = useAsyncOperation<T>({
    onSuccess: (data) => {
      if (options.showToast !== false) {
        success('Dữ liệu đã được tải thành công');
      }
      options.onSuccess?.(data);
    },
    onError: (error) => {
      if (options.showToast !== false) {
        showError(error.message);
      }
      options.onError?.(error);
    }
  });

  // Cache management
  const getCachedData = useCallback((key: string): T | null => {
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() < cached.timestamp + cached.expiry) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((key: string, data: T, expiry: number = 5 * 60 * 1000) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }, []);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  // Fetch data with caching
  const fetchData = useCallback(async (params?: any, forceRefresh: boolean = false) => {
    const cacheKey = options.cacheKey || JSON.stringify(params);
    
    // Check cache first
    if (!forceRefresh && options.cacheKey) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
    }

    const result = await execute(async () => {
      const response = await fetchFunction(params);
      
      if (response.success) {
        // Update pagination if available
        if (response.meta) {
          setPagination({
            currentPage: response.meta.currentPage + 1, // Convert to 1-based
            totalPages: response.meta.totalPage,
            totalItems: response.meta.totalElements,
            pageSize: response.meta.pageSize
          });
        }

        // Cache the data
        if (options.cacheKey) {
          setCachedData(cacheKey, response.data, options.cacheExpiry);
        }

        return response.data;
      } else {
        throw new Error(response.message || 'Không thể tải dữ liệu');
      }
    });

    return result;
  }, [execute, fetchFunction, options.cacheKey, options.cacheExpiry, getCachedData, setCachedData, setData]);

  // Optimistic update
  const optimisticUpdate = useCallback((updateFn: (currentData: T | null) => T) => {
    const newData = updateFn(data);
    setData(newData);
    return newData;
  }, [data, setData]);

  // Pagination helpers
  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => 
      prev.currentPage < prev.totalPages 
        ? { ...prev, currentPage: prev.currentPage + 1 }
        : prev
    );
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => 
      prev.currentPage > 1 
        ? { ...prev, currentPage: prev.currentPage - 1 }
        : prev
    );
  }, []);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      if (options.cacheKey) {
        clearCache(options.cacheKey);
      }
    };
  }, [options.cacheKey, clearCache]);

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    optimisticUpdate,
    clearCache,
    goToPage,
    nextPage,
    prevPage,
    refresh: () => fetchData(undefined, true)
  };
};
