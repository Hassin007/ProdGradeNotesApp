export default {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: ['**/__tests__/**/*.jsx'],   // only *.jsx files
  transform: {},
  moduleNameMapper: { '^axios$': 'axios' },
};