import React, {createContext, type ReactNode, useContext, useState, useEffect} from 'react';
import { getAccessToken, setUserData, getUserData, clearAllStorage } from '../utils/storage';
import { getUserFromToken, isTokenExpired } from '../utils/jwt';

interface User {
    email: string;
    firstName?: string;
    lastName?: string;
    fullName: string;
    imageUrl?: string;
    roles: Array<{ authority: string }>;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isStaff: boolean;
    isUser: boolean;
    canAccessAdminPanel: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Initialize auth state from localStorage
        const accessToken = getAccessToken();
        if (accessToken && !isTokenExpired(accessToken)) {
            const userData = getUserFromToken(accessToken);
            if (userData) {
                setUser(userData);
                setToken(accessToken);
                setUserData(userData);
            } else {
                // Invalid token, clear storage
                clearAllStorage();
            }
        } else {
            // Token expired or doesn't exist, clear storage
            clearAllStorage();
        }
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        const userData = getUserFromToken(accessToken);
        if (userData) {
            setUser(userData);
            setToken(accessToken);
            setUserData(userData);
        }
    };

    const logout = () => {
        clearAllStorage();
        setUser(null);
        setToken(null);
    };

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.roles?.some(role => role.authority === 'ROLE_ADMIN') || false;
    const isStaff = user?.roles?.some(role => role.authority === 'ROLE_STAFF') || false;
    const isUser = user?.roles?.some(role => role.authority === 'ROLE_USER') || false;
    const canAccessAdminPanel = isAdmin || isStaff;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated,
            isAdmin,
            isStaff,
            isUser,
            canAccessAdminPanel
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
