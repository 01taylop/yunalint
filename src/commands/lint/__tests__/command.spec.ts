import { Command } from 'commander'
import { ProcessSupervisor } from 'process-supervisor'

import action from '../action'
import lintCommand from '../command'

jest.mock('../action')

describe('lintCommand', () => {
  let program: Command
  let supervisor: ProcessSupervisor

  beforeEach(() => {
    program = new Command()
    supervisor = new ProcessSupervisor()

    lintCommand(program, supervisor)
  })

  it('registers the lint command', () => {
    const cmd = program.commands.find(cmd => cmd.name() === 'lint')

    expect(cmd).toBeDefined()
  })

  it('sets the description and summary', () => {
    const cmd = program.commands.find(cmd => cmd.name() === 'lint')

    expect(cmd?.description()).toBe('Run all linters: ESLint, Stylelint, and Markdownlint (default command).')
    expect(cmd?.summary()).toBe('run all linters (default command)')
  })

  it('invokes the action handler when the command is executed', async () => {
    await program.parseAsync(['node', 'test', 'lint'], { from: 'user' })

    expect(action).toHaveBeenCalledWith(supervisor, expect.objectContaining({
      fix: false,
      watch: false,
      emoji: '✈️',
      title: 'Lint Pilot',
      cache: false,
      clearCache: false,
      debug: false,
      eslintUseLegacyConfig: false,
    }))
  })

})
