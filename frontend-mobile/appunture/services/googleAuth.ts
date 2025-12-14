/**
 * Google Authentication Service
 *
 * Provides Google Sign-In functionality using expo-auth-session.
 * Works across iOS, Android, and Web platforms.
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { createLogger } from "../utils/logger";

const googleAuthLogger = createLogger("GoogleAuth");
const APP_SCHEME = "appunture";

// Complete browser auth session for proper cleanup
// This MUST be called at the top level of the module to handle the redirect
const authSessionResult = WebBrowser.maybeCompleteAuthSession();
console.log("[GoogleAuth] maybeCompleteAuthSession result:", authSessionResult);

// Google OAuth Discovery Document
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
  userInfoEndpoint: "https://openidconnect.googleapis.com/v1/userinfo",
};

/**
 * Configuration interface for Google OAuth
 */
export interface GoogleAuthConfig {
  webClientId: string;
  iosClientId?: string;
  androidClientId?: string;
  expoClientId?: string;
}

/**
 * Result of a successful Google authentication
 */
export interface GoogleAuthResult {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  user?: {
    email: string;
    name: string;
    picture?: string;
  };
}

/**
 * Get the appropriate client ID based on platform
 */
function getClientId(
  config: GoogleAuthConfig,
  useProxy: boolean = false
): string {
  // When using the Expo auth proxy (web redirect via auth.expo.io), the flow
  // expects a Web client ID. For native flows (no proxy) prefer platform IDs.
  if (useProxy) {
    return config.webClientId || config.expoClientId || "";
  }

  if (Platform.OS === "ios" && config.iosClientId) {
    return config.iosClientId;
  }
  if (Platform.OS === "android" && config.androidClientId) {
    return config.androidClientId;
  }
  if (config.expoClientId) {
    return config.expoClientId;
  }
  return config.webClientId;
}

/**
 * Check if running in Expo Go
 */
export function isRunningInExpoGo(): boolean {
  return Constants?.appOwnership === "expo";
}

function resolveRedirectUri(): string {
  const isExpoGo = isRunningInExpoGo();
  
  console.log("[GoogleAuth] App ownership:", Constants?.appOwnership);
  console.log("[GoogleAuth] Is Expo Go:", isExpoGo);
  
  // The Expo auth proxy (auth.expo.io) is DEPRECATED and unreliable
  // For Expo Go, we need to use a different approach or show a message
  // For development/production builds, use the native redirect URI
  
  const generatedUri = AuthSession.makeRedirectUri({
    scheme: APP_SCHEME,
    path: "auth",
  });
  
  console.log("[GoogleAuth] Generated redirect URI:", generatedUri);
  return generatedUri;
}

/**
 * Initiate Google Sign-In flow
 *
 * @param config - Google OAuth configuration with client IDs
 * @returns Promise with authentication result containing tokens
 * @throws Error if authentication fails or is cancelled
 */
export async function signInWithGoogle(
  config: GoogleAuthConfig
): Promise<GoogleAuthResult> {
  // Check if running in Expo Go - Google Auth doesn't work reliably there
  // because the auth.expo.io proxy is deprecated
  if (isRunningInExpoGo()) {
    throw new Error(
      "Login com Google não está disponível no Expo Go. " +
      "Use um Development Build ou faça login com email/senha."
    );
  }
  
  // Decide redirect URI first so we can pick the correct clientId for the flow
  const redirectUri = resolveRedirectUri();

  // For native builds, use platform-specific client IDs
  const clientId = getClientId(config, false);

  if (!clientId) {
    throw new Error(
      "Google Client ID não configurado. Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no arquivo .env"
    );
  }

  console.log("[GoogleAuth] Starting OAuth flow");
  console.log("[GoogleAuth] clientId:", clientId);
  console.log("[GoogleAuth] redirectUri:", redirectUri);

  // Build authorization request with automatic PKCE
  const authRequest = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });

  // Prompt user to sign in
  const authResponse = await authRequest.promptAsync(discovery);

  console.log("[GoogleAuth] authResponse type:", authResponse.type);
  console.log("[GoogleAuth] authResponse:", JSON.stringify(authResponse, null, 2));

  if (authResponse.type === "cancel") {
    throw new Error("Login cancelado pelo usuário");
  }

  if (authResponse.type === "dismiss") {
    throw new Error("Login foi fechado");
  }

  if (authResponse.type === "error") {
    console.error("[GoogleAuth] Auth error:", authResponse.error);
    throw new Error(authResponse.error?.message || "Erro durante autenticação");
  }

  if (authResponse.type !== "success") {
    console.log("[GoogleAuth] Unexpected response type:", authResponse.type);
    throw new Error("Autenticação falhou");
  }

  const { code, error, error_description } = authResponse.params;

  // Check for OAuth errors in params
  if (error) {
    console.error("[GoogleAuth] OAuth error:", error, error_description);
    throw new Error(error_description || error || "Erro OAuth do Google");
  }

  if (!code) {
    console.error("[GoogleAuth] No code in params:", authResponse.params);
    throw new Error("Código de autorização não recebido");
  }

  console.log("[GoogleAuth] Got authorization code, exchanging for tokens...");

  // Exchange authorization code for tokens using the request's codeVerifier
  let tokenResponse;
  try {
    tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId,
        code,
        redirectUri,
        extraParams: authRequest.codeVerifier 
          ? { code_verifier: authRequest.codeVerifier }
          : undefined,
      },
      discovery
    );
    console.log("[GoogleAuth] Token exchange successful");
  } catch (err: any) {
    console.error("[GoogleAuth] exchangeCodeAsync failed:", err);
    // Re-throw an informative error so UI shows something useful
    throw new Error(
      err?.message || "Falha ao trocar o código de autorização pelo token."
    );
  }

  if (!tokenResponse.idToken) {
    throw new Error("ID Token não recebido do Google");
  }

  // Optionally fetch user info
  let user: GoogleAuthResult["user"];
  if (tokenResponse.accessToken) {
    try {
      const userInfoResponse = await fetch(discovery.userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });

      if (userInfoResponse.ok) {
        const userInfo = await userInfoResponse.json();
        user = {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        };
      }
    } catch (error) {
      // User info fetch is optional, continue without it
      googleAuthLogger.warn("Failed to fetch user info:", error);
    }
  }

  return {
    idToken: tokenResponse.idToken,
    accessToken: tokenResponse.accessToken ?? "",
    refreshToken: tokenResponse.refreshToken,
    user,
  };
}

/**
 * Create an auth request hook for use in components
 * This is useful if you want to show a loading state while the request is being prepared
 */
export function useGoogleAuthRequest(config: GoogleAuthConfig) {
  const redirectUri = resolveRedirectUri();
  const useProxyRedirect = redirectUri.includes("auth.expo.io");
  const clientId = getClientId(config, useProxyRedirect);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  const promptWithProxy = promptAsync
    ? (options?: AuthSession.AuthRequestPromptOptions) =>
        promptAsync({ useProxy: useProxyRedirect, ...options } as unknown as
          | AuthSession.AuthRequestPromptOptions
          | undefined)
    : null;

  return { request, response, promptAsync: promptWithProxy };
}
