// Application constants and configuration

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH_TOKEN: '/api/v1/auth/refresh',
    GOOGLE_LOGIN: '/api/v1/auth/google',
    OTP_SEND: '/api/v1/auth/otp/send',
    OTP_VALIDATE: '/api/v1/auth/otp/validate',
  },
  USER: {
    PROFILE: '/api/v1/user/profile',
    UPDATE_PROFILE: '/api/v1/user/profile',
  },
  ADMIN: {
    DASHBOARD: '/api/v1/admin/dashboard/stats',
    PRODUCTS: '/api/v1/admin/products',
    ORDERS: '/api/v1/admin/orders',
    USERS: '/api/v1/admin/users',
  },
  PUBLIC: {
    PRODUCTS: '/api/v1/products',
    CATEGORIES: '/api/v1/categories',
  }
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CART: 'cart',
  RECENTLY_VIEWED: 'recentlyViewed',
  COMPARISON: 'comparison',
} as const;

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  STAFF: 'ROLE_STAFF',
  USER: 'ROLE_USER',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  PRODUCTS: '/products',
  CART: '/cart',
  PROFILE: '/profile',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_AGE: 18,
  PHONE_PATTERN: /^[0-9]{10,11}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
