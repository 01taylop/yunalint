import { Linter } from '@Types/lint'
import colourLog from '@Utils/colour-log'
import { logSummary } from '@Utils/reporting'
import { sourceFiles } from '@Utils/source-files'

import { executeLinter } from '../execute'
import linters from '../linters'

jest.mock('@Utils/reporting')
jest.mock('@Utils/source-files')
jest.mock('../linters')

describe.each([
  Linter.ESLint,
  Linter.Markdownlint,
  Linter.Stylelint,
])('executeLinter for %s', linter => {

  const commonOptions = {
    cache: false,
    eslintUseLegacyConfig: false,
    filePatterns: {
      includePatterns: {
        [Linter.ESLint]: ['**/*.ts'],
        [Linter.Markdownlint]: ['**/*.md'],
        [Linter.Stylelint]: ['**/*.css'],
      },
      ignorePatterns: ['**/node_modules/**'],
    },
    fix: false,
  }

  beforeEach(() => {
    jest.mocked(sourceFiles).mockResolvedValue(['file1.ts', 'file2.ts'])
    jest.mocked(linters[linter]).lintFiles = jest.fn().mockResolvedValue({
      summary: {
        linter,
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
      results: [],
    })
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('logs that it is running the linter', async () => {
    expect.assertions(1)

    await executeLinter(linter, commonOptions)

    expect(colourLog.info).toHaveBeenCalledWith(`Running ${linter.toLowerCase()}...`)
  })

  it('sources files for the specified linter', async () => {
    expect.assertions(1)

    await executeLinter(linter, commonOptions)

    expect(sourceFiles).toHaveBeenCalledWith(commonOptions.filePatterns, linter)
  })

  it('calls lintFiles on the correct linter with proper options', async () => {
    expect.assertions(1)

    await executeLinter(linter, commonOptions)

    expect(linters[linter].lintFiles).toHaveBeenCalledWith({
      cache: commonOptions.cache,
      eslintUseLegacyConfig: commonOptions.eslintUseLegacyConfig,
      files: ['file1.ts', 'file2.ts'],
      fix: commonOptions.fix,
    })
  })

  it('logs the summary with timing information', async () => {
    expect.assertions(1)

    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    await executeLinter(linter, commonOptions)

    expect(logSummary).toHaveBeenCalledWith({
      linter,
      errorCount: 0,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
    }, 1767225600000)
  })

  it('returns the lint report', async () => {
    expect.assertions(1)

    const expectedReport = {
      summary: {
        linter,
        errorCount: 0,
        warningCount: 0,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
      },
      results: [],
    }

    const report = await executeLinter(linter, commonOptions)

    expect(report).toStrictEqual(expectedReport)
  })

})
