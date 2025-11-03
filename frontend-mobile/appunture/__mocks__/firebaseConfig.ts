export const getFirebaseConfig = jest.fn(() => ({
  apiKey: 'test-api-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456789',
  appId: 'test-app-id',
  measurementId: 'test-measurement-id',
  databaseURL: 'https://test.firebaseio.com',
}));
