import type { LintError } from 'markdownlint'

const markdownlintError: LintError = {
  errorContext: 'test-error-context',
  errorDetail: 'test-error-detail',
  errorRange: [1, 2],
  lineNumber: 1,
  ruleDescription: 'test-rule-description',
  ruleInformation: 'test-rule-information',
  ruleNames: ['MD000', 'test-rule-name'],
}

const fixableMarkdownlintError: LintError = {
  ...markdownlintError,
  fixInfo: {
    insertText: 'test-insert-text',
    lineNumber: 1,
  },
}

export {
  fixableMarkdownlintError,
  markdownlintError,
}
