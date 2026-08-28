// FIFO model of the Web Locks contract; browser lifecycle itself is not emulated.
export function createTestLockManager(): LockManager {
  let tail = Promise.resolve()
  return {
    request: async (_name: string, options: LockOptions, callback: (lock: Lock) => unknown) => {
      let release!: () => void
      const before = tail
      tail = new Promise<void>(resolve => { release = resolve })
      let abort!: () => void
      const aborted = new Promise<never>((_, reject) => {
        abort = () => reject(new DOMException("Aborted", "AbortError"))
        options.signal?.addEventListener("abort", abort, { once: true })
        if (options.signal?.aborted) abort()
      })
      try {
        await Promise.race([before, aborted])
        options.signal?.removeEventListener("abort", abort)
        return await callback({ name: _name, mode: "exclusive" })
      } finally {
        options.signal?.removeEventListener("abort", abort)
        // An aborted waiter may not release the lock still owned by its predecessor.
        void before.then(release)
      }
    },
    query: async () => ({ held: [], pending: [] }),
  } as unknown as LockManager
}
