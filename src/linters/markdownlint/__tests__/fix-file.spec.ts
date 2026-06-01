import { readFileSync, writeFileSync } from 'node:fs'

import { applyFixes } from 'markdownlint-rule-helpers'

import { markdownlintError } from '@Jest/fixtures'

import { fixFile } from '../fix-file'

import type { LintError } from 'markdownlint'

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

jest.mock('markdownlint-rule-helpers', () => ({
  applyFixes: jest.fn(),
}))

describe('fixFile', () => {
  const mockFileContent = 'Original file content'
  const fixedFileContent = 'Fixed file content'

  beforeEach(() => {
    jest.mocked(readFileSync).mockReturnValue(mockFileContent)
    jest.mocked(applyFixes).mockReturnValue(fixedFileContent)
  })

  it('reads the correct file and writes the fixed content back to the file', () => {
    const errors: Array<LintError> = [markdownlintError]
    const filePath = 'test.md'

    fixFile({ errors, file: filePath })

    expect(readFileSync).toHaveBeenCalledWith(`${process.cwd()}/${filePath}`, 'utf8')
    expect(applyFixes).toHaveBeenCalledWith(mockFileContent, errors)
    expect(writeFileSync).toHaveBeenCalledWith(`${process.cwd()}/${filePath}`, fixedFileContent)
  })

})
