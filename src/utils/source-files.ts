import { glob } from 'glob'

import { colourLog } from '@Utils/colour-log'
import { pluralise } from '@Utils/transform'

import type { FilePatterns, Linter } from '@Types/lint'

const sourceFiles = async (linter: Linter, { ignorePatterns, includePatterns }: FilePatterns): Promise<Array<string>> => {
  const include = includePatterns[linter]

  if (!include.length) {
    colourLog.warning(`\nNo file patterns provided for ${linter}. Skipping.`)
    return []
  }

  try {
    const files = [...new Set(await glob(include, {
      ignore: ignorePatterns,
    }))]

    if (!files.length) {
      colourLog.info(`\nNo files found for ${linter}.`)
      return []
    }

    colourLog.configDebug(`Sourced ${files.length} ${pluralise('file', files.length)} for ${linter}:`, files)
    return files
  } catch (error) {
    colourLog.error(`Failed to source files for ${linter}`, error)
    process.exit(1)
  }
}

export {
  sourceFiles,
}
