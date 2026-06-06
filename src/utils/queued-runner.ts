const createQueuedRunner = (fn: () => Promise<void>): () => Promise<void> => {
  let isRunning = false
  let pendingRun = false

  return async () => {
    if (isRunning) {
      pendingRun = true
      return
    }

    isRunning = true

    do {
      pendingRun = false
      await fn()
    } while (pendingRun)

    isRunning = false
  }
}

export {
  createQueuedRunner,
}
