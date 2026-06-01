import { lintFiles } from './lint-files'

import type { LinterInterface } from '@Types/lint'

const eslint: LinterInterface = {
  lintFiles,
}

export {
  eslint,
}
