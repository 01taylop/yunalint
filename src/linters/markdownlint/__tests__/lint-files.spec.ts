import { lint } from 'markdownlint/promise'

import { fixableMarkdownlintError, markdownlintError } from '@Jest/fixtures'
import colourLog from '@Utils/colour-log'

import { fixFile } from '../fix-file'
import lintFiles from '../lint-files'
import { loadConfig } from '../load-config'

jest.mock('../fix-file')
jest.mock('../load-config')

describe('lintFiles', () => {

  const commonLintOptions = {
    cache: false,
    files: ['README.md'],
    fix: false,
  }

  const commonMarkdownlintOptions = {
    config: { default: true },
    files: ['README.md'],
  }

  const markdownlintMock = jest.mocked(lint).mockResolvedValue({ 'README.md': [] })
  const fixFileMock = jest.mocked(fixFile).mockImplementation(() => {})
  const loadConfigMock = jest.mocked(loadConfig).mockResolvedValue({ default: true })

  it('lints files once when `fix` is false', async () => {
    expect.assertions(3)

    await lintFiles({
      ...commonLintOptions,
      fix: false
    })

    expect(loadConfigMock).toHaveBeenCalledTimes(1)
    expect(markdownlintMock).toHaveBeenCalledTimes(1)
    expect(markdownlintMock).toHaveBeenNthCalledWith(1, commonMarkdownlintOptions)
  })

  test.each([
    ['no results are found', {}],
    ['no errors are found', { 'README.md': [] }],
    ['no errors are fixable', { 'README.md': [markdownlintError] }],
  ])('lints files once when `fix` is true but %s', async (_title, mockReturnValue) => {
    expect.assertions(3)

    markdownlintMock.mockResolvedValueOnce(mockReturnValue)

    await lintFiles({
      ...commonLintOptions,
      fix: true
    })

    expect(loadConfigMock).toHaveBeenCalledTimes(1)
    expect(markdownlintMock).toHaveBeenCalledTimes(1)
    expect(markdownlintMock).toHaveBeenNthCalledWith(1, commonMarkdownlintOptions)
  })

  it('lints files twice when `fix` is true and errors are fixable', async () => {
    expect.assertions(6)

    markdownlintMock
      .mockResolvedValueOnce({ 'CONTRIBUTING.md': [markdownlintError], 'README.md': [fixableMarkdownlintError] })
      .mockResolvedValueOnce({ 'CONTRIBUTING.md': [markdownlintError], 'README.md': [] })

    await lintFiles({
      ...commonLintOptions,
      fix: true
    })

    expect(loadConfigMock).toHaveBeenCalledTimes(1)
    expect(markdownlintMock).toHaveBeenCalledTimes(2)
    expect(markdownlintMock).toHaveBeenNthCalledWith(1, commonMarkdownlintOptions)
    expect(markdownlintMock).toHaveBeenNthCalledWith(2, commonMarkdownlintOptions)
    expect(fixFileMock).toHaveBeenCalledTimes(1)
    expect(fixFileMock).toHaveBeenCalledWith({
      errors: [fixableMarkdownlintError],
      file: 'README.md',
    })
  })

  it('returns a report when Markdownlint successfully lints', async () => {
    expect.assertions(1)

    const result = await lintFiles(commonLintOptions)

    expect(result).toStrictEqual({
      results: {},
      summary: {
        deprecatedRules: [],
        errorCount: 0,
        fileCount: 1,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('returns a report when Markdownlint successfully lints after fixing errors', async () => {
    expect.assertions(1)

    markdownlintMock
      .mockResolvedValueOnce({ 'CONTRIBUTING.md': [markdownlintError], 'README.md': [fixableMarkdownlintError] })
      .mockResolvedValueOnce({ 'CONTRIBUTING.md': [markdownlintError], 'README.md': [] })

    const result = await lintFiles({
      ...commonLintOptions,
      fix: true,
    })

    expect(result).toStrictEqual({
      results: {
        'CONTRIBUTING.md': expect.any(Array),
      },
      summary: {
        deprecatedRules: [],
        errorCount: 1,
        fileCount: 2,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        linter: 'Markdownlint',
        warningCount: 0,
      },
    })
  })

  it('exits the process when `markdownlint` throws an error', async () => {
    expect.assertions(2)

    const error = new Error('Test error')

    markdownlintMock.mockRejectedValueOnce(error)

    try {
      await lintFiles(commonLintOptions)
    } catch {
      expect(colourLog.error).toHaveBeenCalledOnceWith(`An error occurred while running Markdownlint`, error)
      expect(process.exit).toHaveBeenCalledWith(1)
    }
  })

})
