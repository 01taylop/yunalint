import { Linter, RuleSeverity } from '@Types/lint'
import { formatResult } from '@Utils/format-result'

import type { LintResults } from 'markdownlint'
import type { LintReport, ReportResults, ReportSummary } from '@Types/lint'

const processResults = (results: LintResults): LintReport => {
  const reportResults: ReportResults = {}
  const reportSummary: ReportSummary = {
    deprecatedRules: [],
    errorCount: 0,
    fileCount: Object.keys(results).length,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    linter: Linter.Markdownlint,
    warningCount: 0,
  }

  Object.entries(results).forEach(([file, errors]) => {
    if (!errors.length) {
      return
    }

    reportResults[file] = []

    // Process errors
    errors
      .sort((a, b) => a.lineNumber - b.lineNumber || (a.ruleNames.at(1) ?? a.ruleNames[0]).localeCompare(b.ruleNames.at(1) ?? b.ruleNames[0]))
      .forEach(({ errorDetail, errorRange, fixInfo, lineNumber, ruleDescription, ruleNames, severity }) => {
        const isWarning = severity === 'warning'

        reportResults[file].push(formatResult({
          column: errorRange?.length ? errorRange[0] : undefined,
          line: lineNumber,
          message: errorDetail?.length ? `${ruleDescription}: ${errorDetail}` : ruleDescription,
          rule: ruleNames.at(1) ?? ruleNames[0],
          severity: isWarning ? RuleSeverity.WARNING : RuleSeverity.ERROR,
        }))

        // Aggregate counts
        reportSummary[isWarning ? 'warningCount' : 'errorCount'] += 1
        if (fixInfo) {
          if (isWarning) {
            reportSummary.fixableWarningCount += 1
          } else {
            reportSummary.fixableErrorCount += 1
          }
        }
      })
  })

  return {
    results: reportResults,
    summary: reportSummary,
  }
}

export {
  processResults,
}
