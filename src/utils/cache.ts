import fs from 'node:fs'
import path from 'node:path'

import { colourLog } from '@Utils/colour-log'

import type { Linter } from '@Types/lint'

const CACHE_DIRECTORY = '.cache/lint'

const clearCacheDirectory = (linter?: Linter) => {
  const messageSuffix = linter ? ` for ${linter}` : ''

  try {
    const cacheDirectory = path.resolve(process.cwd(), CACHE_DIRECTORY, linter?.toLowerCase() || '')

    if (fs.existsSync(cacheDirectory)) {
      fs.rmSync(cacheDirectory, {
        force: true,
        recursive: true,
      })
      colourLog.info(`Cache cleared${messageSuffix}.\n`)
    } else {
      colourLog.info(`No cache to clear${messageSuffix}.\n`)
    }
  } catch (error) {
    colourLog.error(`Failed to clear cache${messageSuffix}.\n`, error)
  }
}

const getCacheDirectory = (linter: Linter) => path.resolve(process.cwd(), CACHE_DIRECTORY, linter.toLowerCase())

export {
  clearCacheDirectory,
  getCacheDirectory,
}
