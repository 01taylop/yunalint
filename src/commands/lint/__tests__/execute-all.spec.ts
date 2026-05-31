import { executeLinter } from '@Linters/execute'
import { Linter } from '@Types/lint'
import colourLog from '@Utils/colour-log'
import { notifyResults } from '@Utils/notifier'
import { logResults, logSummaryBlock } from '@Utils/reporting'

import { executeAllLinters } from '../execute-all'

jest.mock('@Linters/execute')
jest.mock('@Utils/notifier')
jest.mock('@Utils/reporting')

describe('executeAllLinters', () => {

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
    title: 'Lint Pilot',
    watch: false,
  }

  const mockReports = [Linter.ESLint, Linter.Markdownlint, Linter.Stylelint].map(linter => ({
    results: {},
    summary: {
      deprecatedRules: [],
      errorCount: 0,
      fileCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      linter,
      warningCount: 0,
    },
  }))

  beforeEach(() => {
    jest.mocked(executeLinter)
      .mockResolvedValueOnce(mockReports[0])
      .mockResolvedValueOnce(mockReports[1])
      .mockResolvedValueOnce(mockReports[2])
    jest.mocked(notifyResults).mockReturnValue(0)
    jest.spyOn(process, 'exit').mockImplementation()
  })

  it('calls executeLinter for all three linters in parallel', async () => {
    expect.assertions(4)

    const expectedCommonArgs = {
      cache: commonOptions.cache,
      eslintUseLegacyConfig: commonOptions.eslintUseLegacyConfig,
      fix: commonOptions.fix,
      filePatterns: commonOptions.filePatterns,
    }

    await executeAllLinters(commonOptions)

    expect(executeLinter).toHaveBeenCalledTimes(3)
    expect(executeLinter).toHaveBeenNthCalledWith(1, Linter.ESLint, expectedCommonArgs)
    expect(executeLinter).toHaveBeenNthCalledWith(2, Linter.Markdownlint, expectedCommonArgs)
    expect(executeLinter).toHaveBeenNthCalledWith(3, Linter.Stylelint, expectedCommonArgs)
  })

  it('logs results for each linter report', async () => {
    expect.assertions(4)

    await executeAllLinters(commonOptions)

    expect(logResults).toHaveBeenCalledTimes(3)
    expect(logResults).toHaveBeenNthCalledWith(1, mockReports[0])
    expect(logResults).toHaveBeenNthCalledWith(2, mockReports[1])
    expect(logResults).toHaveBeenNthCalledWith(3, mockReports[2])
  })

  it('logs summary blocks for each linter report', async () => {
    expect.assertions(4)

    await executeAllLinters(commonOptions)

    expect(logSummaryBlock).toHaveBeenCalledTimes(3)
    expect(logSummaryBlock).toHaveBeenNthCalledWith(1, mockReports[0].summary)
    expect(logSummaryBlock).toHaveBeenNthCalledWith(2, mockReports[1].summary)
    expect(logSummaryBlock).toHaveBeenNthCalledWith(3, mockReports[2].summary)
  })

  it('notifies results with all reports and title', async () => {
    expect.assertions(1)

    await executeAllLinters(commonOptions)

    expect(notifyResults).toHaveBeenCalledWith(mockReports, commonOptions.title)
  })

  it('exits with code from notifyResults when not watching', async () => {
    expect.assertions(2)

    await executeAllLinters(commonOptions)

    expect(colourLog.info).not.toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(0)
  })

  it('logs "Watching for changes..." when watch is true', async () => {
    expect.assertions(2)

    await executeAllLinters({ ...commonOptions, watch: true })

    expect(colourLog.info).toHaveBeenCalledWith('Watching for changes...')
    expect(process.exit).not.toHaveBeenCalled()
  })

})
