import type { Config } from 'jest'

const config: Config = {
  testMatch: ['<rootDir>/integration-tests/**/*.spec.ts'],
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        rootDir: '.',
      },
      useESM: true,
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(chalk)/)',
  ],
}

export default config
