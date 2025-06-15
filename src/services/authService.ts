// Authentication service using axios
import axios from 'axios';
import type { RegisterRequest, ApiResponse, OtpResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AuthService = {
    login: async (credentials: any) => {
        // Replace with actual API call
        console.log('AuthService login:', credentials);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Simulate successful login
        return { token: 'fake-jwt-token', user: { id: '1', name: 'Test User' } };
        // Simulate failed login
        // throw new Error('Invalid credentials');
    },

    register: async (registerData: RegisterRequest): Promise<ApiResponse<OtpResponse>> => {
        try {
            const response = await axiosInstance.post('/auth/register', registerData);
            if(response.)
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Đăng ký thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    errorCode: 'REGISTRATION_FAILED',
                    errorMessage: error?.message || 'Đăng ký thất bại',
                    errors: error?.response?.data?.errors || []
                }
            };
        }
    },

    googleRegister: async (googleToken: string): Promise<ApiResponse<any>> => {
        try {
            console.log('🌐 AuthService: Google registration');
            const response = await axiosInstance.post('/auth/google/register', { token: googleToken });

            console.log('✅ AuthService: Google registration successful');
            return response.data;
        } catch (error: any) {
            console.error('❌ AuthService: Google registration error:', error);
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Đăng ký bằng Google thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    errorCode: 'GOOGLE_REGISTRATION_FAILED',
                    errorMessage: error?.message || 'Đăng ký bằng Google thất bại'
                }
            };
        }
    },

    logout: async () => {
        // Replace with actual API call or token removal logic
        console.log('AuthService logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // getCurrentUser: () => {
    //     // Logic to get user from localStorage or context
    // }
};

export default AuthService;
