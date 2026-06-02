import chalk from 'chalk'
import { spaceLog } from 'space-log'

import { pluralise } from '@Utils/transform'

import type { LintReport, ReportSummary } from '@Types/lint'

const logResults = ({ results, summary }: LintReport) => {
  if (Object.keys(results).length === 0) {
    return
  }

  console.log(chalk.blue(`\nLogging ${summary.linter.toLowerCase()} results:`))

  Object.entries(results).forEach(([file, formattedResults]) => {
    console.log(`\n${chalk.underline(file)}`)
    spaceLog({
      columnKeys: ['severity', 'position', 'message', 'rule'],
      spaceSize: 2,
    }, formattedResults)
  })
}

const logSummary = (summary: ReportSummary, startTime: number) => {
  const { deprecatedRules, errorCount, fileCount, fixableErrorCount, fixableWarningCount, linter, warningCount } = summary

  const log = []

  // Errors
  if (errorCount > 0) {
    let errorMessage = chalk.red(`  ${errorCount} ${pluralise('error', errorCount)}`)
    if (fixableErrorCount) {
      errorMessage += chalk.dim(` (${fixableErrorCount} fixable)`)
    }
    log.push(errorMessage)
  }

  // Warnings
  if (warningCount > 0) {
    let warningMessage = chalk.yellow(`  ${warningCount} ${pluralise('warning', warningCount)}`)
    if (fixableWarningCount) {
      warningMessage += chalk.dim(` (${fixableWarningCount} fixable)`)
    }
    log.push(warningMessage)
  }

  // Deprecations
  const deprecationCount = deprecatedRules.length
  if (deprecationCount) {
    let deprecationMessage = chalk.magenta(`  ${deprecationCount} ${pluralise('deprecation', deprecationCount)}`)
    deprecationMessage += chalk.dim(` [${deprecatedRules.sort((a, b) => a.localeCompare(b)).join(', ')}]`)
    log.push(deprecationMessage)
  }

  // Output
  const finishedLinter = chalk.cyan(`Finished ${linter.toLowerCase()}`)
  const files = `${fileCount} ${pluralise('file', fileCount)}`
  const endTime = `${Date.now() - startTime}ms`

  console.log(`\n${finishedLinter}`, chalk.yellow(`[${files}, ${endTime}]`))
  if (log.length) {
    console.log(log.join('\n'))
  }
}

const logSummaryBlock = ({ errorCount, linter, warningCount }: ReportSummary) => {
  // Errors
  if (errorCount > 0) {
    const message = chalk.bgRed.black(` ${errorCount} ${linter} ${pluralise('Error', errorCount)} `)
    console.log(`\n🚨 ${message}`)
  }

  // Warnings
  if (warningCount > 0) {
    const message = chalk.bgYellow.black(` ${warningCount} ${linter} ${pluralise('Warning', warningCount)} `)
    console.log(`\n🚧 ${message}`)
  }

  // Success
  if (errorCount === 0 && warningCount === 0) {
    const message = chalk.bgGreen.black(` ${linter} Success! `)
    console.log(`\n✅ ${message}`)
  }
}

export {
  logResults,
  logSummary,
  logSummaryBlock,
}
