import path from 'node:path'

import { Linter, RuleSeverity } from '@Types/lint'
import { formatResult } from '@Utils/format-result'

import type { LintResult, RuleMeta } from 'stylelint'
import type { LintReport, ReportResults, ReportSummary } from '@Types/lint'

const processResults = (results: Array<LintResult>, ruleMetadata: Record<string, Partial<RuleMeta>>): LintReport => {
  const reportResults: ReportResults = {}
  const reportSummary: ReportSummary = {
    deprecatedRules: [],
    errorCount: 0,
    fileCount: results.length,
    fixableErrorCount: 0,
    fixableWarningCount: 0,
    linter: Linter.Stylelint,
    warningCount: 0,
  }

  const cwd = process.cwd()
  const deprecatedRulesSet = new Set<string>()

  results.forEach(({ deprecations, source, warnings }) => {
    // Normalise source relative to cwd
    const file = source ? path.relative(cwd, source) : 'unknown-source'

    // Process warnings
    warnings.forEach(({ column, line, rule, text, severity }) => {
      if (!reportResults[file]) {
        reportResults[file] = []
      }

      const isWarning = severity === 'warning'

      reportResults[file].push(formatResult({
        column,
        line,
        message: text.replace(`(${rule})`, ''),
        rule,
        severity: isWarning ? RuleSeverity.WARNING : RuleSeverity.ERROR,
      }))

      // Aggregate counts
      reportSummary[isWarning ? 'warningCount' : 'errorCount'] += 1
      if (ruleMetadata[rule]?.fixable) {
        if (isWarning) {
          reportSummary.fixableWarningCount += 1
        } else {
          reportSummary.fixableErrorCount += 1
        }
      }
    })

    // Accumulate deprecated rules, avoiding duplicates
    deprecations.forEach(({ text }) => deprecatedRulesSet.add(text))
  })

  reportSummary.deprecatedRules = Array.from(deprecatedRulesSet).sort()

  return {
    results: reportResults,
    summary: reportSummary,
  }
}

export {
  processResults,
}
