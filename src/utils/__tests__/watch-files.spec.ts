import { readFile } from 'node:fs'

import chokidar from 'chokidar'

import { Linter } from '@Types/lint'

import { EVENTS, fileWatcherEvents, watchFiles } from '../watch-files'

import type { FSWatcher } from 'chokidar'
import type { FilePatterns } from '@Types/lint'
import type { WatcherHandle } from '../watch-files'

jest.mock('node:fs')

type Event = Record<string, unknown>

describe('watchFiles', () => {
  let mockWatcher: Pick<FSWatcher, 'add' | 'close' | 'on' | 'unwatch'>

  const getIncludePatterns = (esPattern: string = '**/*.ts'): FilePatterns['includePatterns'] => ({
    [Linter.ESLint]: [esPattern],
    [Linter.Markdownlint]: ['**/*.md'],
    [Linter.Stylelint]: ['**/*.css'],
  })

  const collectEvents = () => {
    const events: Array<Event> = []

    fileWatcherEvents.on(EVENTS.FILE_CHANGED, (params: Event) => {
      events.push(params)
    })

    return events
  }

  const triggerFileEvent = (event: 'add' | 'change' | 'unlink', path: string, content: string, debounceTime: number, error?: Error) => {
    if (event === 'change') {
      jest.mocked(readFile).mockImplementation((_path: unknown, _options: unknown, callback?: (error: Error | null, data: string) => void): void => {
        if (callback) {
          callback(error || null, content)
        }
      })
    }

    const eventHandler = jest.mocked(mockWatcher.on).mock.calls.find(([name, _handler]) => name === event)?.[1] as ((filePath: string) => void) | undefined
    if (eventHandler) {
      eventHandler(path)
    }

    jest.advanceTimersByTime(debounceTime)
  }

  beforeEach(() => {
    mockWatcher = {
      add: jest.fn(),
      close: jest.fn(),
      on: jest.fn(),
      unwatch: jest.fn(),
    }

    jest.mocked(chokidar.watch).mockReturnValue(mockWatcher as FSWatcher)
    jest.useFakeTimers()
  })

  afterEach(() => {
    fileWatcherEvents.removeAllListeners()
    jest.mocked(readFile).mockReset()
  })

  it('initialises chokidar for all linters when no specific linters are provided', () => {
    watchFiles({
      includePatterns: getIncludePatterns(),
      ignorePatterns: ['node_modules'],
    })

    expect(chokidar.watch).toHaveBeenCalledOnceWith(['**/*.ts', '**/*.md', '**/*.css'], {
      ignored: ['node_modules'],
      ignoreInitial: true,
      persistent: true,
    })
  })

  test.each([
    [Linter.ESLint, '**/*.ts'],
    [Linter.Markdownlint, '**/*.md'],
    [Linter.Stylelint, '**/*.css'],
  ])('initialises chokidar for %s when specified', (linter, expectedPattern) => {
    watchFiles({
      includePatterns: getIncludePatterns(),
      ignorePatterns: ['node_modules'],
    }, [linter])

    expect(chokidar.watch).toHaveBeenCalledOnceWith([expectedPattern], {
      ignored: ['node_modules'],
      ignoreInitial: true,
      persistent: true,
    })
  })

  describe('when a file is added', () => {

    it('emits a "FILE_CHANGED" event', () => {
      const events = collectEvents()
      const mockPath = 'mock/new-file.ts'

      watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })
      triggerFileEvent('add', mockPath, '', 0)

      jest.runAllTimers()

      expect(events).toHaveLength(1)
      expect(events).toStrictEqual([{
        message: `File \`${mockPath}\` has been added.`,
        path: mockPath,
      }])
    })

  })

  describe('when a file is removed', () => {

    it('emits a "FILE_CHANGED" event', () => {
      const events = collectEvents()
      const mockPath = 'mock/old-file.ts'

      watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })
      triggerFileEvent('unlink', mockPath, '', 0)

      jest.runAllTimers()

      expect(events).toHaveLength(1)
      expect(events).toStrictEqual([{
        message: `File \`${mockPath}\` has been removed.`,
        path: mockPath,
      }])
    })

    it('cancels any pending change events', () => {
      const events = collectEvents()
      const mockPath = 'mock/old-file-2.ts'

      watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })
      triggerFileEvent('change', mockPath, 'old-content', 200)
      triggerFileEvent('unlink', mockPath, '', 0)

      jest.runAllTimers()

      expect(events).toHaveLength(1)
      expect(events).toStrictEqual([{
        message: `File \`${mockPath}\` has been removed.`,
        path: mockPath,
      }])
    })

  })

  describe('when saving a file', () => {

    it('emits a "FILE_CHANGED" event on first save (no hash exists yet)', () => {
      const events = collectEvents()
      const mockPath = 'mock/save-file.ts'

      watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })
      triggerFileEvent('change', mockPath, 'hello-world', 400)

      jest.runAllTimers()

      expect(events).toHaveLength(1)
      expect(events).toStrictEqual([{
        message: `File \`${mockPath}\` has been changed.`,
        path: mockPath,
      }])
    })

    it('emits a "FILE_CHANGED" event if the file content changes', () => {
      const events = collectEvents()
      const mockPath = 'mock/change-file.ts'

      watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })
      triggerFileEvent('change', mockPath, 'old-content', 400) // First save - no hash map yet, will emit
      triggerFileEvent('change', mockPath, 'old-content', 400) // Second save - content hash is the same, won't emit
      triggerFileEvent('change', mockPath, 'new-content', 400) // Third save - content hash is different, will emit
      triggerFileEvent('change', mockPath, 'new-content', 400) // Fourth save - content hash is the same, won't emit

      jest.runAllTimers()

      expect(events).toHaveLength(2)
      expect(events).toStrictEqual([{
        message: `File \`${mockPath}\` has been changed.`,
        path: mockPath,
      }, {
        message: `File \`${mockPath}\` has been changed.`,
        path: mockPath,
      }])
    })

    it('debounces rapid file changes to prevent multiple events', () => {
      const events = collectEvents()
      const mockPath = 'mock/debounce-file.ts'

      watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })
      triggerFileEvent('change', mockPath, 'content-1', 100) // 100ms - cancelled by next change
      triggerFileEvent('change', mockPath, 'content-2', 100) // 100ms - cancelled by next change
      triggerFileEvent('change', mockPath, 'content-3', 400) // 400ms - this one should fire

      jest.runAllTimers()

      expect(events).toHaveLength(1)
      expect(events).toStrictEqual([{
        message: `File \`${mockPath}\` has been changed.`,
        path: mockPath,
      }])
    })

    it('emits a "FILE_CHANGED" event when the file cannot be read', () => {
      const events = collectEvents()
      const mockPath = 'mock/unreadable-file.ts'

      watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })
      triggerFileEvent('change', mockPath, 'current-content', 400, new Error('Permission denied'))

      jest.runAllTimers()

      expect(events).toHaveLength(1)
      expect(events).toStrictEqual([{
        message: `File \`${mockPath}\` has been changed (content unreadable).`,
        path: mockPath,
      }])
    })

  })

  describe('close', () => {

    it('calls the underlying watcher close when closed', async () => {
      expect.assertions(1)

      const handle: WatcherHandle = watchFiles({
        includePatterns: getIncludePatterns(),
        ignorePatterns: [],
      })

      await handle.close()

      expect(mockWatcher.close).toHaveBeenCalledTimes(1)
    })

    it('cancels pending change timeouts when closed', async () => {
      expect.assertions(1)

      const events = collectEvents()
      const mockPath = 'mock/close-file.ts'

      const handle: WatcherHandle = watchFiles({
        includePatterns: getIncludePatterns(mockPath),
        ignorePatterns: [],
      })

      triggerFileEvent('change', mockPath, 'new-content', 100)

      await handle.close()

      jest.runAllTimers()

      expect(events).toHaveLength(0)
    })

  })

})
