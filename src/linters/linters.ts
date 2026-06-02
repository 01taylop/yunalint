import { Linter } from '@Types/lint'

import { eslint } from './eslint'
import { markdownlint } from './markdownlint'
import { stylelint } from './stylelint'

import type { LinterInterface } from '@Types/lint'

const linters: Record<Linter, LinterInterface> = {
  [Linter.ESLint]: eslint,
  [Linter.Markdownlint]: markdownlint,
  [Linter.Stylelint]: stylelint,
}

export {
  linters,
}
