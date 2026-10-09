const SOUND_PREFERENCE_KEY = "crm.notificationSound.enabled.v1"
const SEEN_EVENTS_KEY = "crm.notificationSound.seen.v1"
const MESSAGE_TYPE = "CRM_PUSH_RECEIVED"
const CHANNEL_NAME = "crm-notification-sound-v1"
const MAX_SEEN_EVENTS = 50
const SEEN_EVENT_TTL_MS = 24 * 60 * 60 * 1000

type AudioContextConstructor = new () => AudioContext
type SoundChannelMessage = {
  type: "candidate" | "played"
  eventId: string
  tabId: string
}

let audioContext: AudioContext | null = null
let audioUnlocked = false

function audioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null
  return window.AudioContext ?? (window as typeof window & {
    webkitAudioContext?: AudioContextConstructor
  }).webkitAudioContext ?? null
}

export function isNotificationSoundEnabled() {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(SOUND_PREFERENCE_KEY) === "true"
}

export async function setNotificationSoundEnabled(enabled: boolean) {
  if (enabled) await unlockNotificationSound()
  window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled))
}

export async function unlockNotificationSound() {
  const AudioContextClass = audioContextConstructor()
  if (!AudioContextClass) throw new Error("پخش صدا در این مرورگر پشتیبانی نمی‌شود.")
  audioContext ??= new AudioContextClass()
  if (audioContext.state === "suspended") await audioContext.resume()
  audioUnlocked = audioContext.state === "running"
  if (!audioUnlocked) throw new Error("مرورگر اجازه پخش صدا را صادر نکرد.")
}

async function playTone() {
  if (!audioContext || !audioUnlocked || audioContext.state !== "running") return false
  const startAt = audioContext.currentTime
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(660, startAt)
  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(0.055, startAt + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.16)
  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + 0.17)
  return true
}

export async function previewNotificationSound() {
  await unlockNotificationSound()
  const played = await playTone()
  if (!played) throw new Error("پخش صدای آزمایشی ممکن نشد.")
}

function readSeenEvents() {
  try {
    const value = JSON.parse(window.localStorage.getItem(SEEN_EVENTS_KEY) || "[]") as unknown
    if (!Array.isArray(value)) return []
    const cutoff = Date.now() - SEEN_EVENT_TTL_MS
    return value
      .filter((item): item is { id: string; at: number } =>
        Boolean(item) && typeof item === "object" &&
        typeof (item as { id?: unknown }).id === "string" &&
        typeof (item as { at?: unknown }).at === "number" &&
        (item as { at: number }).at >= cutoff
      )
      .slice(-MAX_SEEN_EVENTS)
  } catch {
    return []
  }
}

function hasSeenEvent(eventId: string) {
  return readSeenEvents().some((item) => item.id === eventId)
}

function markEventSeen(eventId: string) {
  const events = readSeenEvents().filter((item) => item.id !== eventId)
  events.push({ id: eventId, at: Date.now() })
  try {
    window.localStorage.setItem(SEEN_EVENTS_KEY, JSON.stringify(events.slice(-MAX_SEEN_EVENTS)))
  } catch {
    // Sound remains best-effort when storage is unavailable.
  }
}

async function claimAndPlay(eventId: string) {
  if (document.visibilityState !== "visible" || !isNotificationSoundEnabled() || !audioUnlocked) return
  const run = async () => {
    if (hasSeenEvent(eventId)) return false
    markEventSeen(eventId)
    return playTone()
  }
  if (navigator.locks?.request) {
    await navigator.locks.request(`${CHANNEL_NAME}:${eventId}`, run)
    return
  }
  await run()
}

export function registerNotificationSoundClient() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return () => undefined
  const tabId = window.crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  const Channel = window.BroadcastChannel
  const channel = typeof Channel === "function" ? new Channel(CHANNEL_NAME) : null
  const candidates = new Map<string, Set<string>>()
  const timers = new Map<string, number>()

  const cancelPending = (eventId: string) => {
    const timer = timers.get(eventId)
    if (timer !== undefined) window.clearTimeout(timer)
    timers.delete(eventId)
    candidates.delete(eventId)
  }

  const announceCandidate = (eventId: string) => {
    if (hasSeenEvent(eventId) || candidates.has(eventId)) return
    candidates.set(eventId, new Set([tabId]))
    channel?.postMessage({ type: "candidate", eventId, tabId } satisfies SoundChannelMessage)
    const timer = window.setTimeout(() => {
      timers.delete(eventId)
      const winner = [...(candidates.get(eventId) ?? [])].sort()[0]
      candidates.delete(eventId)
      if (winner !== tabId) return
      void claimAndPlay(eventId).then(() => {
        channel?.postMessage({ type: "played", eventId, tabId } satisfies SoundChannelMessage)
      }).catch(() => undefined)
    }, channel ? 80 : 0)
    timers.set(eventId, timer)
  }

  const onChannelMessage = (event: MessageEvent<SoundChannelMessage>) => {
    const message = event.data
    if (!message || typeof message.eventId !== "string") return
    if (message.type === "played") {
      markEventSeen(message.eventId)
      cancelPending(message.eventId)
      return
    }
    candidates.get(message.eventId)?.add(message.tabId)
  }

  const onServiceWorkerMessage = (event: MessageEvent) => {
    const message = event.data as { type?: unknown; eventId?: unknown } | null
    if (message?.type !== MESSAGE_TYPE || typeof message.eventId !== "string") return
    if (document.visibilityState !== "visible" || !isNotificationSoundEnabled() || !audioUnlocked) return
    announceCandidate(message.eventId)
  }

  const unlockFromInteraction = () => {
    if (isNotificationSoundEnabled() && !audioUnlocked) {
      void unlockNotificationSound().catch(() => undefined)
    }
  }

  channel?.addEventListener("message", onChannelMessage)
  navigator.serviceWorker.addEventListener("message", onServiceWorkerMessage)
  window.addEventListener("pointerdown", unlockFromInteraction, { capture: true })
  window.addEventListener("keydown", unlockFromInteraction, { capture: true })

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer))
    channel?.removeEventListener("message", onChannelMessage)
    channel?.close()
    navigator.serviceWorker.removeEventListener("message", onServiceWorkerMessage)
    window.removeEventListener("pointerdown", unlockFromInteraction, { capture: true })
    window.removeEventListener("keydown", unlockFromInteraction, { capture: true })
  }
}
