/*
 * MOCKS AND SPIES
 */

jest.mock('chokidar', () => ({
  __esModule: true,
  default: {
    add: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
    unwatch: jest.fn(),
    watch: jest.fn(),
  },
}))

jest.mock('markdownlint', () => ({
  applyFixes: jest.fn(),
}))

jest.mock('markdownlint/promise', () => ({
  lint: jest.fn(),
  readConfig: jest.fn(),
}))

jest.mock('stylelint', () => ({
  __esModule: true,
  default: {
    lint: jest.fn(),
    resolveConfig: jest.fn(),
  },
}))

jest.mock('@Utils/colour-log')

jest.spyOn(process, 'exit').mockImplementation(code => {
  throw new Error(`process.exit(${code})`)
})

/*
 * HOOKS
 */

beforeEach(() => {
  global.debug = false
})

afterEach(() => {
  jest.useRealTimers()
})

/*
 * EXTEND EXPECT
 */

expect.extend({
  toHaveBeenCalledOnceWith(received, ...expected) {
    const calls = received.mock.calls
    const pass = calls.length === 1
      && expected.every((arg, index) => this.equals(calls[0]?.[index], arg))
      && calls[0].length === expected.length

    const printExpected = this.utils.printExpected(expected)
    const printReceived = this.utils.printReceived(calls[0])

    return {
      message: () => `expected ${received.getMockName()} to have been called once with arguments. Expected:\n\n${printExpected}\n\nReceived:\n\n${printReceived}\n`,
      pass,
    }
  },
})
