module.exports = {
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)', '**/?(*.)+(spec|test).(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    'expo-sqlite': '<rootDir>/__mocks__/expo-sqlite.ts',
    'expo-constants': '<rootDir>/__mocks__/expo-constants.ts',
    '@react-native-community/netinfo': '<rootDir>/__mocks__/netinfo.ts',
    'expo-secure-store': '<rootDir>/__mocks__/expo-secure-store.ts',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.ts',
    '^firebase/(.*)$': '<rootDir>/__mocks__/firebase-$1.ts',
    'react-native-reanimated': '<rootDir>/__mocks__/react-native-reanimated.ts',
  'react-native-reanimated-carousel': '<rootDir>/__mocks__/react-native-reanimated-carousel.tsx',
    'react-native-gesture-handler': '<rootDir>/__mocks__/react-native-gesture-handler.ts',
    'react-native/Libraries/Animated/NativeAnimatedHelper': '<rootDir>/__mocks__/native-animated-helper.ts',
  },
  collectCoverageFrom: [
    'stores/**/*.ts',
    'services/**/*.ts',
    'components/**/*.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

