import path from 'node:path'

import stylelint from 'stylelint'

import { colourLog } from '@Utils/colour-log'

import { lintFiles } from '../lint-files'
import { resolveConfigFile } from '../resolve-config'

import type { LintResult } from 'stylelint'

jest.mock('../resolve-config')

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

  const mockLint = jest.mocked(stylelint.lint).mockImplementation(async () => ({
    cwd: '',
    errored: false,
    report: '',
    reportedDisables: [],
    results: mockLintResults,
    ruleMetadata: {},
  }))
  const mockResolveConfigFile = jest.mocked(resolveConfigFile).mockResolvedValue(undefined)

  it('lints with no configFile when `resolveConfigFile` returns undefined', async () => {
    expect.assertions(2)

    await lintFiles(commonLintOptions)

    expect(mockResolveConfigFile).toHaveBeenCalledOnceWith('index.css')
    expect(mockLint).toHaveBeenCalledOnceWith(commonStylelintOptions)
  })

  it('lints with the configFile returned by `resolveConfigFile`', async () => {
    expect.assertions(2)

    mockResolveConfigFile.mockResolvedValueOnce('./lib/stylelint.config.js')

    await lintFiles(commonLintOptions)

    expect(mockResolveConfigFile).toHaveBeenCalledOnceWith('index.css')
    expect(mockLint).toHaveBeenCalledOnceWith({
      ...commonStylelintOptions,
      configFile: './lib/stylelint.config.js',
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

  test.each([
    ['resolveConfigFile', mockResolveConfigFile],
    ['lint', mockLint],
  ])('exits the process when `%s` throws an error', async (_name, mock) => {
    expect.assertions(2)

    const error = new Error('Test error')

    mock.mockRejectedValueOnce(error)

    try {
      await lintFiles(commonLintOptions)
    } catch {
      expect(colourLog.error).toHaveBeenCalledOnceWith('An error occurred while running Stylelint', error)
      expect(process.exit).toHaveBeenCalledWith(1)
    }
  })

})
