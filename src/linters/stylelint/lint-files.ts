import stylelint from 'stylelint'

import { Linter } from '@Types/lint'
import colourLog from '@Utils/colour-log'
import { getCacheDirectory } from '@Utils/cache'

import { processResults } from './process-results'

import type { LintFilesOptions, LintReport } from '@Types/lint'

const lintFiles = async ({ cache, files, fix }: LintFilesOptions): Promise<LintReport> => {
  try {
    // Run Stylelint
    const { results, ruleMetadata } = await stylelint.lint({
      allowEmptyInput: true,
      cache,
      cacheLocation: cache ? getCacheDirectory(Linter.Stylelint) : undefined,
      config: { // TODO: Replace with externally loaded or user-provided Stylelint config
        rules: {
          'declaration-block-no-duplicate-properties': true,
        },
      },
      files,
      fix,
      quietDeprecationWarnings: true,
      reportDescriptionlessDisables: true,
      reportInvalidScopeDisables: true,
      reportNeedlessDisables: true,
    })

    // Process results
    const report = processResults(results, ruleMetadata)

    // Return report
    return report
  } catch (error) {
    colourLog.error(`An error occurred while running ${Linter.Stylelint}`, error)
    process.exit(1)
  }
}

export {
  lintFiles,
}
