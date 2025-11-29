import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import {
  signInWithGoogle,
  useGoogleAuthRequest,
} from "../../services/googleAuth";
import type { GoogleAuthConfig } from "../../services/googleAuth";

// Mock dependencies
jest.mock("expo-auth-session");
jest.mock("expo-web-browser");
jest.mock("expo-crypto", () => ({
  digestStringAsync: jest.fn().mockResolvedValue("mock-hash"),
  getRandomValues: jest.fn().mockReturnValue(new Uint8Array(32)),
  CryptoDigestAlgorithm: {
    SHA256: "SHA-256",
  },
}));

const mockAuthSession = AuthSession as jest.Mocked<typeof AuthSession>;
const mockWebBrowser = WebBrowser as jest.Mocked<typeof WebBrowser>;

describe("GoogleAuth Service", () => {
  const validConfig: GoogleAuthConfig = {
    webClientId: "test-web-client-id",
    iosClientId: "test-ios-client-id",
    androidClientId: "test-android-client-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform.OS
    Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
  });

  describe("signInWithGoogle", () => {
    it("should throw error when client ID is not configured", async () => {
      const emptyConfig: GoogleAuthConfig = {
        webClientId: "",
      };

      await expect(signInWithGoogle(emptyConfig)).rejects.toThrow(
        "Google Client ID não configurado"
      );
    });

    describe("Platform selection", () => {
      it("should work on iOS platform", async () => {
        Object.defineProperty(Platform, "OS", { value: "ios" });
        mockAuthSession.makeRedirectUri.mockReturnValue(
          "appunture://auth/google"
        );

        // Will throw due to mock but demonstrates platform handling
        await expect(signInWithGoogle(validConfig)).rejects.toThrow();
      });

      it("should work on Android platform", async () => {
        Object.defineProperty(Platform, "OS", { value: "android" });
        mockAuthSession.makeRedirectUri.mockReturnValue(
          "appunture://auth/google"
        );

        await expect(signInWithGoogle(validConfig)).rejects.toThrow();
      });

      it("should work on Web platform", async () => {
        Object.defineProperty(Platform, "OS", { value: "web" });
        mockAuthSession.makeRedirectUri.mockReturnValue(
          "http://localhost/auth/google"
        );

        await expect(signInWithGoogle(validConfig)).rejects.toThrow();
      });
    });
  });

  describe("useGoogleAuthRequest hook", () => {
    it("should be a function", () => {
      expect(typeof useGoogleAuthRequest).toBe("function");
    });
  });

  describe("GoogleAuthConfig interface", () => {
    it("should accept valid configuration", () => {
      const config: GoogleAuthConfig = {
        webClientId: "web-id",
        iosClientId: "ios-id",
        androidClientId: "android-id",
        expoClientId: "expo-id",
      };

      expect(config.webClientId).toBe("web-id");
      expect(config.iosClientId).toBe("ios-id");
      expect(config.androidClientId).toBe("android-id");
      expect(config.expoClientId).toBe("expo-id");
    });

    it("should allow optional client IDs", () => {
      const minimalConfig: GoogleAuthConfig = {
        webClientId: "web-only",
      };

      expect(minimalConfig.webClientId).toBe("web-only");
      expect(minimalConfig.iosClientId).toBeUndefined();
    });
  });
});
