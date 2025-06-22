// Centralized API error handling utilities
import type { AxiosError } from 'axios';

export interface StandardApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta?: {
    currentPage: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
  };
}

export interface ApiErrorDetails {
  message: string;
  code: string;
  statusCode: number;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Extract error details from API response
 */
export const extractApiError = (error: any): ApiErrorDetails => {
  const axiosError = error as AxiosError;
  
  // Default error details
  const defaultError: ApiErrorDetails = {
    message: 'Đã xảy ra lỗi không xác định',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  };

  // Network error
  if (!axiosError.response) {
    return {
      ...defaultError,
      message: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
      code: 'NETWORK_ERROR',
      statusCode: 0
    };
  }

  const { status, data } = axiosError.response;
  
  // Extract error details from response
  const errorDetails: ApiErrorDetails = {
    message: (data as any)?.message || getStatusMessage(status),
    code: (data as any)?.error?.code || `HTTP_${status}`,
    statusCode: status,
    validationErrors: (data as any)?.error?.errors || (data as any)?.errors
  };

  return errorDetails;
};

/**
 * Get user-friendly message for HTTP status codes
 */
const getStatusMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Yêu cầu không hợp lệ';
    case 401:
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại';
    case 403:
      return 'Bạn không có quyền thực hiện thao tác này';
    case 404:
      return 'Không tìm thấy dữ liệu yêu cầu';
    case 409:
      return 'Dữ liệu đã tồn tại hoặc xung đột';
    case 422:
      return 'Dữ liệu đầu vào không hợp lệ';
    case 429:
      return 'Quá nhiều yêu cầu. Vui lòng thử lại sau';
    case 500:
      return 'Lỗi máy chủ nội bộ';
    case 502:
      return 'Máy chủ không phản hồi';
    case 503:
      return 'Dịch vụ tạm thời không khả dụng';
    case 504:
      return 'Kết nối quá chậm';
    default:
      return 'Đã xảy ra lỗi không xác định';
  }
};

/**
 * Create standardized error response
 */
export const createErrorResponse = <T = any>(error: any): StandardApiResponse<T> => {
  const errorDetails = extractApiError(error);
  
  return {
    success: false,
    message: errorDetails.message,
    error: {
      code: errorDetails.code,
      message: errorDetails.message,
      errors: errorDetails.validationErrors
    }
  };
};

/**
 * Create standardized success response
 */
export const createSuccessResponse = <T = any>(data: T, message: string = 'Thành công'): StandardApiResponse<T> => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: any): boolean => {
  const errorDetails = extractApiError(error);
  return errorDetails.statusCode === 401 || errorDetails.statusCode === 403;
};

/**
 * Check if error is validation related
 */
export const isValidationError = (error: any): boolean => {
  const errorDetails = extractApiError(error);
  return errorDetails.statusCode === 422 && !!errorDetails.validationErrors;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: Array<{ field: string; message: string }>): string[] => {
  return errors.map(error => `${error.field}: ${error.message}`);
};
