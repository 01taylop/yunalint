import { lintFiles } from './lint-files'

import type { LinterInterface } from '@Types/lint'

const markdownlint: LinterInterface = {
  lintFiles,
}

export {
  markdownlint,
}
