import '@jest/globals'

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledOnceWith(...args: Array<unknown>): R
    }
  }
}
