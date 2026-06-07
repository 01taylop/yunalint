import { ProcessSupervisor } from 'process-supervisor'

import { clearCacheDirectory } from '@Utils/cache'
import { colourLog } from '@Utils/colour-log'
import { getFilePatterns } from '@Utils/file-patterns'
import { createQueuedRunner } from '@Utils/queued-runner'
import { clearTerminal } from '@Utils/terminal'
import { EVENTS, fileWatcherEvents, watchFiles } from '@Utils/watch-files'

import { executeAllLinters } from './execute-all'

import type { LintCommandOptions } from '@Types/commands'
import type { FileChangedEventPayload } from '@Utils/watch-files'

const lintAction = async (
  supervisor: ProcessSupervisor,
  { cache, clearCache, debug, emoji, eslintInclude, eslintUseLegacyConfig, fix, ignoreDirs, ignorePatterns, title, watch }: LintCommandOptions,
) => {
  global.debug = debug

  clearTerminal()
  colourLog.title(`${emoji} ${title}\n`)

  if (clearCache) {
    clearCacheDirectory()
  }

  const filePatterns = getFilePatterns({
    eslintInclude,
    ignoreDirs,
    ignorePatterns,
  })

  const lintOptions = {
    cache,
    eslintUseLegacyConfig,
    filePatterns,
    fix,
    title,
    watch,
  }

  await executeAllLinters(lintOptions)

  if (watch) {
    supervisor.register('file-watcher', {
      start: () => watchFiles(filePatterns),
      stop: async watcher => {
        await watcher?.close()
      },
    })
    supervisor.start('file-watcher')

    const run = createQueuedRunner(() => executeAllLinters(lintOptions))

    fileWatcherEvents.on(EVENTS.FILE_CHANGED, async ({ message }: FileChangedEventPayload) => {
      clearTerminal()
      colourLog.info(`${message}\n`)
      await run()
    })
  }
}

export {
  lintAction,
}
