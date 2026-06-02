import { createHash } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { readFile } from 'node:fs'

import chokidar from 'chokidar'

import type { FilePatterns, Linter } from '@Types/lint'

enum EVENTS {
  FILE_CHANGED = 'FILE_CHANGED',
}

interface FileChangedEventPayload {
  message: string
  path: string
}

const fileWatcherEvents = new EventEmitter()

const watchFiles = ({ ignorePatterns, includePatterns }: FilePatterns, linters?: Array<Linter>) => {
  const fileHashes = new Map<string, string>()
  const pendingChanges = new Map<string, NodeJS.Timeout>()

  const cancelExistingTimeout = (path: string) => {
    const existingTimeout = pendingChanges.get(path)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      pendingChanges.delete(path)
    }
  }
  const filteredPatterns = linters
    ? linters.flatMap(linter => includePatterns[linter])
    : Object.values(includePatterns).flat()

  const watcher = chokidar.watch(filteredPatterns, {
    ignored: ignorePatterns,
    ignoreInitial: true,
    persistent: true,
  })

  watcher.on('add', (path, _stats) => {
    fileWatcherEvents.emit(EVENTS.FILE_CHANGED, {
      message: `File \`${path}\` has been added.`,
      path,
    } satisfies FileChangedEventPayload)
  })

  watcher.on('change', (path, _stats) => {
    cancelExistingTimeout(path)

    const fileChangeTimeout = setTimeout(() => {
      readFile(path, 'utf8', (error, data) => {
        if (error) {
          fileWatcherEvents.emit(EVENTS.FILE_CHANGED, {
            message: `File \`${path}\` has been changed (content unreadable).`,
            path,
          } satisfies FileChangedEventPayload)
          return
        }

        const currentHash = fileHashes.get(path)
        const newHash = createHash('md5').update(data).digest('hex')

        if (currentHash !== newHash) {
          fileHashes.set(path, newHash)
          fileWatcherEvents.emit(EVENTS.FILE_CHANGED, {
            message: `File \`${path}\` has been changed.`,
            path,
          } satisfies FileChangedEventPayload)
        }
      })

      pendingChanges.delete(path)
    }, 300)

    pendingChanges.set(path, fileChangeTimeout)
  })

  watcher.on('unlink', path => {
    cancelExistingTimeout(path)

    fileHashes.delete(path)
    fileWatcherEvents.emit(EVENTS.FILE_CHANGED, {
      message: `File \`${path}\` has been removed.`,
      path,
    } satisfies FileChangedEventPayload)
  })

  return watcher
}

export type {
  FileChangedEventPayload,
}

export {
  EVENTS,
  fileWatcherEvents,
  watchFiles,
}
