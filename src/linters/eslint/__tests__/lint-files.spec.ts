import path from 'node:path'

import { ESLint, loadESLint } from 'eslint'

import { colourLog } from '@Utils/colour-log'

import { lintFiles } from '../lint-files'

jest.mock('eslint')

describe('lintFiles', () => {

  const commonLintOptions = {
    cache: false,
    eslintUseLegacyConfig: undefined,
    files: ['index.ts'],
    fix: false,
  }

  const commonESLintOptions = {
    cache: false,
    cacheLocation: undefined,
    fix: false,
  }

  const mockLintResults: Array<ESLint.LintResult> = [{
    errorCount: 0,
    fatalErrorCount: 0,
    filePath: path.join(process.cwd(), 'index.ts'),
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    messages: [],
    suppressedMessages: [],
    usedDeprecatedRules: [],
    warningCount: 0,
  }]

  const mockESLintFiles = jest.mocked(ESLint.prototype.lintFiles).mockImplementation(async () => mockLintResults)
  const mockLoadESLint = jest.mocked(loadESLint).mockResolvedValue(ESLint)
  const mockOutputFixes = jest.mocked(ESLint.outputFixes)

  it('creates a new ESLint instance using flat config by default', async () => {
    expect.assertions(1)

    await lintFiles(commonLintOptions)

    expect(mockLoadESLint).toHaveBeenCalledOnceWith({
      useFlatConfig: true,
    })
  })

  it('creates a new ESLint instance using flat config when `eslintUseLegacyConfig` is false', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      eslintUseLegacyConfig: false,
    })

    expect(mockLoadESLint).toHaveBeenCalledOnceWith({
      useFlatConfig: true,
    })
  })

  it('creates a new ESLint instance using legacy config when `eslintUseLegacyConfig` is true', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      eslintUseLegacyConfig: true,
    })

    expect(mockLoadESLint).toHaveBeenCalledOnceWith({
      useFlatConfig: false,
    })
  })

  it('lints files with caching disabled when `cache` is false', async () => {
    expect.assertions(2)

    await lintFiles({
      ...commonLintOptions,
      cache: false,
    })

    expect(ESLint).toHaveBeenCalledOnceWith(commonESLintOptions)
    expect(mockESLintFiles).toHaveBeenCalledOnceWith(['index.ts'])
  })

  it('lints files with caching enabled when `cache` is true', async () => {
    expect.assertions(2)

    await lintFiles({
      ...commonLintOptions,
      cache: true,
    })

    expect(ESLint).toHaveBeenCalledOnceWith({
      ...commonESLintOptions,
      cache: true,
      cacheLocation: expect.stringContaining('.cache/lint/eslint'),
    })
    expect(mockESLintFiles).toHaveBeenCalledOnceWith(['index.ts'])
  })

  it('lints files with fix disabled when `fix` is false', async () => {
    expect.assertions(3)

    await lintFiles({
      ...commonLintOptions,
      fix: false
    })

    expect(ESLint).toHaveBeenCalledOnceWith(commonESLintOptions)
    expect(mockESLintFiles).toHaveBeenCalledOnceWith(['index.ts'])
    expect(mockOutputFixes).not.toHaveBeenCalled()
  })

  it('lints files with fix enabled when `fix` is true', async () => {
    expect.assertions(3)

    await lintFiles({
      ...commonLintOptions,
      fix: true
    })

    expect(ESLint).toHaveBeenCalledOnceWith({
      ...commonESLintOptions,
      fix: true,
    })
    expect(mockESLintFiles).toHaveBeenCalledOnceWith(['index.ts'])
    expect(mockOutputFixes).toHaveBeenCalledOnceWith(mockLintResults)
  })

  it('returns a report when ESLint successfully lints', async () => {
    expect.assertions(3)

    const result = await lintFiles(commonLintOptions)

    expect(ESLint).toHaveBeenCalledOnceWith(commonESLintOptions)
    expect(mockESLintFiles).toHaveBeenCalledOnceWith(['index.ts'])
    expect(result).toStrictEqual({
      results: {},
      summary: {
        deprecatedRules: [],
        errorCount: 0,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'ESLint',
        warningCount: 0,
      },
    })
  })

  test.each([
    ['loadESLint', mockLoadESLint],
    ['lintFiles', mockESLintFiles],
    ['outputFixes', mockOutputFixes],
  ])('exits the process when `%s` throws an error', async (_name, mock) => {
    expect.assertions(2)

    const error = new Error('Test error')

    mock.mockRejectedValueOnce(error)

    try {
      await lintFiles({
        ...commonLintOptions,
        fix: true,
      })
    } catch {
      expect(colourLog.error).toHaveBeenCalledOnceWith(`An error occurred while running ESLint`, error)
      expect(process.exit).toHaveBeenCalledWith(1)
    }
  })

})
