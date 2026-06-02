import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'
import { logSummary } from '@Utils/reporting'
import { sourceFiles } from '@Utils/source-files'

import { linters } from './linters'

import type { LintCommandOptions } from '@Types/commands'
import type { FilePatterns, LintReport } from '@Types/lint'

type ExecuteLinterOptions = Pick<LintCommandOptions, 'cache' | 'eslintUseLegacyConfig' | 'fix'> & {
  filePatterns: FilePatterns
}

const executeLinter = async (linter: Linter, { cache, eslintUseLegacyConfig, filePatterns, fix }: ExecuteLinterOptions): Promise<LintReport> => {
  const startTime = Date.now()
  colourLog.info(`Running ${linter.toLowerCase()}...`)

  const files = await sourceFiles(filePatterns, linter)

  const report = await linters[linter].lintFiles({
    cache,
    eslintUseLegacyConfig,
    files,
    fix,
  })

  logSummary(report.summary, startTime)

  return report
}

export {
  executeLinter,
}
