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
privateAPI.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        // Backend already includes 'Bearer' prefix, so use token directly
        config.headers.Authorization = token;
    }
    return config;
});

// Add response interceptor to handle token expiration
privateAPI.interceptors.response.use((response: AxiosResponse) => {
    return response.data; // Return only data part
});

// Add response interceptor to public API
publicAPI.interceptors.response.use((response: AxiosResponse) => {
    return response.data; // Return only data part
});

userRoleAPI.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        // Backend already includes 'Bearer' prefix, so use token directly
        config.headers.Authorization = token;
    }
    return config;
});

userRoleAPI.interceptors.response.use((response: AxiosResponse) => {
    return response.data; // Return only data part
});

export default { publicAPI, privateAPI, userRoleAPI };
