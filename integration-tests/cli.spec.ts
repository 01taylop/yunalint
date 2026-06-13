import { version } from '../package.json'

import { runCli } from './helpers/run-cli'

describe('CLI', () => {
  it('outputs help text and exits 0', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli(['--help'])

    expect(exitCode).toBe(0)
    expect(stdout).toContain('Usage:')
  })

  it('outputs lint subcommand help text and exits 0', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli(['lint', '--help'])

    expect(exitCode).toBe(0)
    expect(stdout).toContain('--fix')
  })

  it('outputs the version number and exits 0', async () => {
    expect.assertions(2)

    const { exitCode, stdout } = await runCli(['--version'])

    expect(exitCode).toBe(0)
    expect(stdout).toContain(version)
  })

  it('exits 1 for an unknown option', async () => {
    expect.assertions(1)

    const { exitCode } = await runCli(['--unknown-option'])

    expect(exitCode).toBe(1)
  })
})
