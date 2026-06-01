import path from 'node:path'

import { ESLint, loadESLint } from 'eslint'

import colourLog from '@Utils/colour-log'

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

  const mockedLintResults: Array<ESLint.LintResult> = [{
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

  const lintFilesMock = jest.mocked(ESLint.prototype.lintFiles).mockImplementation(async () => mockedLintResults)
  const loadESLintMock = jest.mocked(loadESLint).mockResolvedValue(ESLint)
  const outputFixesMock = jest.mocked(ESLint.outputFixes)

  it('creates a new ESLint instance using flat config by default', async () => {
    expect.assertions(1)

    await lintFiles(commonLintOptions)

    expect(loadESLintMock).toHaveBeenCalledOnceWith({
      useFlatConfig: true,
    })
  })

  it('creates a new ESLint instance using flat config when `eslintUseLegacyConfig` is false', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      eslintUseLegacyConfig: false,
    })

    expect(loadESLintMock).toHaveBeenCalledOnceWith({
      useFlatConfig: true,
    })
  })

  it('creates a new ESLint instance using legacy config when `eslintUseLegacyConfig` is true', async () => {
    expect.assertions(1)

    await lintFiles({
      ...commonLintOptions,
      eslintUseLegacyConfig: true,
    })

    expect(loadESLintMock).toHaveBeenCalledOnceWith({
      useFlatConfig: false,
    })
  })

  it('lints files with cacheing disabled when `cache` is false', async () => {
    expect.assertions(2)

    await lintFiles({
      ...commonLintOptions,
      cache: false,
    })

    expect(ESLint).toHaveBeenCalledOnceWith(commonESLintOptions)
    expect(lintFilesMock).toHaveBeenCalledOnceWith(['index.ts'])
  })

  it('lints files with cacheing enabled when `cache` is true', async () => {
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
    expect(lintFilesMock).toHaveBeenCalledOnceWith(['index.ts'])
  })

  it('lints files with fix disabled when `fix` is false', async () => {
    expect.assertions(3)

    await lintFiles({
      ...commonLintOptions,
      fix: false
    })

    expect(ESLint).toHaveBeenCalledOnceWith(commonESLintOptions)
    expect(lintFilesMock).toHaveBeenCalledOnceWith(['index.ts'])
    expect(outputFixesMock).not.toHaveBeenCalled()
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
    expect(lintFilesMock).toHaveBeenCalledOnceWith(['index.ts'])
    expect(outputFixesMock).toHaveBeenCalledOnceWith(mockedLintResults)
  })

  it('returns a report when ESLint successfully lints', async () => {
    expect.assertions(3)

    const result = await lintFiles(commonLintOptions)

    expect(ESLint).toHaveBeenCalledOnceWith(commonESLintOptions)
    expect(lintFilesMock).toHaveBeenCalledOnceWith(['index.ts'])
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
    ['loadESLint', loadESLintMock],
    ['lintFiles', lintFilesMock],
    ['outputFixes', outputFixesMock],
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
