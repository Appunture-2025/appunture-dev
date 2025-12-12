import "@testing-library/jest-native/extend-expect";

// Mock DevMenu TurboModule to prevent RN from trying to access native bindings during Jest runs
jest.mock(
  "react-native/src/private/specs_DEPRECATED/modules/NativeDevMenu",
  () => ({
    __esModule: true,
    default: {
      show: jest.fn(),
      reload: jest.fn(),
      setProfilingEnabled: jest.fn(),
      setHotLoadingEnabled: jest.fn(),
    },
  })
);

jest.mock(
  "react-native/src/private/specs_DEPRECATED/modules/NativeSettingsManager",
  () => ({
    __esModule: true,
    default: {
      getConstants: () => ({ settings: {} }),
      setValues: jest.fn(),
      deleteValues: jest.fn(),
    },
  })
);

// Mock react-native Platform
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  return {
    ...RN,
    Platform: {
      OS: "ios",
      select: jest.fn((obj) => obj.ios || obj.default),
    },
  };
});

// Mock react-native-svg components used by SvgAssetRenderer
jest.mock("react-native-svg", () => {
  const React = require("react");
  const MockSvg = (props) => React.createElement("svg", props);
  const MockComponent = (name) => (props) => React.createElement(name, props);

  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Path: MockComponent("path"),
    Rect: MockComponent("rect"),
    Circle: MockComponent("circle"),
    G: MockComponent("g"),
    SvgXml: (props) => React.createElement("svg", props),
  };
});

// Mock native animated helper
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock expo-image-picker (virtual: true para módulos não instalados no ambiente de teste)
jest.mock(
  "expo-image-picker",
  () => ({
    launchImageLibraryAsync: jest.fn(),
    launchCameraAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({
      status: "granted",
      granted: true,
      canAskAgain: true,
      expires: "never",
    }),
    requestCameraPermissionsAsync: jest.fn().mockResolvedValue({
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
  }),
  { virtual: true }
);

// Mock expo-image-manipulator
jest.mock(
  "expo-image-manipulator",
  () => ({
    manipulateAsync: jest.fn(),
    SaveFormat: {
      JPEG: "jpeg",
      PNG: "png",
    },
  }),
  { virtual: true }
);

// Mock expo-secure-store
jest.mock(
  "expo-secure-store",
  () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
  }),
  { virtual: true }
);

// Mock @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock expo-file-system
jest.mock(
  "expo-file-system",
  () => ({
    documentDirectory: "file:///mock/document/",
    cacheDirectory: "file:///mock/cache/",
    getInfoAsync: jest.fn(async () => ({
      exists: false,
      isDirectory: false,
      uri: "file:///mock/cache/body-map",
    })),
    makeDirectoryAsync: jest.fn(async () => undefined),
    deleteAsync: jest.fn(async () => undefined),
    readDirectoryAsync: jest.fn(async () => []),
    downloadAsync: jest.fn(),
    readAsStringAsync: jest.fn(async () => ""),
    writeAsStringAsync: jest.fn(async () => undefined),
    EncodingType: {
      UTF8: "utf8",
      Base64: "base64",
    },
  }),
  { virtual: true }
);

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
jest.mock(
  "expo-auth-session",
  () => ({
    useAuthRequest: jest.fn(() => [null, null, jest.fn()]),
    makeRedirectUri: jest.fn(() => "mock://redirect"),
    ResponseType: {
      Code: "code",
      Token: "token",
    },
  }),
  { virtual: true }
);

// Mock expo-auth-session/providers/google
jest.mock(
  "expo-auth-session/providers/google",
  () => ({
    useIdTokenAuthRequest: jest.fn(() => [null, null, jest.fn()]),
  }),
  { virtual: true }
);

// Mock expo-crypto
jest.mock(
  "expo-crypto",
  () => ({
    digestStringAsync: jest.fn().mockResolvedValue("mockedhash"),
    CryptoDigestAlgorithm: {
      SHA256: "SHA-256",
    },
  }),
  { virtual: true }
);

// Mock expo-router
jest.mock(
  "expo-router",
  () => ({
    useRouter: jest.fn(() => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    })),
    useLocalSearchParams: jest.fn(() => ({})),
    usePathname: jest.fn(() => "/"),
  }),
  { virtual: true }
);

// Mock expo-constants (usando arquivo __mocks__/expo-constants.ts)
