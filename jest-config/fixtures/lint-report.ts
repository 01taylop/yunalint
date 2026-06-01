import { Linter } from '@Types/lint'

import type { FormattedResult, LintReport } from '@Types/lint'

const expectedResultThemes: Pick<FormattedResult, 'messageTheme' | 'positionTheme' | 'ruleTheme' | 'severityTheme'> = {
  messageTheme: expect.any(Function),
  positionTheme: expect.any(Function),
  ruleTheme: expect.any(Function),
  severityTheme: expect.any(Function),
}

const generateLintReport = (linter: Linter, summaryOverrides: Partial<LintReport['summary']> = {}): LintReport => ({
  results: {},
  summary: {
    deprecatedRules: [],
    errorCount: 0,
    fileCount: 0,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    linter,
    warningCount: 0,
    ...summaryOverrides,
  },
})

export {
  expectedResultThemes,
  generateLintReport,
}
