export const getAuth = jest.fn(() => ({}));
export const createUserWithEmailAndPassword = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const updateProfile = jest.fn();
export const onAuthStateChanged = jest.fn();
export const GoogleAuthProvider = jest.fn(() => ({}));
export const OAuthProvider = jest.fn(() => ({
  credential: jest.fn(),
}));
export const signInWithCredential = jest.fn();
