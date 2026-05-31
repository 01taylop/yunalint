import chalk from 'chalk'

import colourLog from '../colour-log'

jest.mock('chalk', () => ({
  blue: jest.fn().mockImplementation(text => text),
  cyan: jest.fn().mockImplementation(text => text),
  dim: jest.fn().mockImplementation(text => text),
  gray: jest.fn().mockImplementation(text => text),
  magenta: jest.fn().mockImplementation(text => text),
  red: jest.fn().mockImplementation(text => text),
  yellow: jest.fn().mockImplementation(text => text),
}))

jest.unmock('@Utils/colour-log')

describe('colourLog', () => {

  const mockedConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

  describe('config', () => {

    it('logs the key in magenta and a single config item in dim', () => {
      colourLog.config('setting', ['foo'])

      expect(chalk.magenta).toHaveBeenCalledOnceWith('setting:')
      expect(chalk.dim).toHaveBeenCalledOnceWith('foo')
      expect(mockedConsoleLog).toHaveBeenCalledOnceWith('setting:', 'foo')
    })

    it('logs the key in magenta and the config array in dim', () => {
      colourLog.config('setting', ['foo', 'bar', 'baz'])

      expect(chalk.magenta).toHaveBeenCalledOnceWith('setting:')
      expect(chalk.dim).toHaveBeenCalledOnceWith('[foo, bar, baz]')
      expect(mockedConsoleLog).toHaveBeenCalledOnceWith('setting:', '[foo, bar, baz]')
    })

  })

  describe('configDebug', () => {

    it('does not log if global.debug is false', () => {
      global.debug = false

      colourLog.configDebug('Debug message', 'config')

      expect(chalk.blue).not.toHaveBeenCalled()
      expect(mockedConsoleLog).not.toHaveBeenCalled()
    })

    it('logs the message in blue and the config in default if global.debug is true', () => {
      global.debug = true

      colourLog.configDebug('Debug message', 'config')

      expect(chalk.blue).toHaveBeenCalledOnceWith('Debug message')
      expect(mockedConsoleLog).toHaveBeenCalledTimes(2)
      expect(mockedConsoleLog).toHaveBeenNthCalledWith(1, '\nDebug message')
      expect(mockedConsoleLog).toHaveBeenNthCalledWith(2, 'config')
    })

  })

  describe('error', () => {

    const error = new Error('Oops')
    const mockedConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    it('logs the text in red', () => {
      colourLog.error('An error occurred')

      expect(chalk.red).toHaveBeenCalledOnceWith('\n× An error occurred.')
      expect(mockedConsoleError).toHaveBeenCalledOnceWith('\n× An error occurred.')
    })

    it('logs the text with debug instructions if there is an error and global.debug is false', () => {
      colourLog.error('An error occurred', error)

      expect(chalk.red).toHaveBeenCalledOnceWith('\n× An error occurred. Run with --debug for more information.')
      expect(mockedConsoleError).toHaveBeenCalledOnceWith('\n× An error occurred. Run with --debug for more information.')
    })

    it('logs the error if global.debug is true', () => {
      global.debug = true

      colourLog.error('An error occurred', error)

      expect(mockedConsoleError).toHaveBeenCalledTimes(2)
      expect(mockedConsoleError).toHaveBeenNthCalledWith(1, '\n× An error occurred.')
      expect(mockedConsoleError).toHaveBeenNthCalledWith(2, `\n${error.stack}`)
    })

    it('logs the error message if error is an Error without a stack', () => {
      global.debug = true

      const noStackError = new Error('No stack')
      noStackError.stack = undefined

      colourLog.error('An error occurred', noStackError)

      expect(mockedConsoleError).toHaveBeenCalledTimes(2)
      expect(mockedConsoleError).toHaveBeenNthCalledWith(1, '\n× An error occurred.')
      expect(mockedConsoleError).toHaveBeenNthCalledWith(2, `\n${noStackError.message}`)
    })

    it('logs the error if error is a string', () => {
      global.debug = true

      colourLog.error('An error occurred', 'String error')

      expect(mockedConsoleError).toHaveBeenCalledTimes(2)
      expect(mockedConsoleError).toHaveBeenNthCalledWith(1, '\n× An error occurred.')
      expect(mockedConsoleError).toHaveBeenNthCalledWith(2, '\nString error')
    })

    it('logs the error if error is a plain object', () => {
      global.debug = true

      colourLog.error('An error occurred', { foo: 'bar' })

      expect(mockedConsoleError).toHaveBeenCalledTimes(2)
      expect(mockedConsoleError).toHaveBeenNthCalledWith(1, '\n× An error occurred.')
      expect(mockedConsoleError).toHaveBeenNthCalledWith(2, `\n${JSON.stringify({ foo: 'bar' }, null, 2)}`)
    })

    it('logs a fallback message if error cannot be stringified', () => {
      global.debug = true

      const circular: any = {}
      circular.self = circular

      colourLog.error('An error occurred', circular)

      expect(mockedConsoleError).toHaveBeenCalledTimes(2)
      expect(mockedConsoleError).toHaveBeenNthCalledWith(1, '\n× An error occurred.')
      expect(mockedConsoleError).toHaveBeenNthCalledWith(2, '\nUnable to stringify error')
    })

  })

  describe('info', () => {

    it('logs the text in blue', () => {
      colourLog.info('Starting lint...')

      expect(chalk.blue).toHaveBeenCalledOnceWith('Starting lint...')
      expect(mockedConsoleLog).toHaveBeenCalledOnceWith('Starting lint...')
    })

  })

  describe('title', () => {

    it('logs the title in cyan', () => {
      colourLog.title('🌸 Yuna')

      expect(chalk.cyan).toHaveBeenCalledOnceWith('🌸 Yuna')
      expect(mockedConsoleLog).toHaveBeenCalledOnceWith('🌸 Yuna')
    })

  })

  describe('warning', () => {

    const mockedConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    it('logs the text in yellow', () => {
      colourLog.warning('Be careful!')

      expect(chalk.yellow).toHaveBeenCalledOnceWith('Be careful!')
      expect(mockedConsoleWarn).toHaveBeenCalledOnceWith('Be careful!')
    })

  })

})
