import {defaults} from 'jest-config';

export default {
  clearMocks: true,
  coverageProvider: "v8",
    preset: "ts-jest",
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts'],
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  }
};
