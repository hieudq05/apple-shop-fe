import axios, {AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse} from 'axios';
import {clearTokens, getAccessToken, getRefreshToken, setAccessToken} from './storage';

// Base URL from environment or default
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance for public requests (no auth required)
export const publicAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for authenticated requests
export const privateAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for private axios to add auth token
privateAxios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      // Backend already sends token with Bearer prefix, use as-is
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for private axios to handle token refresh
privateAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token, redirect to login
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to refresh token
        const refreshResponse = await publicAxios.post('/api/v1/auth/refresh', {
          refreshToken: refreshToken,
        });

        if (refreshResponse.data.success) {
          const newAccessToken = refreshResponse.data.data.accessToken;
          setAccessToken(newAccessToken);

          // Retry original request with new token (backend sends with Bearer prefix)
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: newAccessToken,
          };

          return privateAxios(originalRequest);
        } else {
          // Refresh failed, clear tokens and redirect
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Generic request function
export const makeRequest = async <T>(
  axiosInstance: AxiosInstance,
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Public API methods
export const publicAPI = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(publicAxios, { method: 'GET', url, ...config }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(publicAxios, { method: 'POST', url, data, ...config }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(publicAxios, { method: 'PUT', url, data, ...config }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(publicAxios, { method: 'PATCH', url, data, ...config }),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(publicAxios, { method: 'DELETE', url, ...config }),
};

// Private API methods (with authentication)
export const privateAPI = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(privateAxios, { method: 'GET', url, ...config }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(privateAxios, { method: 'POST', url, data, ...config }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(privateAxios, { method: 'PUT', url, data, ...config }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(privateAxios, { method: 'PATCH', url, data, ...config }),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    makeRequest<T>(privateAxios, { method: 'DELETE', url, ...config }),
};

// Default export
export default {
  public: publicAPI,
  private: privateAPI,
  publicAxios,
  privateAxios,
};
