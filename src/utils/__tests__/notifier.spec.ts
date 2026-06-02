import notifier from 'node-notifier'

import { generateLintReport } from '@Jest/fixtures'
import { Linter } from '@Types/lint'

import { notifyResults } from '../notifier'

jest.mock('node-notifier', () => ({
  notify: jest.fn(),
}))

describe('notifyResults', () => {

  it('returns an exit code of 1 if there are errors', () => {
    const exitCode = notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint, { errorCount: 1 }),
      generateLintReport(Linter.Stylelint, { warningCount: 1 }),
    ], 'Yuna')

    expect(exitCode).toBe(1)
  })

  it('returns an exit code of 0 if there are no errors, but there are warnings', () => {
    const exitCode = notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint),
      generateLintReport(Linter.Stylelint, { warningCount: 1 }),
    ], 'Yuna')

    expect(exitCode).toBe(0)
  })

  it('returns an exit code of 0 if there are no errors or warnings', () => {
    const exitCode = notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint),
      generateLintReport(Linter.Stylelint),
    ], 'Yuna')

    expect(exitCode).toBe(0)
  })

  it('notifies when there is a single error', () => {
    notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint, { errorCount: 1, warningCount: 1 }),
      generateLintReport(Linter.Stylelint, { warningCount: 1 }),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '1 error found. Please fix it before continuing.',
      sound: 'Frog',
      title: '🚨 Yuna',
    })
  })

  it('notifies when there are multiple errors', () => {
    notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint, { errorCount: 5 }),
      generateLintReport(Linter.Stylelint, { errorCount: 2, warningCount: 1 }),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '7 errors found. Please fix them before continuing.',
      sound: 'Frog',
      title: '🚨 Yuna',
    })
  })

  it('notifies when there is a single warning', () => {
    notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint),
      generateLintReport(Linter.Stylelint, { warningCount: 1 }),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '1 warning found. Please review before continuing.',
      sound: 'Frog',
      title: '⚠️ Yuna',
    })
  })

  it('notifies when there are multiple warnings', () => {
    notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint, { warningCount: 7 }),
      generateLintReport(Linter.Stylelint, { warningCount: 2 }),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: '9 warnings found. Please review them before continuing.',
      sound: 'Frog',
      title: '⚠️ Yuna',
    })
  })

  it('notifies when there are no errors or warnings', () => {
    notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint),
      generateLintReport(Linter.Stylelint),
    ], 'Yuna')

    expect(notifier.notify).toHaveBeenCalledOnceWith({
      message: 'All lint checks have passed. Your code is clean!',
      sound: 'Purr',
      title: '✅ Yuna',
    })
  })

  it('does not throw if notifier fails', () => {
    jest.mocked(notifier.notify).mockImplementationOnce(() => {
      throw new Error('Notification failed')
    })

    const exitCode = notifyResults([
      generateLintReport(Linter.ESLint),
      generateLintReport(Linter.Markdownlint),
      generateLintReport(Linter.Stylelint),
    ], 'Yuna')

    expect(exitCode).toBe(0)
  })

})
