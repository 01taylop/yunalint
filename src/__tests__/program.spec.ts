import chalk from 'chalk'
import { ProcessSupervisor } from 'process-supervisor'

import { description, name, version } from '../../package.json'
import { createProgram } from '../program'

jest.mock('chalk', () => ({
  gray: jest.fn().mockImplementation(text => text),
  red: jest.fn().mockImplementation(text => text),
}))

const EXPECTED_HELP_TEXT = `Usage: ${name} [options] [command]

${description}

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  lint [options]  run all linters (default command)
  help [command]  display help for command
`

describe('createProgram', () => {
  const supervisor = new ProcessSupervisor()

  it('sets the program name', () => {
    const program = createProgram({ supervisor })

    expect(program.name()).toBe(name)
  })

  it('sets the program description', () => {
    const program = createProgram({ supervisor })

    expect(program.description()).toBe(description)
  })

  it('sets the program version', () => {
    const program = createProgram({ supervisor })

    expect(program.version()).toBe(version)
  })

  it('configures the help text', () => {
    const helpInformation = createProgram({ supervisor })
      .configureHelp({ helpWidth: -1 })
      .helpInformation()

    expect(helpInformation).toStrictEqual(EXPECTED_HELP_TEXT)
  })

  it('displays the help text', () => {
    expect.assertions(5)

    const writeOutMock = jest.fn()

    const program = createProgram({ supervisor })
      .configureHelp({ helpWidth: -1 })
      .configureOutput({ writeOut: writeOutMock })

    try {
      program.parse(['node', './index.ts', '--help'])
    } catch (e: unknown) {
      expect((e as Error).message).toMatch('process.exit(0)')
    }

    expect(writeOutMock).toHaveBeenCalledTimes(3)
    expect(writeOutMock).toHaveBeenNthCalledWith(1, expect.stringMatching('\n🌺 Yuna\n'))
    expect(writeOutMock).toHaveBeenNthCalledWith(2, EXPECTED_HELP_TEXT)
    expect(writeOutMock).toHaveBeenNthCalledWith(3, expect.stringContaining('Examples:'))
  })

  it('displays the version', () => {
    expect.assertions(3)

    const writeOutMock = jest.fn()

    const program = createProgram({ supervisor })
      .configureOutput({ writeOut: writeOutMock })

    try {
      program.parse(['node', './index.ts', '--version'])
    } catch (e: unknown) {
      expect((e as Error).message).toMatch('process.exit(0)')
    }

    expect(writeOutMock).toHaveBeenCalledTimes(1)
    expect(writeOutMock).toHaveBeenNthCalledWith(1, expect.stringMatching(version))
  })

  it('handles unknown options', () => {
    expect.assertions(4)

    const writeErrMock = jest.fn()

    const program = createProgram({ supervisor })
    program.commands.forEach(cmd => cmd.configureOutput({ writeErr: writeErrMock }))

    try {
      program.parse(['node', './index.ts', '--unknown'])
    } catch (e: unknown) {
      expect((e as Error).message).toMatch('process.exit(1)')
    }

    expect(chalk.red).toHaveBeenCalledOnceWith(expect.stringContaining('× unknown option \'--unknown\''))
    expect(writeErrMock).toHaveBeenNthCalledWith(1, expect.stringContaining('× unknown option \'--unknown\''))
    expect(writeErrMock).toHaveBeenNthCalledWith(2, expect.stringContaining('\n💡 Run `yuna lint --help` for more information.'))
  })

  it('registers the lint command', () => {
    const program = createProgram({ supervisor })
    const cmd = program.commands.find(cmd => cmd.name() === 'lint')

    expect(cmd).toBeDefined()
  })

})
