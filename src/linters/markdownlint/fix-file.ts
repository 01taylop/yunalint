import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { applyFixes } from 'markdownlint'

import type { LintError } from 'markdownlint'

interface FixFile {
  errors: Array<LintError>
  file: string
}

const fixFile = ({ errors, file }: FixFile) => {
  const filePath = path.join(process.cwd(), file)
  const fileContent = readFileSync(filePath, 'utf8')
  const fixedContent = applyFixes(fileContent, errors)

  writeFileSync(filePath, fixedContent)
}

export {
  fixFile,
}
