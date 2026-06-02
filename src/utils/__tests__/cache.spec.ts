import fs from 'node:fs'
import path from 'node:path'

import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'

import { clearCacheDirectory, getCacheDirectory } from '../cache'

jest.mock('node:fs')

const cacheDirectory = path.join(process.cwd(), '.cache/lint')

const testCases: Array<[Linter, string]> = [
  [Linter.ESLint, 'eslint'],
  [Linter.Markdownlint, 'markdownlint'],
  [Linter.Stylelint, 'stylelint'],
]

describe('clearCacheDirectory', () => {

  it('clears the cache directory if it exists', () => {
    jest.mocked(fs.existsSync).mockReturnValueOnce(true)

    clearCacheDirectory()

    expect(fs.existsSync).toHaveBeenCalledOnceWith(cacheDirectory)
    expect(fs.rmSync).toHaveBeenCalledOnceWith(cacheDirectory, {
      force: true,
      recursive: true,
    })
    expect(colourLog.info).toHaveBeenCalledOnceWith('Cache cleared.\n')
  })

  test.each(testCases)('clears the cache directory for %s if it exists', (linter, expectedSubDirectory) => {
    const expectedCacheDirectory = path.join(cacheDirectory, expectedSubDirectory)

    jest.mocked(fs.existsSync).mockReturnValueOnce(true)

    clearCacheDirectory(linter)

    expect(fs.existsSync).toHaveBeenCalledOnceWith(expectedCacheDirectory)
    expect(fs.rmSync).toHaveBeenCalledOnceWith(expectedCacheDirectory, {
      force: true,
      recursive: true,
    })
    expect(colourLog.info).toHaveBeenCalledOnceWith(`Cache cleared for ${linter}.\n`)
  })

  it('does not attempt to clear the cache if the directory does not exist', () => {
    jest.mocked(fs.existsSync).mockReturnValueOnce(false)

    clearCacheDirectory()

    expect(fs.existsSync).toHaveBeenCalledOnceWith(cacheDirectory)
    expect(fs.rmSync).not.toHaveBeenCalled()
    expect(colourLog.info).toHaveBeenCalledOnceWith('No cache to clear.\n')
  })

  test.each(testCases)('does not attempt to clear the cache for %s if the directory does not exist', (linter, expectedSubDirectory) => {
    const expectedCacheDirectory = path.join(cacheDirectory, expectedSubDirectory)

    jest.mocked(fs.existsSync).mockReturnValueOnce(false)

    clearCacheDirectory(linter)

    expect(fs.existsSync).toHaveBeenCalledOnceWith(expectedCacheDirectory)
    expect(fs.rmSync).not.toHaveBeenCalled()
    expect(colourLog.info).toHaveBeenCalledOnceWith(`No cache to clear for ${linter}.\n`)
  })

  it('logs an error if clearing the cache fails', () => {
    jest.mocked(fs.existsSync).mockReturnValueOnce(true)
    jest.mocked(fs.rmSync).mockImplementationOnce(() => {
      throw new Error('Test Error')
    })

    clearCacheDirectory()

    expect(fs.existsSync).toHaveBeenCalledOnceWith(cacheDirectory)
    expect(fs.rmSync).toHaveBeenCalledOnceWith(cacheDirectory, {
      force: true,
      recursive: true,
    })
    expect(colourLog.error).toHaveBeenCalledOnceWith('Failed to clear cache.\n', expect.any(Error))
  })

  test.each(testCases)('logs an error if clearing the cache fails for %s', (linter, expectedSubDirectory) => {
    const expectedCacheDirectory = path.join(cacheDirectory, expectedSubDirectory)

    jest.mocked(fs.existsSync).mockReturnValueOnce(true)
    jest.mocked(fs.rmSync).mockImplementationOnce(() => {
      throw new Error('Test Error')
    })

    clearCacheDirectory(linter)

    expect(fs.existsSync).toHaveBeenCalledOnceWith(expectedCacheDirectory)
    expect(fs.rmSync).toHaveBeenCalledOnceWith(expectedCacheDirectory, {
      force: true,
      recursive: true,
    })
    expect(colourLog.error).toHaveBeenCalledOnceWith(`Failed to clear cache for ${linter}.\n`, expect.any(Error))
  })

})

describe('getCacheDirectory', () => {

  test.each(testCases)('returns the resolved path to the %s cache directory', (linter, expectedSubDirectory) => {
    jest.spyOn(path, 'resolve')

    const expectedCacheDirectory = path.join(cacheDirectory, expectedSubDirectory)

    const result = getCacheDirectory(linter)

    expect(path.resolve).toHaveBeenCalledOnceWith(process.cwd(), '.cache/lint', expectedSubDirectory)
    expect(result).toBe(expectedCacheDirectory)
  })

})
