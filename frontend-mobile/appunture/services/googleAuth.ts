/**
 * Google Authentication Service
 *
 * Provides Google Sign-In functionality using expo-auth-session.
 * Works across iOS, Android, and Web platforms.
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { createLogger } from "../utils/logger";

const googleAuthLogger = createLogger("GoogleAuth");
const APP_SCHEME = "appunture";

// Complete browser auth session for proper cleanup
WebBrowser.maybeCompleteAuthSession();

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
 * Generate a secure random string for PKCE
 */
async function generateCodeVerifier(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  // Convert bytes to base64url encoding
  const base64 = btoa(String.fromCharCode.apply(null, Array.from(randomBytes)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate code challenge from verifier for PKCE
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return digest.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function resolveRedirectUri(): string {
  const envRedirect = process.env.EXPO_PUBLIC_EXPO_REDIRECT_URI?.trim();
  if (envRedirect) {
    // Log for debugging to ensure the configured redirect URI is used
    // (remove these logs after confirming behavior)
    // eslint-disable-next-line no-console
    console.log(
      "[GoogleAuth] Using EXPO_PUBLIC_EXPO_REDIRECT_URI from env:",
      envRedirect
    );
    return envRedirect;
  }

  // If running inside Expo Go (appOwnership === 'expo'), use the Expo auth proxy.
  // For standalone / EAS-built apps (appOwnership !== 'expo') use a native redirect URI.
  const isExpoGo = Constants?.appOwnership === "expo";

  return AuthSession.makeRedirectUri({
    // Typings don't include useProxy but runtime supports it when running in Expo Go
    useProxy: isExpoGo,
    scheme: APP_SCHEME,
  } as unknown as AuthSession.AuthSessionRedirectUriOptions);
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
  // Decide redirect URI first so we can pick the correct clientId for the flow
  const redirectUri = resolveRedirectUri();
  const useProxyRedirect = redirectUri.includes("auth.expo.io");

  const clientId = getClientId(config, useProxyRedirect);

  if (!clientId) {
    throw new Error(
      "Google Client ID não configurado. Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no arquivo .env"
    );
  }

  // Generate PKCE values
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // redirectUri already computed above

  // Debug: log clientId and redirectUri to diagnose redirect_uri_mismatch
  // eslint-disable-next-line no-console
  console.log(
    "[GoogleAuth] Google OAuth clientId:",
    clientId,
    "redirectUri:",
    redirectUri
  );

  // Build authorization request
  const authRequest = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: AuthSession.ResponseType.Code,
    codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
    codeChallenge,
    usePKCE: true,
  });

  // Prompt user to sign in
  const authResponse = await authRequest.promptAsync(discovery, {
    useProxy: useProxyRedirect,
  } as unknown as AuthSession.AuthRequestPromptOptions);

  // Debug: always log the full auth response for diagnosis
  // eslint-disable-next-line no-console
  console.log("[GoogleAuth] authResponse:", JSON.stringify(authResponse));

  if (authResponse.type === "cancel") {
    throw new Error("Login cancelado pelo usuário");
  }

  if (authResponse.type === "dismiss") {
    throw new Error("Login foi fechado");
  }

  if (authResponse.type === "error") {
    throw new Error(authResponse.error?.message || "Erro durante autenticação");
  }

  if (authResponse.type !== "success") {
    throw new Error("Autenticação falhou");
  }

  const { code } = authResponse.params;

  if (!code) {
    throw new Error("Código de autorização não recebido");
  }

  // Exchange authorization code for tokens
  let tokenResponse;
  try {
    tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId,
        code,
        redirectUri,
        extraParams: {
          code_verifier: codeVerifier,
        },
      },
      discovery
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[GoogleAuth] exchangeCodeAsync failed:", err);
    // Re-throw an informative error so UI shows something useful
    throw new Error(
      "Falha ao trocar o código de autorização pelo token. Veja logs para detalhes."
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
