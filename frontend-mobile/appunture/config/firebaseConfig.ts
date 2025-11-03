import Constants from "expo-constants";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  databaseURL?: string;
};

/**
 * Resolve Firebase configuration from Expo extra or environment variables.
 * Values must be provided via app.json (expo.extra) or EXPO_PUBLIC_* vars.
 */
export const getFirebaseConfig = (): FirebaseConfig => {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifestExtra ?? {}) as
    | Record<string, unknown>
    | undefined;

  const read = (key: string, envKey: string): string => {
    const extraValue = typeof extra?.[key] === "string" ? (extra?.[key] as string) : undefined;
    const envValue = process.env[envKey];
    return extraValue || envValue || "";
  };

  const config: FirebaseConfig = {
    apiKey: read("firebaseApiKey", "EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: read("firebaseAuthDomain", "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: read("firebaseProjectId", "EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: read("firebaseStorageBucket", "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: read(
      "firebaseMessagingSenderId",
      "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    ),
    appId: read("firebaseAppId", "EXPO_PUBLIC_FIREBASE_APP_ID"),
    measurementId: read("firebaseMeasurementId", "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID") || undefined,
    databaseURL: read("firebaseDatabaseUrl", "EXPO_PUBLIC_FIREBASE_DATABASE_URL") || undefined,
  };

  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length) {
    throw new Error(
      `Firebase configuration is incomplete. Missing values for: ${missingKeys.join(", ")}. ` +
        "Provide them via expo.extra or EXPO_PUBLIC_ environment variables."
    );
  }

  return config;
};
