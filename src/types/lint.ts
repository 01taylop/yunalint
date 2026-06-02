/*
 * ENUMS
 */

enum Linter {
  ESLint = 'ESLint',
  Markdownlint = 'Markdownlint',
  Stylelint = 'Stylelint',
}

enum RuleSeverity {
  ERROR = 'error',
  WARNING = 'warning',
}

/*
 * LINTING
 */

interface FilePatterns {
  includePatterns: Record<Linter, Array<string>>
  ignorePatterns: Array<string>
}

interface LintFilesOptions {
  cache: boolean
  eslintUseLegacyConfig?: boolean
  files: Array<string>
  fix: boolean
}

interface LinterInterface {
  lintFiles: (options: LintFilesOptions) => Promise<LintReport>
}

/*
 * REPORTING
 */

type ResultTheme = (value: string) => string

type FormattedResult = {
  message: string
  messageTheme: ResultTheme
  position: string
  positionTheme: ResultTheme
  rule: string
  ruleTheme: ResultTheme
  severity: string
  severityTheme: ResultTheme
}

type ReportResults = Record<string, Array<FormattedResult>>

interface ReportSummary {
  deprecatedRules: Array<string>
  errorCount: number
  fileCount: number
  fixableErrorCount: number
  fixableWarningCount: number
  linter: Linter
  warningCount: number
}

interface LintReport {
  results: ReportResults
  summary: ReportSummary
}

/*
 * EXPORTS
 */

export type {
  FilePatterns,
  FormattedResult,
  LintFilesOptions,
  LinterInterface,
  LintReport,
  ReportResults,
  ReportSummary,
}

export {
  Linter,
  RuleSeverity,
}
