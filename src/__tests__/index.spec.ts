import { ProcessSupervisor } from 'process-supervisor'

import { defaultLintCommandOptions } from '@Jest/fixtures'

import { lintAction } from '../commands/lint/action'
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

  it('calls the lint command by default', async () => {
    expect.assertions(1)

    const program = createProgram({ supervisor })
    await program.parseAsync(['node', './index.ts'], { from: 'user' })

    expect(lintAction).toHaveBeenCalledTimes(1)
  })

  it('calls the lint command with default options', async () => {
    expect.assertions(1)

    const program = createProgram({ supervisor })
    await program.parseAsync([
      'node',
      './index.ts',
      'lint',
    ], { from: 'user' })

    expect(lintAction).toHaveBeenCalledWith(supervisor, defaultLintCommandOptions)
  })

  it('calls the lint command with provided options', async () => {
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

    expect(lintAction).toHaveBeenCalledWith(supervisor, expectedOptions)
  })

})
