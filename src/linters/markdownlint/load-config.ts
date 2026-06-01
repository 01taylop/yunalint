import fs from 'node:fs'
import path from 'node:path'

import { readConfig } from 'markdownlint/promise'

import { Linter } from '@Types/lint'
import colourLog from '@Utils/colour-log'

import defaultConfig from '../../../config/markdownlint.json'

import type { Configuration } from 'markdownlint'

const loadConfig = async (): Promise<Configuration> => {
  try {
    // Custom config
    const customConfigPath = path.join(process.cwd(), '.markdownlint.json')
    if (fs.existsSync(customConfigPath)) {
      const config = await readConfig(customConfigPath)

      colourLog.configDebug(`Using custom ${Linter.Markdownlint} config:`, config)
      return config
    }

    // Default config
    colourLog.configDebug(`Using default ${Linter.Markdownlint} config:`, defaultConfig)
    return defaultConfig as Configuration
  } catch (error) {
    colourLog.error(`An error occurred while loading the ${Linter.Markdownlint} config`, error)
    process.exit(1)
  }
}

export {
  loadConfig,
}
