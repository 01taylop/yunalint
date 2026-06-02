import chalk from 'chalk'
import { spaceLog } from 'space-log'

import { Linter, type ReportSummary } from '@Types/lint'

import { logResults, logSummary, logSummaryBlock } from '../reporting'

jest.mock('chalk', () => ({
  bgGreen: {
    black: jest.fn().mockImplementation(text => text),
  },
  bgRed: {
    black: jest.fn().mockImplementation(text => text),
  },
  bgYellow: {
    black: jest.fn().mockImplementation(text => text),
  },
  blue: jest.fn().mockImplementation(text => text),
  cyan: jest.fn().mockImplementation(text => text),
  dim: jest.fn().mockImplementation(text => text),
  magenta: jest.fn().mockImplementation(text => text),
  red: jest.fn().mockImplementation(text => text),
  underline: jest.fn().mockImplementation(text => `_${text}_`),
  yellow: jest.fn().mockImplementation(text => text),
}))

jest.mock('space-log')

describe('reporting', () => {

  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

  const commonSummary: ReportSummary = {
    deprecatedRules: [],
    errorCount: 0,
    fileCount: 1,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    linter: Linter.ESLint,
    warningCount: 0,
  }

  describe('logResults', () => {

    it('returns if there are no results', () => {
      logResults({
        results: {},
        summary: commonSummary,
      })

      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('logs the results', () => {
      const commonResult = {
        message: 'Foo',
        messageTheme: (str: string) => str,
        position: '1:1',
        positionTheme: (str: string) => str,
        rule: 'bar',
        ruleTheme: (str: string) => str,
        severity: '  ×',
        severityTheme: (str: string) => str,
      }

      logResults({
        results: {
          'CONTRIBUTING.md': [commonResult],
          'README.md': [commonResult, commonResult],
        },
        summary: commonSummary,
      })

      // Info
      expect(chalk.blue).toHaveBeenNthCalledWith(1, '\nLogging eslint results:')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, '\nLogging eslint results:')

      // File 1
      expect(chalk.underline).toHaveBeenNthCalledWith(1, 'CONTRIBUTING.md')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '\n_CONTRIBUTING.md_')
      expect(spaceLog).toHaveBeenNthCalledWith(1, {
        columnKeys: ['severity', 'position', 'message', 'rule'],
        spaceSize: 2,
      }, [commonResult])

      // File 2
      expect(chalk.underline).toHaveBeenNthCalledWith(2, 'README.md')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(3, '\n_README.md_')
      expect(spaceLog).toHaveBeenNthCalledWith(2, {
        columnKeys: ['severity', 'position', 'message', 'rule'],
        spaceSize: 2,
      }, [commonResult, commonResult])

      // Log Count
      expect(chalk.blue).toHaveBeenCalledTimes(1)
      expect(chalk.underline).toHaveBeenCalledTimes(2)
      expect(mockConsoleLog).toHaveBeenCalledTimes(3)
      expect(spaceLog).toHaveBeenCalledTimes(2)
    })

  })

  describe('logSummary', () => {

    let startTime: number

    const expectResult = () => {
      expect(chalk.cyan).toHaveBeenCalledWith('Finished eslint')
      expect(chalk.yellow).toHaveBeenCalledWith('[1 file, 1000ms]')
      expect(mockConsoleLog).toHaveBeenCalledTimes(2)
      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, '\nFinished eslint', '[1 file, 1000ms]')
    }

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(1718971200)
      startTime = new Date().getTime()
      jest.advanceTimersByTime(1000)
    })

    it('logs the finished lint message along with the file count and duration (single file)', () => {
      logSummary(commonSummary, startTime)

      expect(chalk.cyan).toHaveBeenCalledOnceWith('Finished eslint')
      expect(chalk.yellow).toHaveBeenCalledOnceWith('[1 file, 1000ms]')
      expect(mockConsoleLog).toHaveBeenCalledOnceWith('\nFinished eslint', '[1 file, 1000ms]')
    })

    it('logs the finished lint message along with the file count and duration (multiple files)', () => {
      logSummary({
        ...commonSummary,
        fileCount: 7,
      }, startTime)

      expect(chalk.cyan).toHaveBeenCalledOnceWith('Finished eslint')
      expect(chalk.yellow).toHaveBeenCalledOnceWith('[7 files, 1000ms]')
      expect(mockConsoleLog).toHaveBeenCalledOnceWith('\nFinished eslint', '[7 files, 1000ms]')
    })

    it('logs the error count in red (single error)', () => {
      logSummary({
        ...commonSummary,
        errorCount: 1,
      }, startTime)

      expectResult()
      expect(chalk.red).toHaveBeenCalledWith('  1 error')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  1 error')
    })

    it('logs the error count in red (multiple errors)', () => {
      logSummary({
        ...commonSummary,
        errorCount: 2,
      }, startTime)

      expectResult()
      expect(chalk.red).toHaveBeenCalledWith('  2 errors')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  2 errors')
    })

    it('logs the error count in red with the fixable error count in dim', () => {
      logSummary({
        ...commonSummary,
        errorCount: 3,
        fixableErrorCount: 2,
      }, startTime)

      expectResult()
      expect(chalk.red).toHaveBeenCalledWith('  3 errors')
      expect(chalk.dim).toHaveBeenCalledWith(' (2 fixable)')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  3 errors (2 fixable)')
    })

    it('logs the warning count in yellow (single warning)', () => {
      logSummary({
        ...commonSummary,
        warningCount: 1,
      }, startTime)

      expectResult()
      expect(chalk.yellow).toHaveBeenCalledWith('  1 warning')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  1 warning')
    })

    it('logs the warning count in yellow (multiple warnings)', () => {
      logSummary({
        ...commonSummary,
        warningCount: 5,
      }, startTime)

      expectResult()
      expect(chalk.yellow).toHaveBeenCalledWith('  5 warnings')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  5 warnings')
    })

    it('logs the warning count in yellow with the fixable warning count in dim', () => {
      logSummary({
        ...commonSummary,
        warningCount: 6,
        fixableWarningCount: 3,
      }, startTime)

      expectResult()
      expect(chalk.yellow).toHaveBeenCalledWith('  6 warnings')
      expect(chalk.dim).toHaveBeenCalledWith(' (3 fixable)')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  6 warnings (3 fixable)')
    })

    it('logs the deprecated rule count in magenta and the list in dim (single deprecation)', () => {
      logSummary({
        ...commonSummary,
        deprecatedRules: ['foo'],
      }, startTime)

      expectResult()
      expect(chalk.magenta).toHaveBeenCalledWith('  1 deprecation')
      expect(chalk.dim).toHaveBeenCalledWith(' [foo]')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  1 deprecation [foo]')
    })

    it('logs the deprecated rule count in magenta and the list alphabetised in dim (multiple deprecations)', () => {
      logSummary({
        ...commonSummary,
        deprecatedRules: ['foo', 'bar', 'baz'],
      }, startTime)

      expectResult()
      expect(chalk.magenta).toHaveBeenCalledWith('  3 deprecations')
      expect(chalk.dim).toHaveBeenCalledWith(' [bar, baz, foo]')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  3 deprecations [bar, baz, foo]')
    })

    it('logs everything together', () => {
      logSummary({
        ...commonSummary,
        deprecatedRules: ['foo', 'bar', 'baz'],
        errorCount: 2,
        fixableErrorCount: 1,
        warningCount: 3,
        fixableWarningCount: 2,
      }, startTime)

      expectResult()
      expect(chalk.red).toHaveBeenCalledWith('  2 errors')
      expect(chalk.dim).toHaveBeenCalledWith(' (1 fixable)')
      expect(chalk.yellow).toHaveBeenCalledWith('  3 warnings')
      expect(chalk.dim).toHaveBeenCalledWith(' (2 fixable)')
      expect(chalk.magenta).toHaveBeenCalledWith('  3 deprecations')
      expect(chalk.dim).toHaveBeenCalledWith(' [bar, baz, foo]')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '  2 errors (1 fixable)\n  3 warnings (2 fixable)\n  3 deprecations [bar, baz, foo]')
    })

  })

  describe('logSummaryBlock', () => {

    it('logs the error count in a red background', () => {
      logSummaryBlock({
        ...commonSummary,
        errorCount: 1,
      })

      expect(chalk.bgRed.black).toHaveBeenCalledOnceWith(' 1 ESLint Error ')
      expect(mockConsoleLog).toHaveBeenCalledOnceWith('\n🚨  1 ESLint Error ')
    })

    it('logs the warning count in a yellow background', () => {
      logSummaryBlock({
        ...commonSummary,
        warningCount: 1,
      })

      expect(chalk.bgYellow.black).toHaveBeenCalledOnceWith(' 1 ESLint Warning ')
      expect(mockConsoleLog).toHaveBeenCalledOnceWith('\n🚧  1 ESLint Warning ')
    })

    it('logs the both the error and warning counts if both are present', () => {
      logSummaryBlock({
        ...commonSummary,
        errorCount: 2,
        warningCount: 3,
      })

      expect(chalk.bgRed.black).toHaveBeenCalledOnceWith(' 2 ESLint Errors ')
      expect(chalk.bgYellow.black).toHaveBeenCalledOnceWith(' 3 ESLint Warnings ')
      expect(mockConsoleLog).toHaveBeenCalledTimes(2)
      expect(mockConsoleLog).toHaveBeenNthCalledWith(1, '\n🚨  2 ESLint Errors ')
      expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '\n🚧  3 ESLint Warnings ')
    })

    it('logs a success message if there are no errors or warnings', () => {
      logSummaryBlock(commonSummary)

      expect(chalk.bgGreen.black).toHaveBeenCalledOnceWith(' ESLint Success! ')
      expect(mockConsoleLog).toHaveBeenCalledOnceWith('\n✅  ESLint Success! ')
    })

  })

})
