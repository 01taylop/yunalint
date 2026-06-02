import chalk from 'chalk'

const formatError = (error: Error | string | unknown): string => {
  if (error instanceof Error) {
    return error.stack || error.message
  }
  if (typeof error === 'string') {
    return error
  }
  try {
    return JSON.stringify(error, null, 2)
  } catch {
    return 'Unable to stringify error'
  }
}

const colourLog = {
  config: (key: string, config: Array<string>) => {
    const configString = config.length > 1
      ? `[${config.join(', ')}]`
      : config[0]

    console.log(chalk.magenta(`${key}:`), chalk.dim(configString))
  },

  configDebug: (message: string, config: unknown) => {
    if (global.debug) {
      console.log(`\n${chalk.blue(message)}`)
      console.log(config)
    }
  },

  error: (text: string, error?: Error | string | unknown) => {
    let errorMessage = `\n× ${text}.`
    if (error && global.debug === false) {
      errorMessage += ' Run with --debug for more information.'
    }

    console.error(chalk.red(errorMessage))
    if (error && global.debug === true) {
      console.error(`\n${chalk.gray(formatError(error))}`)
    }
  },

  info: (text: string) => console.log(chalk.blue(text)),

  title: (title: string) => console.log(chalk.cyan(title)),

  warning: (text: string) => console.warn(chalk.yellow(text)),
}

export {
  colourLog,
}
