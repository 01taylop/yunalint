import fs from 'node:fs'
import path from 'node:path'

import { readConfig } from 'markdownlint/promise'

import colourLog from '@Utils/colour-log'

import defaultConfig from '../../../../config/markdownlint.json'
import { loadConfig } from '../load-config'

jest.mock('node:fs')

describe('loadConfig', () => {

  it('returns the custom config if it exists', async () => {
    expect.assertions(3)

    jest.mocked(fs.existsSync).mockReturnValueOnce(true)
    jest.mocked(readConfig).mockResolvedValue({ default: true })

    const config = await loadConfig()

    expect(readConfig).toHaveBeenCalledWith(path.join(process.cwd(), '.markdownlint.json'))
    expect(colourLog.configDebug).toHaveBeenCalledWith('Using custom Markdownlint config:', { default: true })
    expect(config).toStrictEqual({ default: true })
  })

  it('returns the default config if no custom config exists', async () => {
    expect.assertions(3)

    jest.mocked(fs.existsSync).mockReturnValueOnce(false)

    const config = await loadConfig()

    expect(readConfig).not.toHaveBeenCalled()
    expect(colourLog.configDebug).toHaveBeenCalledWith('Using default Markdownlint config:', expect.objectContaining(defaultConfig))
    expect(config).toStrictEqual(expect.objectContaining(defaultConfig))
  })

  test.each([
    ['fs.existsSync', fs.existsSync],
    ['readConfig', readConfig],
  ])('exits the process when `%s` throws an error', async (_name, mock) => {
    expect.assertions(2)

    const error = new Error('Test error')

    jest.mocked(mock).mockImplementation(() => {
      throw error
    })

    try {
      await loadConfig()
    } catch {
      expect(colourLog.error).toHaveBeenCalledWith('An error occurred while loading the Markdownlint config', error)
      expect(process.exit).toHaveBeenCalledWith(1)
    }
  })

})
