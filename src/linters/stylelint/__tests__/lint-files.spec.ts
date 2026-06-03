import path from 'node:path'

import { lint } from 'stylelint'

import { colourLog } from '@Utils/colour-log'

import { lintFiles } from '../lint-files'
import { loadConfig } from '../load-config'

import type { LintResult } from 'stylelint'

jest.mock('../load-config')

describe('lintFiles', () => {

  const commonLintOptions = {
    cache: false,
    files: ['index.css'],
    fix: false,
  }

  const commonStylelintOptions = {
    allowEmptyInput: true,
    cache: false,
    cacheLocation: undefined,
    files: ['index.css'],
    fix: false,
    quietDeprecationWarnings: true,
    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,
  }

  const mockLintResults: Array<LintResult> = [{
    deprecations: [],
    errored: false,
    ignored: false,
    invalidOptionWarnings: [],
    parseErrors: [],
    source: path.join(process.cwd(), 'index.css'),
    warnings: [],
  }]

  const mockLint = jest.mocked(lint).mockImplementation(async () => ({
    cwd: '',
    errored: false,
    report: '',
    reportedDisables: [],
    results: mockLintResults,
    ruleMetadata: {},
  }))
  const mockLoadConfig = jest.mocked(loadConfig).mockResolvedValue(undefined)

  it('lints with no config when `loadConfig` returns undefined', async () => {
    expect.assertions(2)

    await lintFiles(commonLintOptions)

    expect(mockLoadConfig).toHaveBeenCalledTimes(1)
    expect(mockLint).toHaveBeenCalledOnceWith(commonStylelintOptions)
  })

  it('lints with config returned by `loadConfig`', async () => {
    expect.assertions(2)

    const config = { rules: { 'no-empty-source': true } }

    mockLoadConfig.mockResolvedValueOnce(config)

    await lintFiles(commonLintOptions)

    expect(mockLoadConfig).toHaveBeenCalledTimes(1)
    expect(mockLint).toHaveBeenCalledOnceWith({
      ...commonStylelintOptions,
      config,
    })
  })

  it('lints files with caching disabled when `cache` is false', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      cache: false,
    })

    expect(mockLint).toHaveBeenCalledOnceWith(commonStylelintOptions)
  })

  it('lints files with caching enabled when `cache` is true', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      cache: true,
    })

    expect(mockLint).toHaveBeenCalledOnceWith({
      ...commonStylelintOptions,
      cache: true,
      cacheLocation: expect.stringContaining('.cache/lint/stylelint'),
    })
  })

  it('lints files with fix disabled when `fix` is false', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      fix: false
    })

    expect(mockLint).toHaveBeenCalledOnceWith(commonStylelintOptions)
  })

  it('lints files with fix enabled when `fix` is true', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      fix: true
    })

    expect(mockLint).toHaveBeenCalledOnceWith({
      ...commonStylelintOptions,
      fix: true,
    })
  })

  it('returns a report when Stylelint successfully lints', async () => {
    expect.assertions(2)

    const result = await lintFiles(commonLintOptions)

    expect(mockLint).toHaveBeenCalledOnceWith(commonStylelintOptions)
    expect(result).toStrictEqual({
      results: {},
      summary: {
        deprecatedRules: [],
        errorCount: 0,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Stylelint',
        warningCount: 0,
      },
    })
  })

  it('exits the process when `stylelint.lint` throws an error', async () => {
    expect.assertions(2)

    const error = new Error('Test error')

    mockLint.mockRejectedValueOnce(error)

    try {
      await lintFiles(commonLintOptions)
    } catch {
      expect(colourLog.error).toHaveBeenCalledOnceWith('An error occurred while running Stylelint', error)
      expect(process.exit).toHaveBeenCalledWith(1)
    }
  })

})
