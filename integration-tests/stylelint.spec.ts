import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runCli } from './helpers/run-cli'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = resolve(__dirname, 'fixtures')
const FIXTURES_CLEAN = resolve(FIXTURES_DIR, 'clean')
const FIXTURES_ERRORS_STYLELINT = resolve(FIXTURES_DIR, 'errors/stylelint')

describe('Stylelint - default config', () => {
  it('exits 0 when there are no lint errors', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli(['--debug'], FIXTURES_CLEAN)

    expect(exitCode).toBe(0)
    expect(stdout).toContain('Sourced 1 file for Stylelint:')
  })

  it('exits 1 and reports Stylelint errors in the output', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli([], FIXTURES_ERRORS_STYLELINT)

    expect(exitCode).toBe(1)
    expect(stdout).toContain('Stylelint Error')
  })

  it('exits 0 when error files are excluded via --ignore-patterns', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli(['--ignore-patterns', '**/*.css'], FIXTURES_ERRORS_STYLELINT)

    expect(exitCode).toBe(0)
    expect(stdout).toContain('No files found for Stylelint.')
  })
})

describe('Stylelint - custom config', () => {
  it.todo('exits 0 when there are no lint errors')
  it.todo('exits 1 and reports Stylelint errors in the output')
  it.todo('exits 0 when error files are excluded via --ignore-patterns')
})
