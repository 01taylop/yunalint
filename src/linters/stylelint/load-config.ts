import path from 'node:path'

import { resolveConfig } from 'stylelint'

import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'

import defaultConfig from '../../../config/stylelint.config'

import type { Config } from 'stylelint'

const loadConfig = async (filePath?: string): Promise<Config | undefined> => {
  try {
    // Custom config
    const searchPath = filePath
      ? path.resolve(filePath)
      : path.join(process.cwd(), 'style.css')
    const customConfig = await resolveConfig(searchPath)
    if (customConfig) {
      colourLog.configDebug(`Using custom ${Linter.Stylelint} config:`, customConfig)
      return undefined // Stylelint will auto-discover it
    }

    // Default config
    colourLog.configDebug(`Using default ${Linter.Stylelint} config:`, defaultConfig)
    return defaultConfig
  } catch (error) {
    colourLog.error(`An error occurred while loading the ${Linter.Stylelint} config`, error)
    process.exit(1)
  }
}

export {
  loadConfig,
}
