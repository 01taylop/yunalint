import { Linter, type LinterInterface } from '@Types/lint'

import { eslint } from './eslint'
import { markdownlint } from './markdownlint'
import { stylelint } from './stylelint'

const linters: Record<Linter, LinterInterface> = {
  [Linter.ESLint]: eslint,
  [Linter.Markdownlint]: markdownlint,
  [Linter.Stylelint]: stylelint,
}

export default linters
