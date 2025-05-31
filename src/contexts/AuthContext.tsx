import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
    user: any | null; // Replace 'any' with your User type
    token: string | null;
    login: (userData: any, token: string) => void; // Replace 'any' with your User type
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

    const login = (userData: any, jwtToken: string) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', jwtToken);
        setUser(userData);
        setToken(jwtToken);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
    };
    
    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
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
