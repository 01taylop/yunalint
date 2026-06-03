import path from 'node:path'

import stylelint from 'stylelint'

import { colourLog } from '@Utils/colour-log'

import defaultConfig from '../../../../config/stylelint.config'
import { loadConfig } from '../load-config'

describe('loadConfig', () => {

  test.each([
    ['a file is provided', 'index.css', path.join(process.cwd(), 'index.css')],
    ['no file is provided', undefined, path.join(process.cwd(), 'style.css')],
  ])('calls `stylelint.resolveConfig` with the correct search path when %s', async (_title, filePath, expectedPath) => {
    expect.assertions(1)

    await loadConfig(filePath)

    expect(stylelint.resolveConfig).toHaveBeenCalledOnceWith(expectedPath)
  })

  it('returns undefined if custom config exists', async () => {
    expect.assertions(2)

    const customConfig = { rules: { 'no-empty-source': true } }

    jest.mocked(stylelint.resolveConfig).mockResolvedValueOnce(customConfig)

    const config = await loadConfig('index.css')

    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Using custom Stylelint config:', customConfig)
    expect(config).toStrictEqual(undefined)
  })

  it('returns the default config if no custom config exists', async () => {
    expect.assertions(2)

    jest.mocked(stylelint.resolveConfig).mockResolvedValueOnce(undefined)

    const config = await loadConfig()

    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Using default Stylelint config:', expect.objectContaining(defaultConfig))
    expect(config).toStrictEqual(expect.objectContaining(defaultConfig))
  })

  it('exits the process when `stylelint.resolveConfig` throws an error', async () => {
    expect.assertions(2)

    const error = new Error('Test error')

    jest.mocked(stylelint.resolveConfig).mockImplementation(() => {
      throw error
    })

    try {
      await loadConfig()
    } catch {
      expect(colourLog.error).toHaveBeenCalledWith('An error occurred while loading the Stylelint config', error)
      expect(process.exit).toHaveBeenCalledWith(1)
    }
  })

})
