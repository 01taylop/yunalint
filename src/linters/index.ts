import { Linter } from '@Types/lint'
import { colourLog } from '@Utils/colour-log'
import { logSummary } from '@Utils/reporting'
import { sourceFiles } from '@Utils/source-files'

import * as eslint from './eslint'
import * as markdownlint from './markdownlint'
import * as stylelint from './stylelint'

import type { LintCommandOptions } from '@Types/commands'
import type { FilePatterns, LinterInterface, LintReport } from '@Types/lint'

type ExecuteLinterOptions = Pick<LintCommandOptions, 'cache' | 'eslintUseLegacyConfig' | 'fix'> & {
  filePatterns: FilePatterns
}

const linters: Record<Linter, LinterInterface> = {
  [Linter.ESLint]: eslint,
  [Linter.Markdownlint]: markdownlint,
  [Linter.Stylelint]: stylelint,
}

const executeLinter = async (linter: Linter, { cache, eslintUseLegacyConfig, filePatterns, fix }: ExecuteLinterOptions): Promise<LintReport> => {
  const startTime = Date.now()
  colourLog.info(`Running ${linter.toLowerCase()}...`)

  const files = await sourceFiles(linter, filePatterns)

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
