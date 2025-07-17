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

// Helper function to properly decode Base64 with Unicode support
const base64UrlDecode = (str: string): string => {
    // Replace URL-safe characters
    str = str.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if necessary
    const paddedStr = str + "=".repeat((4 - (str.length % 4)) % 4);

    try {
        // Use TextDecoder for proper Unicode handling
        if (typeof TextDecoder !== "undefined") {
            const bytes = Uint8Array.from(atob(paddedStr), (c) =>
                c.charCodeAt(0)
            );
            return new TextDecoder("utf-8").decode(bytes);
        } else {
            // Fallback for older browsers - properly handle Unicode
            const decoded = atob(paddedStr);
            return decodeURIComponent(escape(decoded));
        }
    } catch (error) {
        // Final fallback with proper Unicode handling
        try {
            const decoded = atob(paddedStr);
            return decodeURIComponent(
                Array.prototype.map
                    .call(decoded, (c: string) => {
                        return (
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join("")
            );
        } catch (fallbackError) {
            console.error("Error in base64 decode fallback:", fallbackError);
            return atob(paddedStr); // Return raw decoded string as last resort
        }
    }
};

export const decodeJWT = (token: string): JWTPayload | null => {
    try {
        // Remove 'Bearer ' prefix if present
        const cleanToken = token.replace(/^Bearer\s+/, "");

        // Split the token into parts
        const parts = cleanToken.split(".");
        if (parts.length !== 3) {
            return null;
        }

        // Decode the payload (second part) with proper Unicode support
        const payload = parts[1];
        const decodedPayload = base64UrlDecode(payload);

        return JSON.parse(decodedPayload) as JWTPayload;
    } catch (error) {
        console.error("Error decoding JWT:", error);
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

    // Extract user data with proper Unicode handling
    const firstName = payload.firstName || "";
    const lastName = payload.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const email = payload.sub || "";

    return {
        email,
        firstName,
        lastName,
        imageUrl: payload.imageUrl,
        roles: payload.roles,
        fullName,
    };
};

export const hasRole = (token: string, role: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload || !payload.roles) return false;

    return payload.roles.some((r) => r.authority === role);
};

export const isAdmin = (token: string): boolean => {
    return hasRole(token, "ROLE_ADMIN");
};

export const isStaff = (token: string): boolean => {
    return hasRole(token, "ROLE_STAFF");
};

export const isUser = (token: string): boolean => {
    return hasRole(token, "ROLE_USER");
};

export const isAdminOrStaff = (token: string): boolean => {
    return isAdmin(token) || isStaff(token);
};

export const canAccessAdminPanel = (token: string): boolean => {
    return isAdmin(token) || isStaff(token);
};

// Token refresh mechanism functions
export const isTokenNearExpiry = (
    token: string,
    bufferMinutes: number = 5
): boolean => {
    const payload = decodeJWT(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = bufferMinutes * 60; // Convert minutes to seconds
    return payload.exp < currentTime + bufferTime;
};

export const getTokenExpiryTime = (token: string): number | null => {
    const payload = decodeJWT(token);
    return payload ? payload.exp * 1000 : null; // Convert to milliseconds
};

export const getRemainingTokenTime = (token: string): number => {
    const payload = decodeJWT(token);
    if (!payload) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime); // Return seconds remaining
};
