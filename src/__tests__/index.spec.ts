import { ProcessSupervisor } from 'process-supervisor'

import action from '../commands/lint/action'
import { createProgram } from '../program'

import type { LintCommandOptions } from '@Types/commands'

jest.mock('../commands/lint/action')

describe('index - CLI integration', () => {
  const supervisor = new ProcessSupervisor()

  afterEach(async () => {
    if (supervisor.has('file-watcher')) {
      await supervisor.unregister('file-watcher')
    }
  })

  it('calls the lint action by default', async () => {
    expect.assertions(1)

    const program = createProgram({ supervisor })
    await program.parseAsync(['node', './index.ts'], { from: 'user' })

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('calls the lint action with default options', async () => {
    expect.assertions(1)

    const program = createProgram({ supervisor })
    await program.parseAsync(['node', './index.ts', 'lint'], { from: 'user' })

    const expectedOptions: LintCommandOptions = {
      cache: false,
      clearCache: false,
      debug: false,
      emoji: '🌺',
      eslintInclude: undefined,
      eslintUseLegacyConfig: false,
      fix: false,
      ignoreDirs: undefined,
      ignorePatterns: undefined,
      title: 'Yuna',
      watch: false,
    }

    expect(action).toHaveBeenCalledWith(supervisor, expectedOptions)
  })

  it('calls the lint action with configured options', async () => {
    expect.assertions(1)

    const program = createProgram({ supervisor })
    await program.parseAsync([
      'node',
      './index.ts',
      'lint',
      '--cache',
      '--clear-cache',
      '--debug',
      '--emoji', '🚀',
      '--eslint-include', '*.mdx',
      '--eslint-use-legacy-config',
      '--fix',
      '--ignore-dirs', 'node_modules',
      '--ignore-patterns', 'dist',
      '--title', 'Rocket Lint',
      '--watch',
    ], { from: 'user' })

    const expectedOptions: LintCommandOptions = {
      cache: true,
      clearCache: true,
      debug: true,
      emoji: '🚀',
      eslintInclude: ['*.mdx'],
      eslintUseLegacyConfig: true,
      fix: true,
      ignoreDirs: ['node_modules'],
      ignorePatterns: ['dist'],
      title: 'Rocket Lint',
      watch: true,
    }

    expect(action).toHaveBeenCalledWith(supervisor, expectedOptions)
  })

})
