import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import {
  isAppleSignInAvailable,
  signInWithApple,
  getCredentialState,
  isAppleCredentialValid,
} from "../../services/appleAuth";

// Mock dependencies
jest.mock("expo-apple-authentication");

// Mock Platform.OS properly
const originalPlatformOS = Platform.OS;

const mockAppleAuth = AppleAuthentication as jest.Mocked<
  typeof AppleAuthentication
>;

// Helper to set Platform.OS for tests
const setPlatformOS = (os: "ios" | "android" | "web") => {
  Object.defineProperty(Platform, "OS", {
    get: () => os,
    configurable: true,
  });
};

describe("AppleAuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to iOS platform
    setPlatformOS("ios");
  });

  afterAll(() => {
    // Restore original Platform.OS
    Object.defineProperty(Platform, "OS", {
      get: () => originalPlatformOS,
      configurable: true,
    });
  });

  describe("isAppleSignInAvailable", () => {
    it("should return false on non-iOS platforms", async () => {
      setPlatformOS("android");

      const result = await isAppleSignInAvailable();

      expect(result).toBe(false);
      expect(mockAppleAuth.isAvailableAsync).not.toHaveBeenCalled();
    });

    it("should return true when available on iOS", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(true);

      const result = await isAppleSignInAvailable();

      expect(result).toBe(true);
      expect(mockAppleAuth.isAvailableAsync).toHaveBeenCalled();
    });

    it("should return false when not available on iOS", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(false);

      const result = await isAppleSignInAvailable();

      expect(result).toBe(false);
    });

    it("should return false and not throw on error", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockRejectedValue(
        new Error("Check failed")
      );

      const result = await isAppleSignInAvailable();

      expect(result).toBe(false);
    });
  });

  describe("signInWithApple", () => {
    it("should throw error on non-iOS platforms", async () => {
      setPlatformOS("android");

      await expect(signInWithApple()).rejects.toThrow(
        "Apple Sign-In está disponível apenas em dispositivos iOS"
      );
    });

    it("should throw error when not available on iOS", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(false);

      await expect(signInWithApple()).rejects.toThrow(
        "Apple Sign-In não está disponível neste dispositivo"
      );
    });

    it("should request authentication with correct options", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(true);
      mockAppleAuth.signInAsync.mockResolvedValue({
        identityToken: "identity-token-123",
        authorizationCode: "auth-code-123",
        user: "user-id-123",
        email: "user@example.com",
        fullName: {
          givenName: "Test",
          familyName: "User",
          nickname: null,
          middleName: null,
          namePrefix: null,
          nameSuffix: null,
        },
        realUserStatus:
          AppleAuthentication.AppleAuthenticationUserDetectionStatus
            .LIKELY_REAL,
        state: null,
      });

      const result = await signInWithApple();

      expect(mockAppleAuth.signInAsync).toHaveBeenCalledWith({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      expect(result.identityToken).toBe("identity-token-123");
      expect(result.authorizationCode).toBe("auth-code-123");
    });

    it("should return user info when provided", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(true);
      mockAppleAuth.signInAsync.mockResolvedValue({
        identityToken: "token",
        authorizationCode: "code",
        user: "user-id",
        email: "user@example.com",
        fullName: {
          givenName: "John",
          familyName: "Doe",
          nickname: null,
          middleName: null,
          namePrefix: null,
          nameSuffix: null,
        },
        realUserStatus:
          AppleAuthentication.AppleAuthenticationUserDetectionStatus
            .LIKELY_REAL,
        state: null,
      });

      const result = await signInWithApple();

      expect(result.user?.email).toBe("user@example.com");
      expect(result.user?.fullName?.givenName).toBe("John");
      expect(result.user?.fullName?.familyName).toBe("Doe");
    });

    it("should throw error when identityToken is missing", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(true);
      mockAppleAuth.signInAsync.mockResolvedValue({
        identityToken: null,
        authorizationCode: "code",
        user: "user-id",
        email: null,
        fullName: null,
        realUserStatus:
          AppleAuthentication.AppleAuthenticationUserDetectionStatus.UNKNOWN,
        state: null,
      });

      await expect(signInWithApple()).rejects.toThrow(
        "Token de identidade não recebido da Apple"
      );
    });

    it("should handle user cancellation", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(true);

      const cancelError = new Error("User cancelled");
      (cancelError as any).code = "ERR_REQUEST_CANCELED";
      mockAppleAuth.signInAsync.mockRejectedValue(cancelError);

      await expect(signInWithApple()).rejects.toThrow(
        "Login cancelado pelo usuário"
      );
    });

    it("should handle authentication errors", async () => {
      setPlatformOS("ios");
      mockAppleAuth.isAvailableAsync.mockResolvedValue(true);

      const error = new Error("Authentication failed");
      mockAppleAuth.signInAsync.mockRejectedValue(error);

      await expect(signInWithApple()).rejects.toThrow();
    });
  });

  describe("getCredentialState", () => {
    it("should get credential state for user", async () => {
      mockAppleAuth.getCredentialStateAsync.mockResolvedValue(
        AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED
      );

      const result = await getCredentialState("user-id-123");

      expect(mockAppleAuth.getCredentialStateAsync).toHaveBeenCalledWith(
        "user-id-123"
      );
      expect(result).toBe(
        AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED
      );
    });

    it("should handle revoked credentials", async () => {
      mockAppleAuth.getCredentialStateAsync.mockResolvedValue(
        AppleAuthentication.AppleAuthenticationCredentialState.REVOKED
      );

      const result = await getCredentialState("user-id-123");

      expect(result).toBe(
        AppleAuthentication.AppleAuthenticationCredentialState.REVOKED
      );
    });

    it("should handle not found credentials", async () => {
      mockAppleAuth.getCredentialStateAsync.mockResolvedValue(
        AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND
      );

      const result = await getCredentialState("user-id-123");

      expect(result).toBe(
        AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND
      );
    });
  });

  describe("isAppleCredentialValid", () => {
    it("should return true for authorized credentials", async () => {
      mockAppleAuth.getCredentialStateAsync.mockResolvedValue(
        AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED
      );

      const result = await isAppleCredentialValid("user-id-123");

      expect(result).toBe(true);
    });

    it("should return false for revoked credentials", async () => {
      mockAppleAuth.getCredentialStateAsync.mockResolvedValue(
        AppleAuthentication.AppleAuthenticationCredentialState.REVOKED
      );

      const result = await isAppleCredentialValid("user-id-123");

      expect(result).toBe(false);
    });

    it("should return false for not found credentials", async () => {
      mockAppleAuth.getCredentialStateAsync.mockResolvedValue(
        AppleAuthentication.AppleAuthenticationCredentialState.NOT_FOUND
      );

      const result = await isAppleCredentialValid("user-id-123");

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      mockAppleAuth.getCredentialStateAsync.mockRejectedValue(
        new Error("Check failed")
      );

      const result = await isAppleCredentialValid("user-id-123");

      expect(result).toBe(false);
    });
  });
});
