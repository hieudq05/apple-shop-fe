// Authentication-related type definitions
import type { User } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birth: string;
  password: string;
}

export interface GoogleLoginData {
  credential: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: {
    code: string;
    message: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface OtpResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    expiredIn: number;
  };
}

export interface OtpValidationRequest {
  email: string;
  otp: string;
}

export interface OtpValidationResponse {
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}
