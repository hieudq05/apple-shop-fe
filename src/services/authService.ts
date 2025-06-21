// Authentication service using axios
import { publicAxios } from '../utils/axios';
import type {
  RegisterRequest,
  ApiResponse,
  OtpResponse,
  LoginRequest,
  AuthenticationResponse,
  GgTokenRequest,
  OtpValidationRequest
} from '../types/api';

// Use the centralized public axios instance (no auth interceptor for public endpoints)
const axiosInstance = publicAxios;

const AuthService = {
    login: async (credentials: LoginRequest): Promise<ApiResponse<AuthenticationResponse>> => {
        try {
            const response = await axiosInstance.post('/auth/login', credentials);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Đăng nhập thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    code: 'LOGIN_FAILED',
                    message: error?.message || 'Đăng nhập thất bại',
                    errors: error?.response?.data?.errors || []
                }
            };
        }
    },

    register: async (registerData: RegisterRequest): Promise<ApiResponse<OtpResponse>> => {
        try {
            const response = await axiosInstance.post('/auth/register', registerData);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Đăng ký thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    code: 'REGISTRATION_FAILED',
                    message: error?.message || 'Đăng ký thất bại',
                    errors: error?.response?.data?.errors || []
                }
            };
        }
    },

    verifyOtp: async (otpData: OtpValidationRequest): Promise<ApiResponse<AuthenticationResponse>> => {
        try {
            const response = await axiosInstance.post('/auth/register/verify', otpData);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Xác thực OTP thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    code: 'OTP_VERIFICATION_FAILED',
                    message: error?.message || 'Xác thực OTP thất bại',
                    errors: error?.response?.data?.errors || []
                }
            };
        }
    },

    googleAuth: async (googleToken: string): Promise<ApiResponse<AuthenticationResponse>> => {
        try {
            console.log('🌐 AuthService: Google authentication');
            const tokenRequest: GgTokenRequest = { token: googleToken };
            const response = await axiosInstance.post('/auth/google', tokenRequest);

            console.log('✅ AuthService: Google authentication successful');
            return response.data;
        } catch (error: any) {
            console.error('❌ AuthService: Google authentication error:', error);
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Đăng nhập bằng Google thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    code: 'GOOGLE_AUTH_FAILED',
                    message: error?.message || 'Đăng nhập bằng Google thất bại'
                }
            };
        }
    },

    refreshToken: async (refreshToken: string): Promise<ApiResponse<string>> => {
        try {
            const response = await axiosInstance.post('/auth/refresh-token', null, {
                params: { refreshToken: `${refreshToken}` }
            });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Làm mới token thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    code: 'REFRESH_TOKEN_FAILED',
                    message: error?.message || 'Làm mới token thất bại'
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
