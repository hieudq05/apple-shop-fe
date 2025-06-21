import { useState, useEffect } from 'react';
import { getAccessToken } from '../utils/storage';
import { getUserInfoFromToken, isTokenExpired } from '../utils/jwt';
import type { User } from '../types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    const checkAuthState = () => {
      const token = getAccessToken();

      if (!token) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
        return;
      }

      // Get user info from token
      const userInfo = getUserInfoFromToken(token);
      if (userInfo) {
        const user: User = {
          id: 0, // Will be set from stored user or API
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

        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    };

    checkAuthState();
  }, []);

  return authState;
};
