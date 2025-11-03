module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    'expo-sqlite': '<rootDir>/__mocks__/expo-sqlite.ts',
    'expo-constants': '<rootDir>/__mocks__/expo-constants.ts',
    '@react-native-community/netinfo': '<rootDir>/__mocks__/netinfo.ts',
    'expo-secure-store': '<rootDir>/__mocks__/expo-secure-store.ts',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.ts',
    '^firebase/(.*)$': '<rootDir>/__mocks__/firebase-$1.ts',
  },
  collectCoverageFrom: [
    'stores/**/*.ts',
    'services/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(expo-sqlite|@react-native-community|expo-secure-store|@react-native-async-storage)/)',
  ],
};

