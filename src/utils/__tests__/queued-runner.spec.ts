import { createQueuedRunner } from '../queued-runner'

describe('createQueuedRunner', () => {

  it('calls fn immediately', async () => {
    expect.assertions(1)

    const fn = jest.fn().mockResolvedValue(undefined)
    const run = createQueuedRunner(fn)

    await run()

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls fn again after the previous run completes', async () => {
    expect.assertions(1)

    const fn = jest.fn().mockResolvedValue(undefined)
    const run = createQueuedRunner(fn)

    await run()
    await run()

    expect(fn).toHaveBeenCalledTimes(2)
  })

  describe('when called while already running', () => {

    it('queues a single re-run', async () => {
      expect.assertions(1)

      let resolveFirst!: () => void
      const fn = jest.fn()
        .mockImplementationOnce(() => new Promise<void>(resolve => { resolveFirst = resolve }))
        .mockResolvedValue(undefined)

      const run = createQueuedRunner(fn)

      const firstRun = run()
      void run()
      resolveFirst()
      await firstRun

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('deduplicates multiple calls into a single re-run', async () => {
      expect.assertions(1)

      let resolveFirst!: () => void
      const fn = jest.fn()
        .mockImplementationOnce(() => new Promise<void>(resolve => { resolveFirst = resolve }))
        .mockResolvedValue(undefined)

      const run = createQueuedRunner(fn)

      const firstRun = run()
      void run()
      void run()
      void run()
      resolveFirst()
      await firstRun

      expect(fn).toHaveBeenCalledTimes(2)
    })

  })

})
