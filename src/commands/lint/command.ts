import chalk from 'chalk'
import { Command } from 'commander'
import { ProcessSupervisor } from 'process-supervisor'

import action from './action'

const helpText = `
Examples:
  Automatically fix problems:
    ${chalk.gray('$ yuna lint --fix')}
  Watch for file changes and re-run the linters:
    ${chalk.gray('$ yuna lint --watch')}
  Customise the emoji and title:
    ${chalk.gray('$ yuna lint -e 🚀 -t "Rocket Lint"')}
  Enable caching for faster linting:
    ${chalk.gray('$ yuna lint --cache')}
  Clear the cache:
    ${chalk.gray('$ yuna lint --clear-cache')}
  Ignore specific directories:
    ${chalk.gray('$ yuna lint --ignore-dirs generated')}
  Ignore specific file patterns:
    ${chalk.gray('$ yuna lint --ignore-patterns "*.cjs"')}
  Include additional file patterns for ESLint:
    ${chalk.gray('$ yuna lint --eslint-include "**/*.mdx"')}
  Output debug information (e.g., configuration details, error stacks, file paths):
    ${chalk.gray('$ yuna lint --debug')}
  Use legacy ESLint config:
    ${chalk.gray('$ yuna lint --eslint-use-legacy-config')}
  Run all linters with caching, fixing, and watching for changes:
    ${chalk.gray('$ yuna lint --cache --fix --watch')}`

const command = (program: Command, supervisor: ProcessSupervisor) => {
  program
    .command('lint', { isDefault: true })
    .description('Run all linters: ESLint, Stylelint, and Markdownlint (default command).')
    .summary('run all linters (default command)')

    // Core Behaviour Options
    .option('--fix', 'automatically fix problems', false)
    .option('-w, --watch', 'watch for file changes and re-run the linters', false)

    // Customisation Options
    .option('-e, --emoji <string>', 'customise the emoji displayed when running yuna', '🌸')
    .option('-t, --title <string>', 'customise the title displayed when running yuna', 'Yuna')

    // Caching Options
    .option('--cache', 'cache linting results', false)
    .option('--clear-cache', 'clear the cache', false)

    // Ignore and Include Options
    .option('--ignore-dirs <directories...>', 'define directories to ignore')
    .option('--ignore-patterns <patterns...>', 'define file patterns to ignore')
    .option('--eslint-include <patterns...>', 'define additional file patterns for ESLint')

    // Debugging and Legacy Options
    .option('--debug', 'output additional debug information', false)
    .option('--eslint-use-legacy-config', 'use legacy ESLint config', false)

    .action(options => action(supervisor, options))

    .addHelpText('before', 'Command: lint')
    .addHelpText('after', helpText)
    .showHelpAfterError(`\n💡 Run \`yuna lint --help\` for more information.`)
}

export default command
