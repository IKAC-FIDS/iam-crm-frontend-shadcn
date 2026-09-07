export function safeNotificationActionUrl(value?: string | null): string | null {
  if (!value) return null
  try {
    const decoded = decodeURIComponent(value)
    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.includes("\\") || [...decoded].some(char => char.charCodeAt(0) <= 32)) return null
    const url = new URL(value, "https://notification.internal")
    return url.origin === "https://notification.internal" ? value : null
  } catch { return null }
}

export function notificationInboxState(notification: { readAt?: string | null; archivedAt?: string | null }) {
  if (notification.archivedAt) return "بایگانی‌شده"
  return notification.readAt ? "خوانده‌شده" : "خوانده‌نشده"
}
