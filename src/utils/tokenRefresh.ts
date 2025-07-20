// Token refresh service for automatic token management
import { isTokenExpired, isTokenNearExpiry } from "./jwt";
import {
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    removeTokens,
} from "./storage";
import AuthService from "../services/authService";

class TokenRefreshService {
    private refreshPromise: Promise<string | null> | null = null;
    private refreshTimer: NodeJS.Timeout | null = null;

    /**
     * Check if current token needs refresh and perform refresh if needed
     */
    async checkAndRefreshToken(): Promise<string | null> {
        const accessToken = getAccessToken();

        if (!accessToken) {
            return null;
        }

        // If token is expired or near expiry, refresh it
        if (isTokenExpired(accessToken) || isTokenNearExpiry(accessToken, 5)) {
            return await this.refreshTokenIfNeeded();
        }

        return accessToken;
    }

    /**
     * Refresh token if needed, ensuring only one refresh happens at a time
     */
    private async refreshTokenIfNeeded(): Promise<string | null> {
        // If already refreshing, wait for that promise
        if (this.refreshPromise) {
            return await this.refreshPromise;
        }

        // Start refresh process
        this.refreshPromise = this.performTokenRefresh();

        try {
            const result = await this.refreshPromise;
            return result;
        } finally {
            // Clear the promise when done
            this.refreshPromise = null;
        }
    }

    /**
     * Perform the actual token refresh
     */
    private async performTokenRefresh(): Promise<string | null> {
        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                this.handleRefreshFailure();
                return null;
            }

            console.log("🔄 TokenRefreshService: Refreshing access token...");
            const response = await AuthService.refreshToken();

            if (response.success && response.data) {
                const {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                } = response.data;

                // Update tokens in storage
                setAccessToken(newAccessToken);
                if (newRefreshToken) {
                    setRefreshToken(newRefreshToken);
                }

                console.log("✅ TokenRefreshService: Token refresh successful");

                // Schedule next refresh check
                this.scheduleNextRefresh(newAccessToken);

                return newAccessToken;
            } else {
                console.error(
                    "❌ TokenRefreshService: Token refresh failed:",
                    response.message
                );
                this.handleRefreshFailure();
                return null;
            }
        } catch (error) {
            console.error(
                "❌ TokenRefreshService: Token refresh error:",
                error
            );
            this.handleRefreshFailure();
            return null;
        }
    }

    /**
     * Handle refresh failure by clearing tokens and redirecting to login
     */
    private handleRefreshFailure(): void {
        removeTokens();

        // Redirect to login page if not already there
        if (window.location.pathname !== "/login") {
            console.log(
                "🔓 TokenRefreshService: Redirecting to login due to refresh failure"
            );
            window.location.href = "/login";
        }
    }

    /**
     * Schedule the next token refresh based on token expiry
     */
    private scheduleNextRefresh(token: string): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        if (isTokenExpired(token)) {
            return;
        }

        // Schedule refresh 5 minutes before expiry
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const refreshTime = expiryTime - 5 * 60 * 1000; // 5 minutes before expiry
        const timeUntilRefresh = refreshTime - currentTime;

        if (timeUntilRefresh > 0) {
            console.log(
                `⏰ TokenRefreshService: Scheduling next refresh in ${Math.round(
                    timeUntilRefresh / 1000
                )} seconds`
            );
            this.refreshTimer = setTimeout(() => {
                this.checkAndRefreshToken();
            }, timeUntilRefresh);
        }
    }

    /**
     * Initialize the token refresh service
     */
    init(): void {
        const accessToken = getAccessToken();
        if (accessToken && !isTokenExpired(accessToken)) {
            this.scheduleNextRefresh(accessToken);
        }
    }

    /**
     * Clean up timers and promises
     */
    destroy(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.refreshPromise = null;
    }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();
export default tokenRefreshService;
