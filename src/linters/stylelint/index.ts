import { lintFiles } from './lint-files'

import type { LinterInterface } from '@Types/lint'

const stylelint: LinterInterface = {
  lintFiles,
}

export {
  stylelint,
}
