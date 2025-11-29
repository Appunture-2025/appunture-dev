/**
 * Apple Authentication Service
 *
 * Provides Apple Sign-In functionality using expo-apple-authentication.
 * Only available on iOS devices.
 */

import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { createLogger } from "../utils/logger";

const appleAuthLogger = createLogger("AppleAuth");

/**
 * Result of a successful Apple authentication
 */
export interface AppleAuthResult {
  identityToken: string;
  authorizationCode: string;
  user?: {
    email?: string | null;
    fullName?: {
      givenName?: string | null;
      familyName?: string | null;
    } | null;
  };
}

/**
 * Check if Apple Sign-In is available on this device
 * Only available on iOS 13+ and macOS
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return false;
  }

  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    appleAuthLogger.warn("Error checking Apple Sign-In availability:", error);
    return false;
  }
}

/**
 * Initiate Apple Sign-In flow
 *
 * @returns Promise with authentication result containing tokens
 * @throws Error if authentication fails, is cancelled, or not available
 */
export async function signInWithApple(): Promise<AppleAuthResult> {
  // Check platform support
  if (Platform.OS !== "ios") {
    throw new Error(
      "Apple Sign-In está disponível apenas em dispositivos iOS. " +
        "Use Google Sign-In em outras plataformas."
    );
  }

  // Check availability
  const isAvailable = await AppleAuthentication.isAvailableAsync();
  if (!isAvailable) {
    throw new Error(
      "Apple Sign-In não está disponível neste dispositivo. " +
        "Requer iOS 13 ou superior."
    );
  }

  try {
    // Request Apple Sign-In
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Validate we received the required tokens
    if (!credential.identityToken) {
      throw new Error("Token de identidade não recebido da Apple");
    }

    if (!credential.authorizationCode) {
      throw new Error("Código de autorização não recebido da Apple");
    }

    return {
      identityToken: credential.identityToken,
      authorizationCode: credential.authorizationCode,
      user: {
        email: credential.email,
        fullName: credential.fullName
          ? {
              givenName: credential.fullName.givenName,
              familyName: credential.fullName.familyName,
            }
          : null,
      },
    };
  } catch (error: any) {
    // Handle specific Apple Sign-In errors
    if (error.code === "ERR_REQUEST_CANCELED") {
      throw new Error("Login cancelado pelo usuário");
    }

    if (error.code === "ERR_REQUEST_FAILED") {
      throw new Error("Falha na solicitação de login. Tente novamente.");
    }

    if (error.code === "ERR_INVALID_RESPONSE") {
      throw new Error("Resposta inválida da Apple. Tente novamente.");
    }

    // Re-throw unknown errors
    throw error;
  }
}

/**
 * Get the credential state for a previously authenticated user
 * Useful for checking if the user's Apple ID is still valid
 *
 * @param userId - The user identifier from previous authentication
 * @returns The current credential state
 */
export async function getCredentialState(
  userId: string
): Promise<AppleAuthentication.AppleAuthenticationCredentialState> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple credential state check only available on iOS");
  }

  return await AppleAuthentication.getCredentialStateAsync(userId);
}

/**
 * Check if a user's Apple ID credentials are still valid
 *
 * @param userId - The user identifier from previous authentication
 * @returns true if credentials are authorized, false otherwise
 */
export async function isAppleCredentialValid(userId: string): Promise<boolean> {
  try {
    const state = await getCredentialState(userId);
    return (
      state ===
      AppleAuthentication.AppleAuthenticationCredentialState.AUTHORIZED
    );
  } catch (error) {
    appleAuthLogger.warn("Error checking Apple credential state:", error);
    return false;
  }
}
