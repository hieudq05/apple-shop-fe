import React, {
    createContext,
    type ReactNode,
    useEffect,
    useState,
} from "react";
import {
    clearAllStorage,
    getAccessToken,
    setUserData,
    setAccessToken,
    setRefreshToken,
} from "../utils/storage";
import { getUserFromToken, isTokenExpired } from "../utils/jwt";
import authService from "../services/authService";
import { tokenRefreshService } from "../utils/tokenRefresh";

interface User {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName: string;
    imageUrl?: string;
    roles: Array<{ authority: string }>;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isStaff: boolean;
    isUser: boolean;
    canAccessAdminPanel: boolean;
    isAuthLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        try {
            const accessToken = getAccessToken();
            if (accessToken && !isTokenExpired(accessToken)) {
                const userData = getUserFromToken(accessToken);
                if (userData) {
                    setUser(userData);
                    setToken(accessToken);
                    setUserData(userData);

                    // Initialize token refresh service
                    tokenRefreshService.init();
                } else {
                    clearAllStorage();
                }
            } else {
                clearAllStorage();
            }
        } catch (error) {
            console.error("Failed to initialize auth state:", error);
            clearAllStorage();
        } finally {
            setIsAuthLoading(false);
        }

        // Cleanup token refresh service on unmount
        return () => {
            tokenRefreshService.destroy();
        };
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        const userData = getUserFromToken(accessToken);
        if (userData) {
            // Set tokens in storage
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);

            // Set user data in state and storage
            setUser(userData);
            setToken(accessToken);
            setUserData(userData);

            // Initialize token refresh service after successful login
            tokenRefreshService.init();
        }
    };

    const logout = async () => {
        try {
            // Destroy token refresh service first
            tokenRefreshService.destroy();

            // Call logout API
            await authService.logout();
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            // Always clear local state regardless of API result
            clearAllStorage();
            setUser(null);
            setToken(null);
        }
    };

    const isAuthenticated = !!token && !!user;
    const isAdmin =
        user?.roles?.some((role) => role.authority === "ROLE_ADMIN") || false;
    const isStaff =
        user?.roles?.some((role) => role.authority === "ROLE_STAFF") || false;
    const isUser =
        user?.roles?.some((role) => role.authority === "ROLE_USER") || false;
    const canAccessAdminPanel = isAdmin || isStaff;

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated,
                isAdmin,
                isStaff,
                isUser,
                canAccessAdminPanel,
                isAuthLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
