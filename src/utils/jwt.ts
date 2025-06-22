export interface JWTPayload {
  sub: string; // email
  roles: Array<{ authority: string }>;
  iat: number;
  exp: number;
  [key: string]: any;
}

export interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  roles: Array<{ authority: string }>;
  role: string; // For backward compatibility
  isAdmin: boolean;
  isStaff: boolean;
  isUser: boolean;
}

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');
    
    // Split token into parts
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }

    // Decode payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    // Convert exp from seconds to milliseconds and compare with current time
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get user info from JWT token
 */
export const getUserInfoFromToken = (token: string): UserInfo | null => {
  try {
    const payload = decodeToken(token);
    if (!payload) {
      return null;
    }

    // Extract roles
    const roles = payload.roles || [];
    const roleStrings = roles.map(role => role.authority);

    // Check user types
    const isAdmin = roleStrings.includes('ROLE_ADMIN');
    const isStaff = roleStrings.includes('ROLE_STAFF');
    const isUser = roleStrings.includes('ROLE_USER');

    return {
      email: payload.sub,
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      imageUrl: payload.imageUrl || '',
      roles,
      role: roleStrings[0] || 'ROLE_USER', // For backward compatibility
      isAdmin,
      isStaff,
      isUser,
    };
  } catch (error) {
    console.error('Error extracting user info from token:', error);
    return null;
  }
};

/**
 * Check if user has specific role
 */
export const hasRole = (token: string, role: string): boolean => {
  try {
    const userInfo = getUserInfoFromToken(token);
    return userInfo?.roles.some(r => r.authority === role) || false;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = (token: string): boolean => {
  return hasRole(token, 'ROLE_ADMIN');
};

/**
 * Check if user is staff
 */
export const isStaff = (token: string): boolean => {
  return hasRole(token, 'ROLE_STAFF');
};

/**
 * Check if user is regular user
 */
export const isUser = (token: string): boolean => {
  return hasRole(token, 'ROLE_USER');
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
      return null;
    }

    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Get time until token expires (in milliseconds)
 */
export const getTimeUntilExpiration = (token: string): number => {
  try {
    const expirationDate = getTokenExpiration(token);
    if (!expirationDate) {
      return 0;
    }

    const currentTime = Date.now();
    const expirationTime = expirationDate.getTime();
    
    return Math.max(0, expirationTime - currentTime);
  } catch (error) {
    console.error('Error calculating time until expiration:', error);
    return 0;
  }
};

/**
 * Check if token will expire soon (within specified minutes)
 */
export const willExpireSoon = (token: string, minutesThreshold = 5): boolean => {
  try {
    const timeUntilExpiration = getTimeUntilExpiration(token);
    const thresholdMs = minutesThreshold * 60 * 1000;

    return timeUntilExpiration <= thresholdMs;
  } catch (error) {
    console.error('Error checking if token will expire soon:', error);
    return true;
  }
};

// Alias for backward compatibility
export const isTokenExpiringSoon = willExpireSoon;

// Alias for backward compatibility
export const decodeJWT = decodeToken;
