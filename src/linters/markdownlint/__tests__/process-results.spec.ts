import { expectedResultThemes, fixableMarkdownlintError, markdownlintError } from '@Jest/fixtures'

import { processResults } from '../process-results'

import type { LintResults } from 'markdownlint'
import type { FormattedResult } from '@Types/lint'

describe('processResults', () => {

  const commonFormattedResult: FormattedResult = {
    ...expectedResultThemes,
    position: '1:1',
    message: 'test-rule-description: test-error-detail',
    rule: 'test-rule-name',
    severity: '  ×',
  }

  it('returns a report when there are no results', () => {
    const report = processResults({})

    expect(report).toStrictEqual({
      results: {},
      summary: {
        deprecatedRules: [],
        errorCount: 0,
        fileCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('does not report results for files which have no errors', () => {
    const report = processResults({
      'file.md': [markdownlintError],
      'file-2.md': [],
    })

    expect(report).toStrictEqual({
      results: {
        'file.md': expect.any(Array),
      },
      summary: expect.objectContaining({
        fileCount: 2,
      }),
    })
  })

  it('aggregates error and warning counts', () => {
    const report = processResults({
      'file.md': [markdownlintError, fixableMarkdownlintError, { ...fixableMarkdownlintError, severity: 'warning' }],
      'file-2.md': [markdownlintError, { ...markdownlintError, severity: 'warning' }],
      'file-3.md': [],
    })

    expect(report).toStrictEqual({
      results: {
        'file.md': expect.any(Array),
        'file-2.md': expect.any(Array),
      },
      summary: {
        deprecatedRules: [],
        errorCount: 3,
        fileCount: 3,
        fixableErrorCount: 1,
        fixableWarningCount: 1,
        linter: 'Markdownlint',
        warningCount: 2,
      },
    })
  })

  it('formats warning messages', () => {
    const report = processResults({
      'file.md': [{
        ...markdownlintError,
        severity: 'warning',
      }],
    })

    expect(report).toStrictEqual({
      results: {
        'file.md': [{
          ...commonFormattedResult,
          severity: '  ⚠',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 0,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 1,
      },
    })
  })

  it('formats error messages', () => {
    const report = processResults({
      'file.md': [markdownlintError],
    })

    expect(report).toStrictEqual({
      results: {
        'file.md': [commonFormattedResult],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 1,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('formats error messages with no error range', () => {
    const report = processResults({
      'file.md': [{
        ...markdownlintError,
        errorRange: [],
      }],
    })

    expect(report).toStrictEqual({
      results: {
        'file.md': [{
          ...commonFormattedResult,
          position: '1',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 1,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('formats error messages with no error detail', () => {
    const report = processResults({
      'file.md': [{
        ...markdownlintError,
        errorDetail: '',
      }],
    })

    expect(report).toStrictEqual({
      results: {
        'file.md': [{
          ...commonFormattedResult,
          message: 'test-rule-description',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 1,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('formats error messages with missing rule names', () => {
    const report = processResults({
      'file.md': [{
        ...markdownlintError,
        ruleNames: ['MD000'],
      }],
    })

    expect(report).toStrictEqual({
      results: {
        'file.md': [{
          ...commonFormattedResult,
          rule: 'MD000',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 1,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('sorts results by lineNumber and then by rule name', () => {
    const lintResults: LintResults = {
      'file.md': [{
        ...markdownlintError,
        lineNumber: 3,
        ruleNames: ['MD000', 'test-rule-d'],
      }, {
        ...markdownlintError,
        lineNumber: 5,
        ruleNames: ['MD000', 'test-rule-e'],
      }, {
        ...markdownlintError,
        lineNumber: 3,
        ruleNames: ['MD000', 'test-rule-c'],
      }, {
        ...markdownlintError,
        lineNumber: 1,
        ruleNames: ['MD000', 'test-rule-a'],
      }, {
        ...markdownlintError,
        lineNumber: 3,
        ruleNames: ['MD000', 'test-rule-b'],
      }],
    }

    const report = processResults(lintResults)

    expect(report).toStrictEqual({
      results: {
        'file.md': [{
          ...commonFormattedResult,
          position: '1:1',
          rule: 'test-rule-a',
        }, {
          ...commonFormattedResult,
          position: '3:1',
          rule: 'test-rule-b',
        }, {
          ...commonFormattedResult,
          position: '3:1',
          rule: 'test-rule-c',
        }, {
          ...commonFormattedResult,
          position: '3:1',
          rule: 'test-rule-d',
        }, {
          ...commonFormattedResult,
          position: '5:1',
          rule: 'test-rule-e',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 5,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('sorts results by lineNumber and then by rule name when rules only have one name', () => {
    const lintResults: LintResults = {
      'file.md': [{
        ...markdownlintError,
        lineNumber: 1,
        ruleNames: ['MD002'],
      }, {
        ...markdownlintError,
        lineNumber: 1,
        ruleNames: ['MD001'],
      }],
    }

    const report = processResults(lintResults)

    expect(report).toStrictEqual({
      results: {
        'file.md': [{
          ...commonFormattedResult,
          rule: 'MD001',
        }, {
          ...commonFormattedResult,
          rule: 'MD002',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 2,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

})
