import type { Metric } from "web-vitals"

const sensitiveKey =
  /authorization|access.?token|refresh.?token|password|passkey|cookie|secret|pin/i

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]"
  if (Array.isArray(value))
    return value.slice(0, 20).map((item) => sanitize(item, depth + 1))
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        sensitiveKey.test(key) ? "[redacted]" : sanitize(item, depth + 1),
      ])
    )
  }
  if (typeof value === "string" && value.length > 500)
    return `${value.slice(0, 500)}…`
  return value
}

type Context = Record<string, unknown>
export const observability = {
  captureError(error: unknown, context: Context = {}) {
    if (import.meta.env.DEV)
      console.error("[observability]", error, sanitize(context))
  },
  captureMessage(message: string, context: Context = {}) {
    if (import.meta.env.DEV)
      console.info("[observability]", message, sanitize(context))
  },
  recordMetric(metric: Pick<Metric, "name" | "value" | "rating" | "id">) {
    if (import.meta.env.DEV) console.info("[web-vital]", sanitize(metric))
  },
}

export function installGlobalErrorCapture() {
  window.addEventListener("error", (event) =>
    observability.captureError(event.error ?? event.message, {
      source: "window.error",
    })
  )
  window.addEventListener("unhandledrejection", (event) =>
    observability.captureError(event.reason, { source: "unhandledrejection" })
  )
}

export async function reportWebVitals() {
  const { onCLS, onINP, onLCP } = await import("web-vitals")
  onCLS(observability.recordMetric)
  onINP(observability.recordMetric)
  onLCP(observability.recordMetric)
}
