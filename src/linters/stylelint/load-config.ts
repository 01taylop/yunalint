import stylelint from 'stylelint'

import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'

import defaultConfig from '../../../config/stylelint.config'

import type { Config } from 'stylelint'

const loadConfig = async (filePath?: string): Promise<Config | undefined> => {
  try {
    // Custom config
    if (filePath) {
      const customConfig = await stylelint.resolveConfig(filePath)
      if (customConfig) {
        colourLog.configDebug(`Using custom ${Linter.Stylelint} config:`, customConfig)
        return undefined // Stylelint will auto-discover it
      }
    }
  } catch (error) {
    if (!(error instanceof Error && error.name === 'ConfigurationError')) {
      colourLog.error(`An error occurred while loading the ${Linter.Stylelint} config`, error)
      process.exit(1)
    }
  }

  // Default config
  colourLog.configDebug(`Using default ${Linter.Stylelint} config:`, defaultConfig)
  return defaultConfig
}

export {
  loadConfig,
}
