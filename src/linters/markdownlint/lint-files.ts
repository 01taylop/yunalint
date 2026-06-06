import { lint } from 'markdownlint/promise'

import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'

import { fixFile } from './fix-file'
import { loadConfig } from './load-config'
import { processResults } from './process-results'

import type { LintFilesOptions, LintReport } from '@Types/lint'

const lintFiles = async ({ files, fix }: LintFilesOptions): Promise<LintReport> => {
  try {
    const config = await loadConfig()
    const markdownlintOptions = {
      config,
      files,
    }

    let results = await lint(markdownlintOptions)

    // Fix errors, then re-run to ensure the report reflects the fixed state
    if (fix) {
      let filesWereFixed = false

      for (const [file, errors] of Object.entries(results)) {
        if (errors.some(error => error.fixInfo)) {
          fixFile({ errors, file })
          filesWereFixed = true
        }
      }

      if (filesWereFixed) {
        results = await lint(markdownlintOptions)
      }
    }

    const report = processResults(results)
    return report
  } catch (error) {
    colourLog.error(`An error occurred while running ${Linter.Markdownlint}`, error)
    process.exit(1)
  }
}

export {
  lintFiles,
}
