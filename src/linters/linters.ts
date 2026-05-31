import { Linter, type LinterInterface } from '@Types/lint'

import eslint from './eslint'
import stylelint from './stylelint'
import markdownlint from './markdownlint'

const linters: Record<Linter, LinterInterface> = {
  [Linter.ESLint]: eslint,
  [Linter.Markdownlint]: markdownlint,
  [Linter.Stylelint]: stylelint,
}

export default linters
