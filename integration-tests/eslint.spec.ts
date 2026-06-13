import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runCli } from './helpers/run-cli'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES_DIR = resolve(__dirname, 'fixtures')
const FIXTURES_CLEAN = resolve(FIXTURES_DIR, 'clean')
const FIXTURES_ERRORS_ESLINT = resolve(FIXTURES_DIR, 'errors/eslint')

describe.each([
  { configArgs: [] as string[], name: 'flat config' },
  { configArgs: ['--eslint-use-legacy-config'], name: 'legacy config' },
])('ESLint - $name', ({ configArgs }) => {
  it('exits 0 when there are no lint errors', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli([...configArgs, '--debug'], FIXTURES_CLEAN)

    expect(exitCode).toBe(0)
    expect(stdout).toContain('Sourced 1 file for ESLint:')
  })

  it('exits 1 and reports ESLint errors in the output', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli([...configArgs], FIXTURES_ERRORS_ESLINT)

    expect(exitCode).toBe(1)
    expect(stdout).toContain('ESLint Error')
  })

  it('exits 0 when the errors directory is excluded via --ignore-dirs', async () => {
    expect.assertions(1)

    const { exitCode } = await runCli([...configArgs, '--ignore-dirs', 'errors'], FIXTURES_DIR)

    expect(exitCode).toBe(0)
  })

  it('exits 0 when error files are excluded via --ignore-patterns', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli([...configArgs, '--ignore-patterns', '**/*.js'], FIXTURES_ERRORS_ESLINT)

    expect(exitCode).toBe(0)
    expect(stdout).toContain('No files found for ESLint.')
  })
})
