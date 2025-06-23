// Axios configuration for API calls
import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { getAccessToken, removeTokens } from "./storage";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

// Create public API instance (no authentication required)
export const publicAPI: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Create private API instance (authentication required)
export const privateAPI: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/admin`, // Use environment variable for base URL
    headers: {
        "Content-Type": "application/json",
        "Authorization": getAccessToken()
    },
});

// Add request interceptor to private API for authentication
privateAPI.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            // Backend already includes 'Bearer' prefix, so use token directly
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
privateAPI.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data; // Return only data part
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear storage and redirect to login
            removeTokens();
            window.location.href = "/admin/login";
        }
        return Promise.reject(error);
    }
);

// Add response interceptor to public API
publicAPI.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data; // Return only data part
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default { publicAPI, privateAPI };
