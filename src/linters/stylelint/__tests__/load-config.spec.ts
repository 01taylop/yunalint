import stylelint from 'stylelint'

import { colourLog } from '@Utils/colour-log'

import defaultConfig from '../../../../config/stylelint.config'
import { loadConfig } from '../load-config'

describe('loadConfig', () => {

  it('returns `undefined` if custom config exists', async () => {
    expect.assertions(3)

    const customConfig = { rules: { 'no-empty-source': true } }

    jest.mocked(stylelint.resolveConfig).mockResolvedValueOnce(customConfig)

    const config = await loadConfig('style.css')

    expect(stylelint.resolveConfig).toHaveBeenCalledOnceWith('style.css')
    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Using custom Stylelint config:', customConfig)
    expect(config).toStrictEqual(undefined)
  })

  it('returns the default config when no file is provided', async () => {
    expect.assertions(3)

    const config = await loadConfig()

    expect(stylelint.resolveConfig).not.toHaveBeenCalled()
    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Using default Stylelint config:', expect.objectContaining(defaultConfig))
    expect(config).toStrictEqual(expect.objectContaining(defaultConfig))
  })

  it('returns the default config when `stylelint.resolveConfig` returns `undefined`', async () => {
    expect.assertions(3)

    jest.mocked(stylelint.resolveConfig).mockResolvedValueOnce(undefined)

    const config = await loadConfig('style.css')

    expect(stylelint.resolveConfig).toHaveBeenCalledOnceWith('style.css')
    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Using default Stylelint config:', expect.objectContaining(defaultConfig))
    expect(config).toStrictEqual(expect.objectContaining(defaultConfig))
  })

  it('returns the default config when `stylelint.resolveConfig` throws with a `ConfigurationError`', async () => {
    expect.assertions(3)

    const configError = Object.assign(new Error('No configuration provided'), { name: 'ConfigurationError' })

    jest.mocked(stylelint.resolveConfig).mockRejectedValueOnce(configError)

    const config = await loadConfig('style.css')

    expect(stylelint.resolveConfig).toHaveBeenCalledOnceWith('style.css')
    expect(colourLog.configDebug).toHaveBeenCalledOnceWith('Using default Stylelint config:', expect.objectContaining(defaultConfig))
    expect(config).toStrictEqual(expect.objectContaining(defaultConfig))
  })

  it('exits the process when `stylelint.resolveConfig` throws an unexpected error', async () => {
    expect.assertions(2)

    const error = new Error('Test error')

    jest.mocked(stylelint.resolveConfig).mockImplementation(() => {
      throw error
    })

    try {
      await loadConfig('style.css')
    } catch {
      expect(colourLog.error).toHaveBeenCalledWith('An error occurred while loading the Stylelint config', error)
      expect(process.exit).toHaveBeenCalledWith(1)
    }
  })

})
