import { Linter } from '@Types/lint'

import * as eslint from './eslint'
import * as markdownlint from './markdownlint'
import * as stylelint from './stylelint'

import type { LinterInterface } from '@Types/lint'

const linters: Record<Linter, LinterInterface> = {
  [Linter.ESLint]: eslint,
  [Linter.Markdownlint]: markdownlint,
  [Linter.Stylelint]: stylelint,
}

export {
  linters,
}
