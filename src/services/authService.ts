// Authentication service using axios
import axios from "axios";
import type { RegisterRequest, ApiResponse, OtpResponse } from "../types/api";
import { getRefreshToken, getAccessToken } from "../utils/storage";
import { toast } from "sonner";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

const AuthService = {
    login: async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Simulate successful login
        return {
            token: "fake-jwt-token",
            user: { id: "1", name: "Test User" },
        };
        // Simulate failed login
        // throw new Error('Invalid credentials');
    },

    register: async (
        registerData: RegisterRequest
    ): Promise<ApiResponse<OtpResponse>> => {
        try {
            const response = await axiosInstance.post(
                "/auth/register",
                registerData
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Đăng ký thất bại",
                data: undefined,
            };
        }
    },

    googleRegister: async (googleToken: string): Promise<ApiResponse<any>> => {
        try {
            console.log("🌐 AuthService: Google registration");
            const response = await axiosInstance.post("/auth/google/register", {
                token: googleToken,
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Đăng ký bằng Google thất bại",
                data: undefined,
            };
        }
    },

    logout: async () => {
        try {
            // Get tokens from localStorage
            const refreshToken = getRefreshToken();
            const accessToken = getAccessToken();

            // Call logout API endpoint with refreshToken as request parameter and accessToken in header
            await axiosInstance.post(
                "/auth/logout",
                { refreshToken: refreshToken },
                {
                    headers: {
                        Authorization: accessToken,
                    },
                }
            );
        } catch {
            toast.error("Logout failed");
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },

    refreshToken: async (): Promise<
        ApiResponse<{ accessToken: string; refreshToken: string }>
    > => {
        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                throw new Error("No refresh token available");
            }

            const response = await axiosInstance.post("/auth/refresh-token", {
                refreshToken: refreshToken,
            });

            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Token refresh failed",
                data: undefined,
            };
        }
    },

    forgotPassword: async (
        email: string
    ): Promise<ApiResponse<{ message: string }>> => {
        try {
            const response = await axiosInstance.post(
                `/auth/forgot-password?email=${email}`
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Gửi email khôi phục mật khẩu thất bại",
                data: undefined,
            };
        }
    },

    resetPassword: async (
        token: string,
        newPassword: string,
        confirmNewPassword: string
    ): Promise<ApiResponse<{ message: string }>> => {
        try {
            const response = await axiosInstance.post(
                `/auth/reset-password?token=${token}&password=${newPassword}&confirmPassword=${confirmNewPassword}`
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                message:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Đặt lại mật khẩu thất bại",
                data: undefined,
            };
        }
    },
};

export default AuthService;
