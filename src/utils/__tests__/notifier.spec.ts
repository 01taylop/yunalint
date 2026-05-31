import notifier from 'node-notifier'

import { Linter } from '@Types/lint'

import { notifyResults } from '../notifier'

import type { LintReport } from '@Types/lint'

jest.mock('node-notifier', () => ({
  notify: jest.fn(),
}))

describe('notifyResults', () => {

  const generateReport = (errorCount = 0, warningCount = 0): LintReport => ({
    results: {},
    summary: {
      deprecatedRules: [],
      errorCount,
      fileCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
      linter: Linter.ESLint,
      warningCount,
    },
  })

  it('returns an exit code of 1 if there are errors', () => {
    const exitCode = notifyResults([
      generateReport(0, 0),
      generateReport(1, 0),
      generateReport(0, 1),
    ], 'Yuna')

    expect(exitCode).toBe(1)
  })

  it('returns an exit code of 0 if there are no errors, but there are warnings', () => {
    const exitCode = notifyResults([
      generateReport(0, 0),
      generateReport(0, 0),
      generateReport(0, 1),
    ], 'Yuna')

    expect(exitCode).toBe(0)
  })

  it('returns an exit code of 0 if there are no errors or warnings', () => {
    const exitCode = notifyResults([
      generateReport(0, 0),
      generateReport(0, 0),
    ], 'Yuna')

    expect(exitCode).toBe(0)
  })

  it('notifies when there is a single error', () => {
    notifyResults([
      generateReport(0, 0),
      generateReport(1, 1),
      generateReport(0, 1),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '1 error found. Please fix it before continuing.',
      sound: 'Frog',
      title: '🚨 Yuna',
    })
  })

  it('notifies when there are multiple errors', () => {
    notifyResults([
      generateReport(0, 0),
      generateReport(5, 0),
      generateReport(2, 1),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '7 errors found. Please fix them before continuing.',
      sound: 'Frog',
      title: '🚨 Yuna',
    })
  })

  it('notifies when there is a single warning', () => {
    notifyResults([
      generateReport(0, 0),
      generateReport(0, 0),
      generateReport(0, 1),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '1 warning found. Please review before continuing.',
      sound: 'Frog',
      title: '⚠️ Yuna',
    })
  })

  it('notifies when there are multiple warnings', () => {
    notifyResults([
      generateReport(0, 0),
      generateReport(0, 7),
      generateReport(0, 2),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '9 warnings found. Please review them before continuing.',
      sound: 'Frog',
      title: '⚠️ Yuna',
    })
  })

  it('notifies when there are no errors or warnings', () => {
    notifyResults([
      generateReport(0, 0),
      generateReport(0, 0),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: 'All lint checks have passed. Your code is clean!',
      sound: 'Purr',
      title: '✅ Yuna',
    })
  })

  it('does not throw if notifier fails', () => {
    (notifier.notify as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Notification failed')
    })

    const exitCode = notifyResults([
      generateReport(0, 0),
      generateReport(0, 0),
    ], 'Yuna')

    expect(exitCode).toBe(0)
  })

})
