import { AppState } from "react-native";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  getIdTokenResult,
  User as FirebaseUser,
} from "firebase/auth";
import {
  storeToken,
  removeToken,
  getStoredToken,
} from "../../services/storage";
import { firebaseAuth } from "../../services/firebase";

// Mock dependencies
jest.mock("firebase/auth");
jest.mock("../../services/firebase");
jest.mock("../../services/storage");
jest.mock("react-native", () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    currentState: "active",
  },
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<
  typeof onAuthStateChanged
>;
const mockOnIdTokenChanged = onIdTokenChanged as jest.MockedFunction<
  typeof onIdTokenChanged
>;
const mockGetIdTokenResult = getIdTokenResult as jest.MockedFunction<
  typeof getIdTokenResult
>;
const mockStoreToken = storeToken as jest.MockedFunction<typeof storeToken>;
const mockRemoveToken = removeToken as jest.MockedFunction<typeof removeToken>;
const mockGetStoredToken = getStoredToken as jest.MockedFunction<
  typeof getStoredToken
>;

describe("SessionManager", () => {
  let sessionManager: any;

  // Helper to create mock user
  const createMockUser = (overrides = {}): FirebaseUser =>
    ({
      uid: "user-123",
      email: "test@example.com",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
      ...overrides,
    } as unknown as FirebaseUser);

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup callback capture
    mockOnAuthStateChanged.mockImplementation((auth, callback: any) => {
      return jest.fn();
    });

    mockOnIdTokenChanged.mockImplementation((auth, callback: any) => {
      return jest.fn();
    });

    // Reset modules to get fresh singleton
    jest.resetModules();

    // Re-require after reset
    const module = require("../../services/sessionManager");
    sessionManager = module.sessionManager;
  });

  describe("API Surface", () => {
    it("should expose getState method", () => {
      const state = sessionManager.getState();
      expect(state).toBeDefined();
      expect(typeof state.isInitialized).toBe("boolean");
      expect(typeof state.isAuthenticated).toBe("boolean");
    });

    it("should expose isAuthenticated method", () => {
      const result = sessionManager.isAuthenticated();
      expect(typeof result).toBe("boolean");
    });

    it("should expose getCurrentUser method", () => {
      const user = sessionManager.getCurrentUser();
      expect(user).toBeNull();
    });

    it("should expose getTimeUntilExpiry method", () => {
      const result = sessionManager.getTimeUntilExpiry();
      expect(result).toBeNull();
    });

    it("should expose initialize method", () => {
      expect(typeof sessionManager.initialize).toBe("function");
    });

    it("should expose cleanup method", () => {
      expect(typeof sessionManager.cleanup).toBe("function");
    });

    it("should expose checkAndRefreshToken method", () => {
      expect(typeof sessionManager.checkAndRefreshToken).toBe("function");
    });

    it("should expose getValidToken method", () => {
      expect(typeof sessionManager.getValidToken).toBe("function");
    });

    it("should expose forceRefresh method", () => {
      expect(typeof sessionManager.forceRefresh).toBe("function");
    });
  });

  describe("Token Operations (unauthenticated)", () => {
    it("should return null for checkAndRefreshToken when not authenticated", async () => {
      (firebaseAuth as any).currentUser = null;
      await sessionManager.initialize({});

      const token = await sessionManager.checkAndRefreshToken();
      expect(token).toBeNull();
    });

    it("should return null for getValidToken when not authenticated", async () => {
      (firebaseAuth as any).currentUser = null;
      await sessionManager.initialize({});

      const token = await sessionManager.getValidToken();
      expect(token).toBeNull();
    });

    it("should return null for forceRefresh when not authenticated", async () => {
      (firebaseAuth as any).currentUser = null;
      await sessionManager.initialize({});

      const token = await sessionManager.forceRefresh();
      expect(token).toBeNull();
    });
  });

  describe("Cleanup", () => {
    it("should cleanup without errors", async () => {
      await sessionManager.initialize({});
      expect(() => sessionManager.cleanup()).not.toThrow();
    });
  });

  describe("State", () => {
    it("should return complete state object", () => {
      const state = sessionManager.getState();

      expect(state).toHaveProperty("isInitialized");
      expect(state).toHaveProperty("isAuthenticated");
      expect(state).toHaveProperty("user");
      expect(state).toHaveProperty("tokenExpiresAt");
      expect(state).toHaveProperty("lastRefresh");
    });

    it("should initially have isAuthenticated as false", () => {
      expect(sessionManager.isAuthenticated()).toBe(false);
    });

    it("should initially have getCurrentUser as null", () => {
      expect(sessionManager.getCurrentUser()).toBeNull();
    });
  });
});
