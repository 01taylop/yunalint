import { ProcessSupervisor } from 'process-supervisor'

import { defaultLintCommandOptions, mockFilePatterns } from '@Jest/fixtures'
import { clearCacheDirectory } from '@Utils/cache'
import colourLog from '@Utils/colour-log'
import { getFilePatterns } from '@Utils/file-patterns'
import { clearTerminal } from '@Utils/terminal'
import { EVENTS, fileWatcherEvents, watchFiles } from '@Utils/watch-files'

import { lintAction } from '../action'
import { executeAllLinters } from '../execute-all'

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

    it('sets global.debug to true when debug option is true', async () => {
      expect.assertions(1)

      await lintAction(supervisor, { ...defaultLintCommandOptions, debug: true })

      expect(global.debug).toBe(true)
    })

    it('sets global.debug to false when debug option is false', async () => {
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

    it('clears cache when clearCache option is true', async () => {
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

    it('does not start watcher by default', async () => {
      expect.assertions(1)

      await lintAction(supervisor, defaultLintCommandOptions)

      expect(watchFiles).not.toHaveBeenCalled()
    })

    it('starts watcher when watch option is true', async () => {
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

      let changeHandler: (data: { message: string }) => void
      jest.mocked(fileWatcherEvents.on).mockImplementation((event, handler) => {
        if (event === EVENTS.FILE_CHANGED) {
          changeHandler = handler as typeof changeHandler
        }
        return fileWatcherEvents
      })

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })

      expect(executeAllLinters).toHaveBeenCalledTimes(1)

      changeHandler!({ message: 'File changed: test.ts' })
      await Promise.resolve()

      expect(executeAllLinters).toHaveBeenCalledTimes(2)
    })

    it('clears terminal and logs message on file change', async () => {
      expect.assertions(2)

      let changeHandler: (data: { message: string }) => void
      jest.mocked(fileWatcherEvents.on).mockImplementation((event, handler) => {
        if (event === EVENTS.FILE_CHANGED) {
          changeHandler = handler as typeof changeHandler
        }
        return fileWatcherEvents
      })

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })

      changeHandler!({ message: 'File changed: test.ts' })
      await Promise.resolve()

      expect(clearTerminal).toHaveBeenCalledTimes(2)
      expect(colourLog.info).toHaveBeenCalledWith('File changed: test.ts\n')
    })

    it('registers stop callback that closes the watcher', async () => {
      expect.assertions(1)

      const mockWatcher = { close: jest.fn().mockResolvedValue(undefined) }
      jest.mocked(watchFiles).mockReturnValue(mockWatcher as any)

      await lintAction(supervisor, { ...defaultLintCommandOptions, watch: true })
      await supervisor.stop('file-watcher')

      expect(mockWatcher.close).toHaveBeenCalledTimes(1)
    })

  })

})
