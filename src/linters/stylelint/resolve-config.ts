import { createRequire } from 'node:module'

import stylelint from 'stylelint'

import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'

const resolveConfigFile = async (cssFilePath?: string): Promise<string | undefined> => {
  try {
    // Custom config
    if (cssFilePath) {
      const customConfig = await stylelint.resolveConfig(cssFilePath)
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
  const require = createRequire(import.meta.url)
  const defaultConfigPath = require.resolve('./stylelint.config')
  colourLog.configDebug(`Using default ${Linter.Stylelint} config:`, defaultConfigPath)
  return defaultConfigPath
}

export {
  resolveConfigFile,
}
