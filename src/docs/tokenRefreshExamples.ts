// Example usage of the automatic token refresh mechanism
// This file demonstrates how the token refresh system works

/*
AUTOMATIC TOKEN REFRESH SYSTEM

1. TOKEN MONITORING:
   - TokenRefreshService automatically monitors token expiry
   - Refreshes tokens 5 minutes before expiration
   - Handles failed refresh attempts by redirecting to login

2. API INTERCEPTORS:
   - All API calls (privateAPI, userRoleAPI) automatically check token validity
   - Refresh token if needed before making requests
   - Retry failed requests after token refresh
   - Handle 401 errors by attempting token refresh

3. USAGE EXAMPLES:

// Login with automatic token refresh setup
const handleLogin = async (email: string, password: string) => {
    const response = await AuthService.login({ email, password });
    if (response.success) {
        // This will automatically set up token refresh monitoring
        login(response.data.accessToken, response.data.refreshToken);
    }
};

// API calls automatically handle token refresh
const fetchUserData = async () => {
    // No need to manually check token - interceptors handle it
    const userData = await userRoleAPI.get('/user/profile');
    return userData;
};

// Admin API calls also automatically handle token refresh
const fetchAdminData = async () => {
    // Token will be refreshed if needed before this call
    const adminData = await privateAPI.get('/dashboard/stats');
    return adminData;
};

4. FEATURES:
   - Automatic token refresh 5 minutes before expiry
   - Scheduled background refresh
   - Request retry on token expiration
   - Graceful fallback to login on refresh failure
   - Single refresh promise to prevent multiple concurrent refreshes
   - Proper cleanup on logout

5. INTEGRATION POINTS:
   - AuthContext: Initializes and destroys token refresh service
   - axios interceptors: Handle token refresh on API calls
   - TokenRefreshService: Core refresh logic and scheduling
   - AuthService: Provides refresh token API endpoint

6. ERROR HANDLING:
   - Invalid refresh token → Redirect to login
   - Network errors during refresh → Retry mechanism
   - Token decode errors → Clear tokens and redirect
   - 401 responses → Attempt refresh and retry request

This system ensures users stay logged in without interruption
while maintaining security through proper token management.
*/

export const TokenRefreshExamples = {
    // Example: Manual token check (usually not needed)
    checkTokenStatus: async () => {
        const token = getAccessToken();
        if (!token) return "No token";

        if (isTokenExpired(token)) return "Token expired";
        if (isTokenNearExpiry(token, 5)) return "Token expires soon";

        return "Token valid";
    },

    // Example: Force token refresh (usually not needed)
    forceRefresh: async () => {
        try {
            const newToken = await tokenRefreshService.checkAndRefreshToken();
            return newToken ? "Refresh successful" : "Refresh failed";
        } catch (error) {
            return "Refresh error";
        }
    },
};

// Import these utilities if needed for manual token management
import { tokenRefreshService } from "../utils/tokenRefresh";
import { getAccessToken } from "../utils/storage";
import { isTokenExpired, isTokenNearExpiry } from "../utils/jwt";
