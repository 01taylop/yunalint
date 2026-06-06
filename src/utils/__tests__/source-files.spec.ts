import { glob } from 'glob'

import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'

import { sourceFiles } from '../source-files'

import type { FilePatterns } from '@Types/lint'

jest.mock('glob')

describe('sourceFiles', () => {

  const getFilePatterns = (esPattern: Array<string> = ['**/*.ts']): FilePatterns => ({
    includePatterns: {
      [Linter.ESLint]: esPattern,
      [Linter.Markdownlint]: ['**/*.md'],
      [Linter.Stylelint]: ['**/*.css'],
    },
    ignorePatterns: ['node_modules'],
  })

  it('logs a warning and returns an empty array when no include patterns are provided for the linter', async () => {
    expect.assertions(3)

    const files = await sourceFiles(Linter.ESLint, getFilePatterns([]))

    expect(glob).not.toHaveBeenCalled()
    expect(colourLog.warning).toHaveBeenCalledOnceWith('\nNo file patterns provided for ESLint. Skipping.')
    expect(files).toStrictEqual([])
  })

  test.each([
    [Linter.ESLint, ['**/*.ts']],
    [Linter.Markdownlint, ['**/*.md']],
    [Linter.Stylelint, ['**/*.css']],
  ])('calls glob with the patterns and options for %s', async (linter, expectedFilePattern) => {
    expect.assertions(1)

    jest.mocked(glob).mockResolvedValue([])

    await sourceFiles(linter, getFilePatterns())

    expect(glob).toHaveBeenCalledOnceWith(expectedFilePattern, { ignore: [ 'node_modules' ] })
  })

  it('logs an info message and returns an empty array when no files are sourced for the linter', async () => {
    expect.assertions(3)

    jest.mocked(glob).mockResolvedValue([])

    const files = await sourceFiles(Linter.ESLint, getFilePatterns())

    expect(glob).toHaveBeenCalledOnceWith(['**/*.ts'], { ignore: [ 'node_modules' ] })
    expect(colourLog.info).toHaveBeenCalledOnceWith('\nNo files found for ESLint.')
    expect(files).toStrictEqual([])
  })

  it('returns a single file sourced for the file pattern', async () => {
    expect.assertions(3)

    const mockFiles = ['file1.ts']

    jest.mocked(glob).mockResolvedValue(mockFiles)

    const files = await sourceFiles(Linter.ESLint, getFilePatterns())

    expect(glob).toHaveBeenCalledOnceWith(['**/*.ts'], { ignore: [ 'node_modules' ] })
    expect(files).toStrictEqual(mockFiles)
    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Sourced 1 file for ESLint:', mockFiles)
  })

  it('returns multiple files sourced for the file pattern - excluding any duplicates', async () => {
    expect.assertions(3)

    const mockFiles = ['file1.ts', 'file2.ts', 'file1.ts']
    const expectedFiles = ['file1.ts', 'file2.ts']

    jest.mocked(glob).mockResolvedValue(mockFiles)

    const files = await sourceFiles(Linter.ESLint, getFilePatterns())

    expect(glob).toHaveBeenCalledOnceWith(['**/*.ts'], { ignore: [ 'node_modules' ] })
    expect(files).toStrictEqual(expectedFiles)
    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Sourced 2 files for ESLint:', expectedFiles)
  })

  it('catches any errors and exits the process', async () => {
    expect.assertions(2)

    const error = new Error('Test error')

    jest.mocked(glob).mockRejectedValue(error)

    try {
      await sourceFiles(Linter.ESLint, getFilePatterns())
    } catch {
      expect(colourLog.error).toHaveBeenCalledOnceWith('Failed to source files for ESLint', error)
      expect(process.exit).toHaveBeenCalledOnceWith(1)
    }
  })

})
