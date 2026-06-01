import { Linter } from '@Types/lint'

import type { LintCommandOptions } from '@Types/commands'
import type { FilePatterns } from '@Types/lint'

const defaultLintCommandOptions: LintCommandOptions = {
  cache: false,
  clearCache: false,
  debug: false,
  emoji: '🌺',
  eslintInclude: undefined,
  eslintUseLegacyConfig: false,
  fix: false,
  ignoreDirs: undefined,
  ignorePatterns: undefined,
  title: 'Yuna',
  watch: false,
}

const mockFilePatterns: FilePatterns = {
  includePatterns: {
    [Linter.ESLint]: ['**/*.ts'],
    [Linter.Markdownlint]: ['**/*.md'],
    [Linter.Stylelint]: ['**/*.css'],
  },
  ignorePatterns: ['**/node_modules/**'],
}

export {
  defaultLintCommandOptions,
  mockFilePatterns,
}
