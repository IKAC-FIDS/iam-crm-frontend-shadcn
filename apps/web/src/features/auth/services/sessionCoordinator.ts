// Only a random generation marker and event kind are stored. Never credentials/user data.
export const sessionEventKey = "crm-session-event-v1"
export type SessionEvent = { id: string; kind: "logout" | "changed" }
let locallyPublishedId: string | undefined

export function readSessionEvent(): SessionEvent | null {
  const stored = localStorage.getItem(sessionEventKey)
  let value: unknown
  try { value = JSON.parse(stored ?? "null") } catch { return null }
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string" && "kind" in value && (value.kind === "logout" || value.kind === "changed")) return value as SessionEvent
  return null
}

export function publishSessionEvent(kind: SessionEvent["kind"]) {
  const event = { id: crypto.randomUUID(), kind }
  localStorage.setItem(sessionEventKey, JSON.stringify(event))
  locallyPublishedId = event.id
  return event.id
}

/** No lease stealing: an HTTP request may still rotate a cookie after a JS timeout. */
export async function withSessionLock<T>(work: () => Promise<T>, timeoutMs = 45_000): Promise<T> {
  if (!navigator.locks) throw new Error("Secure session coordination requires Web Locks")
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await navigator.locks.request("crm-refresh-cookie-v1", { mode: "exclusive", signal: controller.signal }, async () => {
      clearTimeout(timer)
      return work()
    })
  } finally {
    clearTimeout(timer)
  }
}

export function subscribeSessionEvents(onChange: (event: SessionEvent) => void) {
  let seen = readSessionEvent()?.id
  const sync = () => {
    const current = readSessionEvent()
    // Read current storage, not the event payload: delayed events cannot roll back a session.
    if (current && current.id !== seen) {
      seen = current.id
      if (current.id === locallyPublishedId) return
      onChange(current)
    }
  }
  window.addEventListener("storage", sync)
  window.addEventListener("focus", sync)
  window.addEventListener("pageshow", sync)
  return () => {
    window.removeEventListener("storage", sync)
    window.removeEventListener("focus", sync)
    window.removeEventListener("pageshow", sync)
  }
}
