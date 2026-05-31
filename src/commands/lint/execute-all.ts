import { executeLinter } from '@Linters/execute'
import { Linter, type FilePatterns } from '@Types/lint'
import colourLog from '@Utils/colour-log'
import { notifyResults } from '@Utils/notifier'
import { logResults, logSummaryBlock } from '@Utils/reporting'

import type { LintCommandOptions } from '@Types/commands'

type ExecuteAllLintersOptions = Pick<LintCommandOptions, 'cache' | 'eslintUseLegacyConfig' | 'fix' | 'title' | 'watch'> & {
  filePatterns: FilePatterns
}

const executeAllLinters = async ({ cache, eslintUseLegacyConfig, filePatterns, fix, title, watch }: ExecuteAllLintersOptions): Promise<void> => {
  const commonArgs = {
    cache,
    eslintUseLegacyConfig,
    fix,
    filePatterns,
  }

  const reports = await Promise.all([
    executeLinter(Linter.ESLint, commonArgs),
    executeLinter(Linter.Markdownlint, commonArgs),
    executeLinter(Linter.Stylelint, commonArgs),
  ])

  reports.forEach(report => {
    logResults(report)
  })

  reports.forEach(({ summary }) => {
    logSummaryBlock(summary)
  })

  const exitCode = notifyResults(reports, title)

  if (watch) {
    colourLog.info('Watching for changes...')
  } else {
    process.exit(exitCode)
  }
}

export {
  executeAllLinters,
}
