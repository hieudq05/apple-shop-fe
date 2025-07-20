// OTP service for handling OTP operations
import axios from 'axios';
import type { ApiResponse, OtpResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const otpService = {
    /**
     * Send OTP to email
     */
    sendOtp: async (email: string): Promise<ApiResponse<OtpResponse>> => {
        try {
            const response = await axiosInstance.post('/auth/otp/send', { email });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Gửi mã OTP thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    code: 'OTP_SEND_FAILED',
                    message: error?.message || 'Gửi mã OTP thất bại',
                    errors: error?.response?.data?.errors || []
                }
            };
        }
    },

    /**
     * Resend OTP to email
     */
    resendOtp: async (email: string): Promise<ApiResponse<OtpResponse>> => {
        try {
            const response = await axiosInstance.post('/auth/otp/resend', { email });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message: error?.response?.data?.message || error?.message || 'Gửi lại mã OTP thất bại',
                data: undefined,
                error: error?.response?.data?.error || {
                    code: 'OTP_RESEND_FAILED',
                    message: error?.message || 'Gửi lại mã OTP thất bại',
                    errors: error?.response?.data?.errors || []
                }
            };
        }
    }
};

export default otpService;
