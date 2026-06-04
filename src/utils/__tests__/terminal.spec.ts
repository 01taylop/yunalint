import { clearTerminal } from '../terminal'

describe('clearTerminal', () => {

  it('calls `process.stdout.write` to clear the terminal', () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true)

    clearTerminal()

    expect(stdoutSpy).toHaveBeenCalledOnceWith('\x1Bc\x1B[3J\x1B[2J\x1B[H')
  })

})
