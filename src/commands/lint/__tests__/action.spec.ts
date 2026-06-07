import { ProcessSupervisor } from 'process-supervisor'

import { defaultLintCommandOptions, mockFilePatterns } from '@Jest/fixtures'
import { clearCacheDirectory } from '@Utils/cache'
import { colourLog } from '@Utils/colour-log'
import { getFilePatterns } from '@Utils/file-patterns'
import { clearTerminal } from '@Utils/terminal'
import { EVENTS, fileWatcherEvents, watchFiles } from '@Utils/watch-files'

import { lintAction } from '../action'
import { executeAllLinters } from '../execute-all'

import type { WatcherHandle } from '@Utils/watch-files'

jest.mock('@Utils/cache')
jest.mock('@Utils/file-patterns')
jest.mock('@Utils/terminal')
jest.mock('@Utils/watch-files')
jest.mock('../execute-all')

describe('lint action', () => {
  const supervisor = new ProcessSupervisor()

  beforeEach(() => {
    global.debug = false
    jest.mocked(getFilePatterns).mockReturnValue(mockFilePatterns)
    jest.mocked(executeAllLinters).mockResolvedValue()
  })

  afterEach(async () => {
    if (supervisor.has('file-watcher')) {
      await supervisor.unregister('file-watcher')
    }
  })

  describe('debug mode', () => {

    it('sets `global.debug` to true when `debug` is true', async () => {
      expect.assertions(1)

      await lintAction(supervisor, { ...defaultLintCommandOptions, debug: true })

      expect(global.debug).toBe(true)
    })

    it('sets `global.debug` to false when `debug` is false', async () => {
      expect.assertions(1)

      await lintAction(supervisor, { ...defaultLintCommandOptions, debug: false })

      expect(global.debug).toBe(false)
    })

  })

  describe('terminal and title', () => {

    it('clears the terminal', async () => {
      expect.assertions(1)

      await lintAction(supervisor, defaultLintCommandOptions)

      expect(clearTerminal).toHaveBeenCalledTimes(1)
    })

    it('logs the default title and emoji', async () => {
      expect.assertions(1)

      await lintAction(supervisor, defaultLintCommandOptions)

      expect(colourLog.title).toHaveBeenCalledWith('🌺 Yuna\n')
    })

    it('logs a custom title and emoji', async () => {
      expect.assertions(1)

      await lintAction(supervisor, { ...defaultLintCommandOptions, emoji: '🚀', title: 'Rocket Lint' })

      expect(colourLog.title).toHaveBeenCalledWith('🚀 Rocket Lint\n')
    })

  })

  describe('cache clearing', () => {

    it('does not clear cache by default', async () => {
      expect.assertions(1)

      await lintAction(supervisor, defaultLintCommandOptions)

      expect(clearCacheDirectory).not.toHaveBeenCalled()
    })

    it('clears cache when `clearCache` is true', async () => {
      expect.assertions(1)

      await lintAction(supervisor, { ...defaultLintCommandOptions, clearCache: true })

      expect(clearCacheDirectory).toHaveBeenCalledTimes(1)
    })

  })

  describe('file patterns', () => {

    it('gets file patterns with provided options', async () => {
      expect.assertions(1)

      await lintAction(supervisor, {
        ...defaultLintCommandOptions,
        eslintInclude: ['*.js'],
        ignoreDirs: ['build'],
        ignorePatterns: ['*.test.ts'],
      })

      expect(getFilePatterns).toHaveBeenCalledWith({
        eslintInclude: ['*.js'],
        ignoreDirs: ['build'],
        ignorePatterns: ['*.test.ts'],
      })
    })

  })

  describe('linter execution', () => {

    it('executes all linters with default options', async () => {
      expect.assertions(1)

      await lintAction(supervisor, defaultLintCommandOptions)

      expect(executeAllLinters).toHaveBeenCalledWith({
        cache: false,
        eslintUseLegacyConfig: false,
        filePatterns: mockFilePatterns,
        fix: false,
        title: 'Yuna',
        watch: false,
      })
    })

    it('executes all linters with custom options', async () => {
      expect.assertions(1)

      await lintAction(supervisor, {
        ...defaultLintCommandOptions,
        cache: true,
        eslintUseLegacyConfig: true,
        fix: true,
      })

      expect(executeAllLinters).toHaveBeenCalledWith({
        cache: true,
        eslintUseLegacyConfig: true,
        filePatterns: mockFilePatterns,
        fix: true,
        title: 'Yuna',
        watch: false,
      })
    })

  })

  describe('watch mode', () => {

    let changeHandler: (data: { message: string }) => void
    jest.mocked(fileWatcherEvents.on).mockImplementation((event, handler) => {
      if (event === EVENTS.FILE_CHANGED) {
        changeHandler = handler as typeof changeHandler
      }
      return fileWatcherEvents
    })

    it('does not start watcher by default', async () => {
      expect.assertions(1)

      await lintAction(supervisor, defaultLintCommandOptions)

      expect(watchFiles).not.toHaveBeenCalled()
    })

    it('starts watcher when `watch` is true', async () => {
      expect.assertions(1)

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })

      expect(watchFiles).toHaveBeenCalledWith(mockFilePatterns)
    })

    it('registers file watcher event handler', async () => {
      expect.assertions(1)

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })

      expect(fileWatcherEvents.on).toHaveBeenCalledWith(
        EVENTS.FILE_CHANGED,
        expect.any(Function)
      )
    })

    it('re-runs linters when file changes in watch mode', async () => {
      expect.assertions(2)

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })

      expect(executeAllLinters).toHaveBeenCalledTimes(1)

      changeHandler({ message: 'File changed: test.ts' })
      await Promise.resolve()

      expect(executeAllLinters).toHaveBeenCalledTimes(2)
    })

    it('clears terminal and logs message on file change', async () => {
      expect.assertions(2)

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })

      changeHandler({ message: 'File changed: test.ts' })
      await Promise.resolve()

      expect(clearTerminal).toHaveBeenCalledTimes(2)
      expect(colourLog.info).toHaveBeenCalledWith('File changed: test.ts\n')
    })

    it('consolidates multiple file change events into a single re-run while linting is in progress', async () => {
      expect.assertions(2)

      let resolveSecondRun!: () => void
      jest.mocked(executeAllLinters)
        .mockResolvedValueOnce(undefined)  // Initial run - resolves before watcher is set up
        .mockImplementationOnce(() => new Promise<void>(resolve => { resolveSecondRun = resolve }))  // First change-triggered run
        .mockResolvedValue(undefined)  // Subsequent re-runs

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })

      expect(executeAllLinters).toHaveBeenCalledTimes(1)

      changeHandler({ message: 'File changed: a.ts' })
      changeHandler({ message: 'File changed: b.ts' })
      changeHandler({ message: 'File changed: c.ts' })
      resolveSecondRun()
      await Promise.resolve()

      // 1 initial + 1 first change + 1 consolidated re-run (b.ts and c.ts merged) = 3
      expect(executeAllLinters).toHaveBeenCalledTimes(3)
    })

    it('closes the watcher when supervisor stops', async () => {
      expect.assertions(1)

      const mockWatcher: WatcherHandle = { close: jest.fn() }
      jest.mocked(watchFiles).mockReturnValue(mockWatcher)

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })
      await supervisor.stop('file-watcher')

      expect(mockWatcher.close).toHaveBeenCalledTimes(1)
    })

  })

})
