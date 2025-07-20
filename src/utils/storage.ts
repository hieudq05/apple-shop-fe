// Storage utility functions for managing tokens and user data

export const setAccessToken = (token: string): void => {
    localStorage.setItem('accessToken', token);
};

export const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

export const setRefreshToken = (token: string): void => {
    localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem('refreshToken');
};

export const removeTokens = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const setUserData = (userData: any): void => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserData = (): any | null => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
};

export const removeUserData = (): void => {
    localStorage.removeItem('userData');
};

export const clearAllStorage = (): void => {
    removeTokens();
    removeUserData();
};
