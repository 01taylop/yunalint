import markdownlint from 'markdownlint'

import { markdownlintError } from '@Jest/fixtures'

import { markdownlintAsync } from '../markdownlint-async'

import type { LintError, Options } from 'markdownlint'

jest.mock('markdownlint')

describe('markdownlintAsync', () => {
  const options: Options = {
    config: {
      default: true,
    },
    files: ['test.md'],
  }

  it('rejects with an error on failure', async () => {
    const error = new Error('Test error')

    jest.mocked(markdownlint).mockImplementationOnce((_options, callback) => callback(error, undefined))

    await expect(markdownlintAsync(options)).rejects.toThrow(error)
  })

  it('resolves with the result on success', async () => {
    const result: Array<LintError> = [markdownlintError]

    jest.mocked(markdownlint).mockImplementationOnce((_options, callback) => callback(null, {
      'test.md': result,
    }))

    await expect(markdownlintAsync(options)).resolves.toStrictEqual({
      'test.md': result,
    })
  })

  it('resolves with an empty object when no result is provided', async () => {
    jest.mocked(markdownlint).mockImplementationOnce((_options, callback) => callback(null, undefined))

    await expect(markdownlintAsync(options)).resolves.toStrictEqual({})
  })

})
