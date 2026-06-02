import { Linter } from '@Types/lint'
import colourLog from '@Utils/colour-log'

import { getFilePatterns } from '../file-patterns'

describe('getFilePatterns', () => {

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('returns the default include patterns for ESLint', () => {
    const filePatterns = getFilePatterns({})

    const expectedPatterns = [
      '**/*.{cjs,js,jsx,mjs,ts,tsx}',
    ]

    expect(filePatterns.includePatterns[Linter.ESLint]).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('ESLint Patterns', expectedPatterns)
  })

  it('returns the include patterns for ESLint with an additional pattern', () => {
    const filePatterns = getFilePatterns({
      eslintInclude: 'foo'
    })

    const expectedPatterns = [
      '**/*.{cjs,js,jsx,mjs,ts,tsx}',
      'foo',
    ]

    expect(filePatterns.includePatterns[Linter.ESLint]).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('ESLint Patterns', expectedPatterns)
  })

  it('returns the include patterns for ESLint with several additional patterns', () => {
    const filePatterns = getFilePatterns({
      eslintInclude: ['foo', 'bar'],
    })

    const expectedPatterns = [
      '**/*.{cjs,js,jsx,mjs,ts,tsx}',
      'bar',
      'foo',
    ]

    expect(filePatterns.includePatterns[Linter.ESLint]).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('ESLint Patterns', expectedPatterns)
  })

  it('returns the include patterns for Markdownlint', () => {
    const filePatterns = getFilePatterns({})

    const expectedPatterns = [
      '**/*.{md,mdx}',
    ]

    expect(filePatterns.includePatterns[Linter.Markdownlint]).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('Markdownlint Patterns', expectedPatterns)
  })

  it('returns the include patterns for Stylelint', () => {
    const filePatterns = getFilePatterns({})

    const expectedPatterns = [
      '**/*.{css,scss,less}',
    ]

    expect(filePatterns.includePatterns[Linter.Stylelint]).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('Stylelint Patterns', expectedPatterns)
  })

  it('returns the default ignore patterns', () => {
    const filePatterns = getFilePatterns({})

    const expectedPatterns = [
      '**/+(coverage|dist|generated|node_modules|tmp|tscOutput|vendor)/**',
      '**/*.+(map|min).*',
    ]

    expect(filePatterns.ignorePatterns).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('Ignore', expectedPatterns)
  })

  it('returns the ignore patterns with an additional directory ignored', () => {
    const filePatterns = getFilePatterns({
      ignoreDirs: 'foo'
    })

    const expectedPatterns = [
      '**/+(coverage|dist|foo|generated|node_modules|tmp|tscOutput|vendor)/**',
      '**/*.+(map|min).*',
    ]

    expect(filePatterns.ignorePatterns).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('Ignore', expectedPatterns)
  })

  it('returns the ignore patterns with several additional directories ignored', () => {
    const filePatterns = getFilePatterns({
      ignoreDirs: ['foo', 'bar'],
    })

    const expectedPatterns = [
      '**/+(bar|coverage|dist|foo|generated|node_modules|tmp|tscOutput|vendor)/**',
      '**/*.+(map|min).*',
    ]

    expect(filePatterns.ignorePatterns).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('Ignore', expectedPatterns)
  })

  it('returns the ignore patterns with an additional pattern ignored', () => {
    const filePatterns = getFilePatterns({
      ignorePatterns: 'foo'
    })

    const expectedPatterns = [
      '**/+(coverage|dist|generated|node_modules|tmp|tscOutput|vendor)/**',
      '**/*.+(map|min).*',
      'foo',
    ]

    expect(filePatterns.ignorePatterns).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('Ignore', expectedPatterns)
  })

  it('returns the ignore patterns with several additional patterns ignored', () => {
    const filePatterns = getFilePatterns({
      ignorePatterns: ['foo', 'bar'],
    })

    const expectedPatterns = [
      '**/+(coverage|dist|generated|node_modules|tmp|tscOutput|vendor)/**',
      '**/*.+(map|min).*',
      'bar',
      'foo',
    ]

    expect(filePatterns.ignorePatterns).toStrictEqual(expectedPatterns)
    expect(colourLog.config).toHaveBeenCalledWith('Ignore', expectedPatterns)
  })

  it('logs the file patterns for all linters when no specific linters are provided', () => {
    getFilePatterns({})

    expect(colourLog.config).toHaveBeenCalledTimes(4)
    expect(colourLog.config).toHaveBeenNthCalledWith(1, 'ESLint Patterns', expect.any(Array))
    expect(colourLog.config).toHaveBeenNthCalledWith(2, 'Markdownlint Patterns', expect.any(Array))
    expect(colourLog.config).toHaveBeenNthCalledWith(3, 'Stylelint Patterns', expect.any(Array))
    expect(colourLog.config).toHaveBeenNthCalledWith(4, 'Ignore', expect.any(Array))
    expect(console.log).toHaveBeenCalledOnceWith()
  })

  test.each([
    Linter.ESLint,
    Linter.Markdownlint,
    Linter.Stylelint,
  ])('logs the file patterns for %s when specified', linter => {
    getFilePatterns({ linters: [linter] })

    expect(colourLog.config).toHaveBeenCalledTimes(2)
    expect(colourLog.config).toHaveBeenNthCalledWith(1, `${linter} Patterns`, expect.any(Array))
    expect(colourLog.config).toHaveBeenNthCalledWith(2, 'Ignore', expect.any(Array))
    expect(console.log).toHaveBeenCalledOnceWith()
  })

})
