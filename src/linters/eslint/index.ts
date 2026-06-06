import { loadESLint } from 'eslint'

import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'
import { getCacheDirectory } from '@Utils/cache'

import { processResults } from './process-results'

import type { LintFilesOptions, LintReport } from '@Types/lint'

const lintFiles = async ({ cache, eslintUseLegacyConfig, files, fix }: LintFilesOptions): Promise<LintReport> => {
  try {
    const ESLint = await loadESLint({
      useFlatConfig: !eslintUseLegacyConfig,
    })

    const results = await new ESLint({
      cache,
      cacheLocation: cache ? getCacheDirectory(Linter.ESLint) : undefined,
      fix,
    }).lintFiles(files)

    if (fix) {
      await ESLint.outputFixes(results)
    }

    const report = processResults(results)
    return report
  } catch (error) {
    colourLog.error(`An error occurred while running ${Linter.ESLint}`, error)
    process.exit(1)
  }
}

export {
  lintFiles,
}
