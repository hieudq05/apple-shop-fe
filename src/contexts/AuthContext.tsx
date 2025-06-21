import React, {createContext, type ReactNode, useContext, useState, useEffect} from 'react';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '../utils/storage';
import { getUserInfoFromToken, isTokenExpired } from '../utils/jwt';
import AuthService from '../services/authService';
import type { User } from '../types/user';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    hasRole: (role: string) => boolean;
    isAdmin: boolean;
    isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from stored tokens
    useEffect(() => {
        const initializeAuth = () => {
            const accessToken = getAccessToken();

            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            // Check if token is expired
            if (isTokenExpired(accessToken)) {
                clearTokens();
                setIsLoading(false);
                return;
            }

            // Get user info from token
            const userInfo = getUserInfoFromToken(accessToken);
            if (userInfo) {
                const userData: User = {
                    id: 0, // Will be updated from API if needed
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    email: userInfo.email,
                    phone: '',
                    birth: '',
                    image: userInfo.imageUrl,
                    enabled: true,
                    roles: [{ authority: userInfo.role }],
                    createdAt: '',
                    updatedAt: ''
                };

                setUser(userData);
                setToken(accessToken);
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        const userInfo = getUserInfoFromToken(accessToken);
        if (userInfo) {
            const userData: User = {
                id: 0,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                email: userInfo.email,
                phone: '',
                birth: '',
                image: userInfo.imageUrl,
                enabled: true,
                roles: [{ authority: userInfo.role }],
                createdAt: '',
                updatedAt: ''
            };

            setUser(userData);
            setToken(accessToken);
        }
    };

    const logout = async () => {
        try {
            await AuthService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearTokens();
            setUser(null);
            setToken(null);
        }
    };

    const refreshAccessToken = async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await AuthService.refreshToken(refreshToken);
        if (response.success && response.data) {
            setAccessToken(response.data);
            setToken(response.data);

            // Update user info from new token
            const userInfo = getUserInfoFromToken(response.data);
            if (userInfo) {
                const userData: User = {
                    id: user?.id || 0,
                    firstName: userInfo.firstName,
                    lastName: userInfo.lastName,
                    email: userInfo.email,
                    phone: user?.phone || '',
                    birth: user?.birth || '',
                    image: userInfo.imageUrl,
                    enabled: true,
                    roles: [{ authority: userInfo.role }],
                    createdAt: user?.createdAt || '',
                    updatedAt: user?.updatedAt || ''
                };
                setUser(userData);
            }
        } else {
            throw new Error('Token refresh failed');
        }
    };

    const hasRole = (role: string): boolean => {
        return user?.roles?.some(r => r.authority === role) || false;
    };

    const isAdmin = hasRole('ROLE_ADMIN') || hasRole('ROLE_STAFF');
    const isUser = hasRole('ROLE_USER');
    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated,
            isLoading,
            login,
            logout,
            refreshAccessToken,
            hasRole,
            isAdmin,
            isUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
