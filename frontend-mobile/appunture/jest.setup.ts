import "@testing-library/jest-native/extend-expect";

// Mock native animated helper
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock expo-image-picker
jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({
      status: "granted",
      granted: true,
      canAskAgain: true,
      expires: "never",
    }),
  requestCameraPermissionsAsync: jest
    .fn()
    .mockResolvedValue({
      status: "granted",
      granted: true,
      canAskAgain: true,
      expires: "never",
    }),
  MediaTypeOptions: {
    Images: "Images",
    Videos: "Videos",
    All: "All",
  },
}));

// Mock expo-image-manipulator
jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
  },
}));

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo-file-system
jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///mock/document/",
  cacheDirectory: "file:///mock/cache/",
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  downloadAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  EncodingType: {
    UTF8: "utf8",
    Base64: "base64",
  },
}));

// Mock firebase/auth
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(() => jest.fn()),
  onIdTokenChanged: jest.fn(() => jest.fn()),
  getIdTokenResult: jest.fn(),
  getAuth: jest.fn(),
  signOut: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn().mockResolvedValue(undefined),
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  OAuthProvider: jest.fn(),
  signInWithCredential: jest.fn(),
}));

// Mock firebase service
jest.mock("./services/firebase", () => ({
  firebaseAuth: {
    currentUser: null,
  },
}));

// Mock expo-auth-session
jest.mock("expo-auth-session", () => ({
  useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
  makeRedirectUri: jest.fn(() => "mock://redirect"),
  ResponseType: {
    Code: "code",
    Token: "token",
  },
}));

// Mock expo-auth-session/providers/google
jest.mock("expo-auth-session/providers/google", () => ({
  useIdTokenAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

// Mock expo-apple-authentication
jest.mock("expo-apple-authentication", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  signInAsync: jest.fn(),
  getCredentialStateAsync: jest.fn(),
  AppleAuthenticationScope: {
    FULL_NAME: 0,
    EMAIL: 1,
  },
  AppleAuthenticationCredentialState: {
    REVOKED: 0,
    AUTHORIZED: 1,
    NOT_FOUND: 2,
    TRANSFERRED: 3,
  },
  AppleAuthenticationUserDetectionStatus: {
    UNSUPPORTED: 0,
    UNKNOWN: 1,
    LIKELY_REAL: 2,
  },
}));

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  digestStringAsync: jest.fn().mockResolvedValue("mockedhash"),
  CryptoDigestAlgorithm: {
    SHA256: "SHA-256",
  },
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => "/"),
}));

// Mock expo-notifications (usando arquivo __mocks__/expo-notifications.ts)
// Mock expo-device (usando arquivo __mocks__/expo-device.ts)
// Mock expo-constants (usando arquivo __mocks__/expo-constants.ts)
