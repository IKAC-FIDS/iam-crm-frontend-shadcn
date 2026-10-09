import { waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  isNotificationSoundEnabled,
  previewNotificationSound,
  registerNotificationSoundClient,
  setNotificationSoundEnabled,
} from "./notificationSound"

describe("notification sound", () => {
  let serviceWorkerMessage: ((event: MessageEvent) => void) | undefined
  let starts = 0

  beforeEach(() => {
    window.localStorage.clear()
    starts = 0
    serviceWorkerMessage = undefined

    class FakeAudioContext {
      state: AudioContextState = "running"
      currentTime = 0
      destination = {}
      resume = vi.fn(async () => undefined)
      createOscillator() {
        return {
          type: "sine",
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: () => { starts += 1 },
          stop: vi.fn(),
        }
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        }
      }
    }

    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: FakeAudioContext,
    })
    Object.defineProperty(window, "BroadcastChannel", {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    })
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        addEventListener: (_type: string, listener: (event: MessageEvent) => void) => {
          serviceWorkerMessage = listener
        },
        removeEventListener: vi.fn(),
      },
    })
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: undefined,
    })
  })

  it("defaults off, unlocks through user actions, and deduplicates genuine push events", async () => {
    expect(isNotificationSoundEnabled()).toBe(false)

    await setNotificationSoundEnabled(true)
    expect(isNotificationSoundEnabled()).toBe(true)

    await previewNotificationSound()
    expect(starts).toBe(1)

    const unregister = registerNotificationSoundClient()
    const pushEvent = { data: { type: "CRM_PUSH_RECEIVED", eventId: "notification-1" } } as MessageEvent
    serviceWorkerMessage?.(pushEvent)
    serviceWorkerMessage?.(pushEvent)

    await waitFor(() => expect(starts).toBe(2))
    await new Promise((resolve) => window.setTimeout(resolve, 10))
    expect(starts).toBe(2)

    await setNotificationSoundEnabled(false)
    serviceWorkerMessage?.({
      data: { type: "CRM_PUSH_RECEIVED", eventId: "notification-2" },
    } as MessageEvent)
    await new Promise((resolve) => window.setTimeout(resolve, 10))
    expect(starts).toBe(2)
    unregister()
  })
})
