// JWT utility functions for decoding and managing JWT tokens

export interface JWTPayload {
    sub: string; // email
    roles: Array<{ authority: string }>;
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
    exp: number;
    iat: number;
}

export const decodeJWT = (token: string): JWTPayload | null => {
    try {
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace(/^Bearer\s+/, '');
        
        // Split the token into parts
        const parts = cleanToken.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode the payload (second part)
        const payload = parts[1];
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        
        return JSON.parse(decodedPayload) as JWTPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
};

export const getUserFromToken = (token: string): any | null => {
    const payload = decodeJWT(token);
    if (!payload) return null;
    
    return {
        email: payload.sub,
        firstName: payload.firstName,
        lastName: payload.lastName,
        imageUrl: payload.imageUrl,
        roles: payload.roles,
        fullName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim()
    };
};

export const hasRole = (token: string, role: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload || !payload.roles) return false;
    
    return payload.roles.some(r => r.authority === role);
};

export const isAdmin = (token: string): boolean => {
    return hasRole(token, 'ROLE_ADMIN');
};

export const isUser = (token: string): boolean => {
    return hasRole(token, 'ROLE_USER');
};
