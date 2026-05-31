import type { Config } from 'jest'

const config: Config = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*',
    '!src/**/*.d.ts',
    '!src/(index|program).ts',
    '!src/types/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleNameMapper: {
    '^@Jest(.*)$': '<rootDir>/jest-config$1',
    '^@Linters(.*)$': '<rootDir>/src/linters$1',
    '^@Types(.*)$': '<rootDir>/src/types$1',
    '^@Utils(.*)$': '<rootDir>/src/utils$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest-config/setup.ts',
  ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(j|t)s$': ['ts-jest', {
      tsconfig: {
        rootDir: '.',
      },
      useESM: true,
    }],
  },
  transformIgnorePatterns: [
    '/lib/',
    '/node_modules/(?!(chalk)/)',
  ],
}

export default config
