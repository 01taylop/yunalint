import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runCli } from './helpers/run-cli'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = resolve(__dirname, 'fixtures')
const FIXTURES_CLEAN = resolve(FIXTURES_DIR, 'clean')
const FIXTURES_ERRORS_MARKDOWNLINT = resolve(FIXTURES_DIR, 'errors/markdownlint')

describe('Markdownlint', () => {
  it('exits 0 when there are no lint errors', async () => {
    expect.assertions(3)

    const { exitCode, stdout } = await runCli(['--debug'], FIXTURES_CLEAN)

    expect(exitCode).toBe(0)
    expect(stdout).toContain('Sourced 1 file for Markdownlint:')
    expect(stdout).toContain('Using default Markdownlint config:')
  })

  it('exits 1 and reports Markdownlint errors in the output', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli([], FIXTURES_ERRORS_MARKDOWNLINT)

    expect(exitCode).toBe(1)
    expect(stdout).toContain('Markdownlint Error')
  })

  it('exits 0 when error files are excluded via --ignore-patterns', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli(['--ignore-patterns', '**/*.md'], FIXTURES_ERRORS_MARKDOWNLINT)

    expect(exitCode).toBe(0)
    expect(stdout).toContain('No files found for Markdownlint.')
  })
})
