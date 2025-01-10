import { defaults } from 'jest-config';
import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
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
  }
}
