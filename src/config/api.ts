// API configuration and client setup
import { privateAPI, publicAPI } from '../utils/axios';
import type { ApiResponse } from '../types/api';

interface ApiClientConfig {
  requiresAuth?: boolean;
  skipAuthRefresh?: boolean;
}

class ApiClient {
  async get<T>(url: string, config?: ApiClientConfig): Promise<ApiResponse<T>> {
    const client = config?.requiresAuth === false ? publicAPI : privateAPI;
    return client.get<ApiResponse<T>>(url);
  }

  async post<T>(url: string, data?: any, config?: ApiClientConfig): Promise<ApiResponse<T>> {
    const client = config?.requiresAuth === false ? publicAPI : privateAPI;
    return client.post<ApiResponse<T>>(url, data);
  }

  async put<T>(url: string, data?: any, config?: ApiClientConfig): Promise<ApiResponse<T>> {
    const client = config?.requiresAuth === false ? publicAPI : privateAPI;
    return client.put<ApiResponse<T>>(url, data);
  }

  async patch<T>(url: string, data?: any, config?: ApiClientConfig): Promise<ApiResponse<T>> {
    const client = config?.requiresAuth === false ? publicAPI : privateAPI;
    return client.patch<ApiResponse<T>>(url, data);
  }

  async delete<T>(url: string, config?: ApiClientConfig): Promise<ApiResponse<T>> {
    const client = config?.requiresAuth === false ? publicAPI : privateAPI;
    return client.delete<ApiResponse<T>>(url);
  }
}

const apiClient = new ApiClient();
export default apiClient;
