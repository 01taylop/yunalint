import { generateLintReport, mockFilePatterns } from '@Jest/fixtures'
import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'
import { logSummary } from '@Utils/reporting'
import { sourceFiles } from '@Utils/source-files'

import { executeLinter } from '..'
import * as eslint from '../eslint'
import * as markdownlint from '../markdownlint'
import * as stylelint from '../stylelint'

jest.mock('@Utils/reporting')
jest.mock('@Utils/source-files')
jest.mock('../eslint')
jest.mock('../markdownlint')
jest.mock('../stylelint')

describe.each([
  [Linter.ESLint, eslint],
  [Linter.Markdownlint, markdownlint],
  [Linter.Stylelint, stylelint],
])('executeLinter for %s', (linter, linterModule) => {

  const commonOptions = {
    cache: false,
    eslintUseLegacyConfig: false,
    filePatterns: mockFilePatterns,
    fix: false,
  }

  const mockLintReport = generateLintReport(linter)

  beforeEach(() => {
    jest.mocked(sourceFiles).mockResolvedValue(['file1.ts', 'file2.ts'])
    jest.mocked(linterModule.lintFiles).mockResolvedValue(mockLintReport)
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

    expect(sourceFiles).toHaveBeenCalledWith(linter, commonOptions.filePatterns)
  })

  it('calls `lintFiles` on the correct linter with proper options', async () => {
    expect.assertions(1)

    await executeLinter(linter, commonOptions)

    expect(linterModule.lintFiles).toHaveBeenCalledWith({
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

    expect(logSummary).toHaveBeenCalledWith(mockLintReport.summary, 1767225600000)
  })

  it('returns the lint report', async () => {
    expect.assertions(1)

    const report = await executeLinter(linter, commonOptions)

    expect(report).toStrictEqual(mockLintReport)
  })

})
