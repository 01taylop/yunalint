import path from 'node:path'

import { expectedResultThemes } from '@Jest/fixtures'

import { processResults } from '../process-results'

import type { LintResult, Warning } from 'stylelint'

describe('processResults', () => {

  const commonResult: LintResult = {
    deprecations: [],
    errored: false,
    ignored: false,
    invalidOptionWarnings: [],
    parseErrors: [],
    source: path.join(process.cwd(), 'file.scss'),
    warnings: [],
  }

  const commonWarning: Warning = {
    column: 1,
    line: 1,
    rule: 'test-rule',
    severity: 'error',
    text: 'Test warning',
  }

  it('returns a report when there are no results', () => {
    const report = processResults([], {})

    expect(report).toStrictEqual({
      results: {},
      summary: {
        deprecatedRules: [],
        errorCount: 0,
        fileCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Stylelint',
        warningCount: 0,
      },
    })
  })

  it('normalises file paths relative to the cwd', () => {
    const report = processResults([{
      ...commonResult,
      source: path.join(process.cwd(), 'file.scss'),
      warnings: [commonWarning],
    }], {})

    expect(report).toStrictEqual({
      results: {
        'file.scss': expect.any(Array),
      },
      summary: expect.objectContaining({
        fileCount: 1,
      }),
    })
  })

  it('returns "unknown-source" for results without a source', () => {
    const report = processResults([{
      ...commonResult,
      source: '',
      warnings: [commonWarning],
    }], {})

    expect(report).toStrictEqual({
      results: {
        'unknown-source': expect.any(Array),
      },
      summary: expect.objectContaining({
        fileCount: 1,
      }),
    })
  })

  it('does not report results for files which have no warnings', () => {
    const report = processResults([{
      ...commonResult,
      source: path.join(process.cwd(), 'file.scss'),
      warnings: [commonWarning],
    }, {
      ...commonResult,
      source: path.join(process.cwd(), 'file-2.scss'),
      warnings: [],
    }], {})

    expect(report).toStrictEqual({
      results: {
        'file.scss': expect.any(Array),
      },
      summary: expect.objectContaining({
        fileCount: 2,
      }),
    })
  })

  it('aggregates error and warning counts', () => {
    const report = processResults([{
      ...commonResult,
      source: path.join(process.cwd(), 'file.scss'),
      warnings: [
        { ...commonWarning, severity: 'error' },
        { ...commonWarning, severity: 'warning' }
      ],
    }, {
      ...commonResult,
      source: path.join(process.cwd(), 'file-2.scss'),
      warnings: [
        { ...commonWarning, severity: 'error', rule: 'fixable-rule' },
        { ...commonWarning, severity: 'error' },
      ],
    }, {
      ...commonResult,
      source: path.join(process.cwd(), 'file-3.scss'),
      warnings: [
        { ...commonWarning, severity: 'error', rule: 'fixable-rule' },
        { ...commonWarning, severity: 'warning', rule: 'fixable-rule' },
      ],
    }], {
      'fixable-rule': { fixable: true },
    })

    expect(report).toStrictEqual({
      results: {
        'file.scss': expect.any(Array),
        'file-2.scss': expect.any(Array),
        'file-3.scss': expect.any(Array),
      },
      summary: {
        deprecatedRules: [],
        errorCount: 4,
        fileCount: 3,
        fixableErrorCount: 2,
        fixableWarningCount: 1,
        linter: 'Stylelint',
        warningCount: 2,
      },
    })
  })

  it('formats warning messages', () => {
    const report = processResults([{
      ...commonResult,
      source: path.join(process.cwd(), 'file.scss'),
      warnings: [{
        column: 2,
        line: 3,
        rule: 'test-warning',
        severity: 'warning',
        text: '(test-warning) Test warning',
      }],
    }], {})

    expect(report).toStrictEqual({
      results: {
        'file.scss': [{
          ...expectedResultThemes,
          position: '3:2',
          message: 'Test warning',
          rule: 'test-warning',
          severity: '  ⚠',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 0,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Stylelint',
        warningCount: 1,
      },
    })
  })

  it('formats error messages', () => {
    const report = processResults([{
      ...commonResult,
      source: path.join(process.cwd(), 'file.scss'),
      warnings: [{
        column: 10,
        line: 8,
        rule: 'test-error',
        severity: 'error',
        text: '(test-error) Test error',
      }],
    }], {})

    expect(report).toStrictEqual({
      results: {
        'file.scss': [{
          ...expectedResultThemes,
          position: '8:10',
          message: 'Test error',
          rule: 'test-error',
          severity: '  ×',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 1,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Stylelint',
        warningCount: 0,
      },
    })
  })

  it('formats multiple messages for a single file', () => {
    const report = processResults([{
      ...commonResult,
      source: path.join(process.cwd(), 'file.scss'),
      warnings: [{
        column: 1,
        line: 10,
        rule: 'rule-1',
        severity: 'warning',
        text: 'First warning',
      }, {
        column: 1,
        line: 11,
        rule: 'rule-2',
        severity: 'warning',
        text: 'Second warning',
      }, {
        column: 1,
        line: 20,
        rule: 'rule-3',
        severity: 'error',
        text: 'First error',
      }, {
        column: 1,
        line: 21,
        rule: 'rule-4',
        severity: 'error',
        text: 'Second error',
      }],
    }], {})

    expect(report).toStrictEqual({
      results: {
        'file.scss': [{
          ...expectedResultThemes,
          position: '10:1',
          message: 'First warning',
          rule: 'rule-1',
          severity: '  ⚠',
        }, {
          ...expectedResultThemes,
          position: '11:1',
          message: 'Second warning',
          rule: 'rule-2',
          severity: '  ⚠',
        }, {
          ...expectedResultThemes,
          position: '20:1',
          message: 'First error',
          rule: 'rule-3',
          severity: '  ×',
        }, {
          ...expectedResultThemes,
          position: '21:1',
          message: 'Second error',
          rule: 'rule-4',
          severity: '  ×',
        }],
      },
      summary: {
        deprecatedRules: [],
        errorCount: 2,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Stylelint',
        warningCount: 2,
      },
    })
  })

  it('accumulates deprecated rules without duplicates', () => {
    const report = processResults([{
      ...commonResult,
      deprecations: [{
        text: 'deprecated-rule-1',
      }, {
        text: 'deprecated-rule-2',
      }],
      source: path.join(process.cwd(), 'file.scss'),
      warnings: [commonWarning],
    }, {
      ...commonResult,
      deprecations: [{
        text: 'deprecated-rule-1',
      }],
      source: path.join(process.cwd(), 'file-2.scss'),
      warnings: [commonWarning],
    }], {})

    expect(report).toStrictEqual({
      results: {
        'file.scss': expect.any(Array),
        'file-2.scss': expect.any(Array),
      },
      summary: {
        deprecatedRules: ['deprecated-rule-1', 'deprecated-rule-2'],
        errorCount: 2,
        fileCount: 2,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Stylelint',
        warningCount: 0,
      },
    })
  })

})
