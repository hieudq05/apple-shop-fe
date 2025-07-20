// Axios configuration for API calls
import axios, {
    type AxiosInstance,
    type AxiosResponse,
    type AxiosError,
} from "axios";
import { removeTokens } from "./storage";
import { tokenRefreshService } from "./tokenRefresh";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Create public API instance (no authentication required)
export const publicAPI: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const userRoleAPI: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Create private API instance (authentication required)
export const privateAPI: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/admin`, // Use environment variable for base URL
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to private API for authentication
privateAPI.interceptors.request.use(async (config) => {
    // Check and refresh token if needed
    const token = await tokenRefreshService.checkAndRefreshToken();
    if (token) {
        // Backend already includes 'Bearer' prefix, so use token directly
        config.headers.Authorization = token;
    }
    return config;
});

// Add response interceptor to handle token expiration
privateAPI.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data; // Return only data part
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosError["config"] & {
            _retry?: boolean;
        };

        // If we get 401 and haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const newToken =
                    await tokenRefreshService.checkAndRefreshToken();

                if (newToken && originalRequest) {
                    // Update the authorization header and retry the request
                    originalRequest.headers.Authorization = newToken;
                    return privateAPI(originalRequest);
                }
            } catch (refreshError) {
                console.error("Failed to refresh token on 401:", refreshError);
                removeTokens();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Add response interceptor to public API
publicAPI.interceptors.response.use((response: AxiosResponse) => {
    return response.data; // Return only data part
});

userRoleAPI.interceptors.request.use(async (config) => {
    // Check and refresh token if needed
    const token = await tokenRefreshService.checkAndRefreshToken();
    if (token) {
        // Backend already includes 'Bearer' prefix, so use token directly
        config.headers.Authorization = token;
    }
    return config;
});

userRoleAPI.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data; // Return only data part
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosError["config"] & {
            _retry?: boolean;
        };

        // If we get 401 and haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest?._retry) {
            if (originalRequest) {
                originalRequest._retry = true;
            }

            try {
                // Try to refresh the token
                const newToken =
                    await tokenRefreshService.checkAndRefreshToken();

                if (newToken && originalRequest) {
                    // Update the authorization header and retry the request
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = newToken;
                    return userRoleAPI(originalRequest);
                }
            } catch (refreshError) {
                console.error("Failed to refresh token on 401:", refreshError);
                removeTokens();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default { publicAPI, privateAPI, userRoleAPI };
