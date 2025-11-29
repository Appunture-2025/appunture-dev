/**
 * Session Manager Service
 *
 * Manages Firebase authentication sessions including:
 * - Token refresh before expiration
 * - Session persistence across app restarts
 * - Auth state change listeners
 * - Session timeout handling
 */

import {
  onAuthStateChanged,
  onIdTokenChanged,
  User as FirebaseUser,
  getIdTokenResult,
} from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { storeToken, removeToken, getStoredToken } from "./storage";
import { AppState, AppStateStatus } from "react-native";
import { createLogger } from "../utils/logger";

const sessionLogger = createLogger("SessionManager");

// Configuration
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const SESSION_CHECK_INTERVAL_MS = 60 * 1000; // Check session every minute

/**
 * Session state
 */
interface SessionState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: FirebaseUser | null;
  tokenExpiresAt: number | null;
  lastRefresh: number | null;
}

/**
 * Session event handlers
 */
interface SessionEventHandlers {
  onAuthStateChange?: (user: FirebaseUser | null) => void;
  onTokenRefresh?: (token: string) => void;
  onSessionExpired?: () => void;
  onError?: (error: Error) => void;
}

class SessionManager {
  private state: SessionState = {
    isInitialized: false,
    isAuthenticated: false,
    user: null,
    tokenExpiresAt: null,
    lastRefresh: null,
  };

  private handlers: SessionEventHandlers = {};
  private unsubscribeAuthState: (() => void) | null = null;
  private unsubscribeTokenChange: (() => void) | null = null;
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: { remove: () => void } | null = null;

  /**
   * Initialize the session manager
   * Sets up auth state listeners and token refresh
   */
  async initialize(handlers: SessionEventHandlers = {}): Promise<void> {
    if (this.state.isInitialized) {
      return;
    }

    this.handlers = handlers;

    // Listen for auth state changes
    this.unsubscribeAuthState = onAuthStateChanged(
      firebaseAuth,
      this.handleAuthStateChange.bind(this)
    );

    // Listen for token changes
    this.unsubscribeTokenChange = onIdTokenChanged(
      firebaseAuth,
      this.handleTokenChange.bind(this)
    );

    // Start periodic token refresh check
    this.startRefreshInterval();

    // Listen for app state changes
    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange.bind(this)
    );

    this.state.isInitialized = true;
  }

  /**
   * Cleanup all listeners and intervals
   */
  cleanup(): void {
    if (this.unsubscribeAuthState) {
      this.unsubscribeAuthState();
      this.unsubscribeAuthState = null;
    }

    if (this.unsubscribeTokenChange) {
      this.unsubscribeTokenChange();
      this.unsubscribeTokenChange = null;
    }

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.state.isInitialized = false;
  }

  /**
   * Handle auth state changes
   */
  private async handleAuthStateChange(
    user: FirebaseUser | null
  ): Promise<void> {
    this.state.user = user;
    this.state.isAuthenticated = !!user;

    if (user) {
      try {
        // Get token result with expiration info
        const tokenResult = await getIdTokenResult(user);
        this.state.tokenExpiresAt = new Date(
          tokenResult.expirationTime
        ).getTime();

        // Store the token
        await storeToken(tokenResult.token);
      } catch (error) {
        sessionLogger.error("Failed to get token result:", error);
      }
    } else {
      this.state.tokenExpiresAt = null;
      await removeToken();
    }

    this.handlers.onAuthStateChange?.(user);
  }

  /**
   * Handle token changes
   */
  private async handleTokenChange(user: FirebaseUser | null): Promise<void> {
    if (user) {
      try {
        const token = await user.getIdToken();
        const tokenResult = await getIdTokenResult(user);

        this.state.tokenExpiresAt = new Date(
          tokenResult.expirationTime
        ).getTime();
        this.state.lastRefresh = Date.now();

        await storeToken(token);
        this.handlers.onTokenRefresh?.(token);
      } catch (error) {
        sessionLogger.error("Failed to handle token change:", error);
      }
    }
  }

  /**
   * Handle app state changes (foreground/background)
   */
  private async handleAppStateChange(
    nextAppState: AppStateStatus
  ): Promise<void> {
    if (nextAppState === "active") {
      // App came to foreground, check if token needs refresh
      await this.checkAndRefreshToken();
    }
  }

  /**
   * Start periodic token refresh check
   */
  private startRefreshInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(
      () => this.checkAndRefreshToken(),
      SESSION_CHECK_INTERVAL_MS
    );
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  async checkAndRefreshToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser;

    if (!user) {
      return null;
    }

    try {
      const now = Date.now();

      // Check if token is about to expire
      if (
        this.state.tokenExpiresAt &&
        this.state.tokenExpiresAt - now < TOKEN_REFRESH_THRESHOLD_MS
      ) {
        // Force token refresh
        const newToken = await user.getIdToken(true);
        const tokenResult = await getIdTokenResult(user);

        this.state.tokenExpiresAt = new Date(
          tokenResult.expirationTime
        ).getTime();
        this.state.lastRefresh = now;

        await storeToken(newToken);
        this.handlers.onTokenRefresh?.(newToken);

        return newToken;
      }

      // Token is still valid
      return await user.getIdToken();
    } catch (error: any) {
      sessionLogger.error("Token refresh failed:", error);

      // Check if session is completely expired
      if (
        error.code === "auth/user-token-expired" ||
        error.code === "auth/user-disabled" ||
        error.code === "auth/user-not-found"
      ) {
        this.handlers.onSessionExpired?.();
      } else {
        this.handlers.onError?.(error);
      }

      return null;
    }
  }

  /**
   * Get the current valid token
   * Refreshes if about to expire
   */
  async getValidToken(): Promise<string | null> {
    return this.checkAndRefreshToken();
  }

  /**
   * Get current session state
   */
  getState(): Readonly<SessionState> {
    return { ...this.state };
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return this.state.user;
  }

  /**
   * Get time until token expires (in ms)
   */
  getTimeUntilExpiry(): number | null {
    if (!this.state.tokenExpiresAt) {
      return null;
    }
    return Math.max(0, this.state.tokenExpiresAt - Date.now());
  }

  /**
   * Force a token refresh
   */
  async forceRefresh(): Promise<string | null> {
    const user = firebaseAuth.currentUser;

    if (!user) {
      return null;
    }

    try {
      const token = await user.getIdToken(true);
      const tokenResult = await getIdTokenResult(user);

      this.state.tokenExpiresAt = new Date(
        tokenResult.expirationTime
      ).getTime();
      this.state.lastRefresh = Date.now();

      await storeToken(token);
      this.handlers.onTokenRefresh?.(token);

      return token;
    } catch (error: any) {
      sessionLogger.error("Force refresh failed:", error);
      this.handlers.onError?.(error);
      return null;
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

export default sessionManager;
