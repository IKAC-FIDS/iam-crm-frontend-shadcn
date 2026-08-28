import { afterEach, describe, expect, it, vi } from "vitest"
import { publishSessionEvent, readSessionEvent, sessionEventKey, subscribeSessionEvents, withSessionLock } from "./sessionCoordinator"
import { createTestLockManager } from "@/test/lockManager"

afterEach(() => { vi.useRealTimers(); localStorage.clear() })
describe("cross-tab cookie ownership", () => {
  it("serializes independent tab requests so each reads the newest cookie", async () => {
    let cookie = 1
    const read: number[] = []
    const refresh = () => withSessionLock(async () => {
      const before = cookie
      read.push(before)
      await Promise.resolve()
      expect(cookie).toBe(before)
      cookie++
    })
    await Promise.all([refresh(), refresh(), refresh()])
    expect(read).toEqual([1, 2, 3])
  })
  it("releases ownership after owner failure", async () => {
    const first = withSessionLock(async () => { throw new Error("owner failure") })
    const second = withSessionLock(async () => "recovered")
    await expect(first).rejects.toThrow()
    await expect(second).resolves.toBe("recovered")
  })
  it("times out waiting without stealing ownership or sending an unsafe request", async () => {
    vi.useFakeTimers()
    let release!: () => void
    const owner = withSessionLock(() => new Promise<void>(resolve => { release = resolve }))
    await Promise.resolve(); await Promise.resolve()
    const request = vi.fn(async () => undefined)
    const waiter = withSessionLock(request, 100)
    const rejected = expect(waiter).rejects.toThrow()
    await vi.advanceTimersByTimeAsync(101)
    await rejected
    expect(request).not.toHaveBeenCalled()
    release(); await owner
  })
  it("fails closed on browsers without Web Locks", async () => {
    Object.defineProperty(navigator, "locks", { configurable: true, value: undefined })
    const work = vi.fn(async () => undefined)
    await expect(withSessionLock(work)).rejects.toThrow("Web Locks")
    expect(work).not.toHaveBeenCalled()
    Object.defineProperty(navigator, "locks", { configurable: true, value: createTestLockManager() })
  })
  it("shares only non-secret logout/session-change markers and ignores stale notifications", () => {
    const receive = vi.fn()
    const stop = subscribeSessionEvents(receive)
    localStorage.setItem(sessionEventKey, JSON.stringify({ id: "remote-logout", kind: "logout" }))
    const previous = localStorage.getItem(sessionEventKey)
    const newest = "remote-tenant-change"
    localStorage.setItem(sessionEventKey, JSON.stringify({ id: newest, kind: "changed" }))
    window.dispatchEvent(new StorageEvent("storage", { key: sessionEventKey, newValue: previous }))
    expect(receive).toHaveBeenCalledWith({ id: newest, kind: "changed" })
    window.dispatchEvent(new Event("focus"))
    expect(receive).toHaveBeenCalledTimes(1)
    expect(Object.keys(readSessionEvent()!)).toEqual(["id", "kind"])
    stop()
  })
  it("does not treat its own login notification as a remote logout on focus", () => {
    const receive = vi.fn()
    const stop = subscribeSessionEvents(receive)
    publishSessionEvent("changed")
    window.dispatchEvent(new Event("focus"))
    expect(receive).not.toHaveBeenCalled()
    stop()
  })
})
