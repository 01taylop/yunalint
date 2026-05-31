import { ProcessSupervisor } from 'process-supervisor'

import { Linter } from '@Types/lint'
import { clearCacheDirectory } from '@Utils/cache'
import colourLog from '@Utils/colour-log'
import { getFilePatterns } from '@Utils/file-patterns'
import { clearTerminal } from '@Utils/terminal'
import { EVENTS, fileWatcherEvents, watchFiles } from '@Utils/watch-files'

import action from '../action'
import { executeAllLinters } from '../execute-all'

jest.mock('@Utils/cache')
jest.mock('@Utils/file-patterns')
jest.mock('@Utils/terminal')
jest.mock('@Utils/watch-files')
jest.mock('../execute-all')

describe('lint action', () => {
  const supervisor = new ProcessSupervisor()

  const mockFilePatterns = {
    includePatterns: {
      [Linter.ESLint]: ['**/*.ts'],
      [Linter.Markdownlint]: ['**/*.md'],
      [Linter.Stylelint]: ['**/*.css'],
    },
    ignorePatterns: ['**/node_modules/**'],
  }

  const defaultOptions = {
    cache: false,
    clearCache: false,
    debug: false,
    emoji: '🌸',
    eslintInclude: undefined,
    eslintUseLegacyConfig: false,
    fix: false,
    ignoreDirs: undefined,
    ignorePatterns: undefined,
    title: 'Yuna',
    watch: false,
  }

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

      await action(supervisor, { ...defaultOptions, debug: true })

      expect(global.debug).toBe(true)
    })

    it('sets global.debug to false when debug option is false', async () => {
      expect.assertions(1)

      await action(supervisor, { ...defaultOptions, debug: false })

      expect(global.debug).toBe(false)
    })

  })

  describe('terminal and title', () => {

    it('clears the terminal', async () => {
      expect.assertions(1)

      await action(supervisor, defaultOptions)

      expect(clearTerminal).toHaveBeenCalledTimes(1)
    })

    it('logs the default title and emoji', async () => {
      expect.assertions(1)

      await action(supervisor, defaultOptions)

      expect(colourLog.title).toHaveBeenCalledWith('🌸 Yuna\n')
    })

    it('logs a custom title and emoji', async () => {
      expect.assertions(1)

      await action(supervisor, { ...defaultOptions, emoji: '🚀', title: 'Rocket Lint' })

      expect(colourLog.title).toHaveBeenCalledWith('🚀 Rocket Lint\n')
    })

  })

  describe('cache clearing', () => {

    it('does not clear cache by default', async () => {
      expect.assertions(1)

      await action(supervisor, defaultOptions)

      expect(clearCacheDirectory).not.toHaveBeenCalled()
    })

    it('clears cache when clearCache option is true', async () => {
      expect.assertions(1)

      await action(supervisor, { ...defaultOptions, clearCache: true })

      expect(clearCacheDirectory).toHaveBeenCalledTimes(1)
    })

  })

  describe('file patterns', () => {

    it('gets file patterns with provided options', async () => {
      expect.assertions(1)

      await action(supervisor, {
        ...defaultOptions,
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

      await action(supervisor, defaultOptions)

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

      await action(supervisor, {
        ...defaultOptions,
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

      await action(supervisor, defaultOptions)

      expect(watchFiles).not.toHaveBeenCalled()
    })

    it('starts watcher when watch option is true', async () => {
      expect.assertions(1)

      await action(supervisor, { ...defaultOptions, watch: true })

      expect(watchFiles).toHaveBeenCalledWith(mockFilePatterns)
    })

    it('registers file watcher event handler', async () => {
      expect.assertions(1)

      await action(supervisor, { ...defaultOptions, watch: true })

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

      await action(supervisor, { ...defaultOptions, watch: true })

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

      await action(supervisor, { ...defaultOptions, watch: true })

      changeHandler!({ message: 'File changed: test.ts' })
      await Promise.resolve()

      expect(clearTerminal).toHaveBeenCalledTimes(2)
      expect(colourLog.info).toHaveBeenCalledWith('File changed: test.ts\n')
    })

    it('registers stop callback that closes the watcher', async () => {
      expect.assertions(1)

      const mockWatcher = { close: jest.fn().mockResolvedValue(undefined) }
      jest.mocked(watchFiles).mockReturnValue(mockWatcher as any)

      await action(supervisor, { ...defaultOptions, watch: true })
      await supervisor.stop('file-watcher')

      expect(mockWatcher.close).toHaveBeenCalledTimes(1)
    })

  })

})
