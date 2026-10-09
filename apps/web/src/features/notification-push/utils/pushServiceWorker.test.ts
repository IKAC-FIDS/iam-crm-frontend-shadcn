import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  PUSH_SERVICE_WORKER_SCOPE,
  PUSH_SERVICE_WORKER_URL,
  getOrCreatePushSubscription,
  waitForPushServiceWorkerActivation,
} from "./pushServiceWorker"

class FakeWorker extends EventTarget {
  state: ServiceWorkerState
  scriptURL: string

  constructor(state: ServiceWorkerState, scriptURL?: string) {
    super()
    this.state = state
    this.scriptURL =
      scriptURL ?? new URL(PUSH_SERVICE_WORKER_URL, window.location.origin).href
  }

  setState(state: ServiceWorkerState) {
    this.state = state
    this.dispatchEvent(new Event("statechange"))
  }
}

function registrationWith(worker: FakeWorker, location: "active" | "installing") {
  const subscription = { endpoint: "https://push.example/subscription" } as PushSubscription
  const registration = new EventTarget() as ServiceWorkerRegistration
  Object.assign(registration, {
    scope: new URL(PUSH_SERVICE_WORKER_SCOPE, window.location.origin).href,
    active: location === "active" ? worker : null,
    installing: location === "installing" ? worker : null,
    waiting: null,
    pushManager: {
      getSubscription: vi.fn(async () => null),
      subscribe: vi.fn(async () => subscription),
    },
  })
  return { registration, subscription }
}

describe("push Service Worker activation", () => {
  beforeEach(() => vi.useRealTimers())

  it("registers the expected script and scope on first-time subscription", async () => {
    const worker = new FakeWorker("activated")
    const { registration, subscription } = registrationWith(worker, "active")
    const register = vi.fn(async () => registration)
    const serviceWorkers = {
      register,
      ready: Promise.resolve(registration),
    } as Pick<ServiceWorkerContainer, "register" | "ready">

    await expect(getOrCreatePushSubscription("AQID", serviceWorkers)).resolves.toBe(
      subscription
    )
    expect(register).toHaveBeenCalledWith(PUSH_SERVICE_WORKER_URL, {
      scope: PUSH_SERVICE_WORKER_SCOPE,
    })
    expect(registration.pushManager.subscribe).toHaveBeenCalledOnce()
  })

  it("waits for a delayed installation to become activated", async () => {
    const worker = new FakeWorker("installing")
    const { registration } = registrationWith(worker, "installing")
    const result = waitForPushServiceWorkerActivation(
      registration,
      new Promise<ServiceWorkerRegistration>(() => undefined),
      1_000
    )

    worker.state = "activating"
    worker.dispatchEvent(new Event("statechange"))
    Object.assign(registration, { installing: null, active: worker })
    worker.setState("activated")

    await expect(result).resolves.toBe(registration)
  })

  it("returns an already-active intended registration immediately", async () => {
    const worker = new FakeWorker("activated")
    const { registration } = registrationWith(worker, "active")

    await expect(
      waitForPushServiceWorkerActivation(
        registration,
        new Promise<ServiceWorkerRegistration>(() => undefined)
      )
    ).resolves.toBe(registration)
  })

  it("reports a redundant worker as an actionable activation failure", async () => {
    const worker = new FakeWorker("installing")
    const { registration } = registrationWith(worker, "installing")
    const result = waitForPushServiceWorkerActivation(
      registration,
      new Promise<ServiceWorkerRegistration>(() => undefined),
      1_000
    )

    worker.setState("redundant")

    await expect(result).rejects.toThrow("فعال‌سازی سرویس اعلان ناموفق شد")
  })
})
