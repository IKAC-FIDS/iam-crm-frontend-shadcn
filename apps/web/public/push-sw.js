self.addEventListener("push", (event) => {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch { payload = { body: event.data ? event.data.text() : "" } }
  const safePath = typeof payload.actionUrl === "string" && payload.actionUrl.startsWith("/") && !payload.actionUrl.startsWith("//") ? payload.actionUrl : "/notifications"
  const eventId = String(payload.id || payload.notificationId || payload.deliveryId || (self.crypto.randomUUID ? self.crypto.randomUUID() : `${Date.now()}-${Math.random()}`))
  event.waitUntil((async () => {
    const title = payload.title || "NESHANE OPERATION CENTER"
    const baseOptions = {
      body: payload.body || "",
      data: { actionUrl: safePath, eventId },
      tag: `neshane-push-${eventId}`,
      renotify: true,
      requireInteraction: true,
      silent: false,
      timestamp: Date.now(),
    }
    try {
      await self.registration.showNotification(title, { ...baseOptions, icon: payload.icon || "/neshane-logo.png", badge: payload.badge || "/neshane-logo.png" })
    } catch {
      // A malformed or unsupported image must not prevent the notification itself.
      await self.registration.showNotification(title, baseOptions)
    }
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true })
    clients.forEach((client) => client.postMessage({ type: "CRM_PUSH_RECEIVED", eventId }))
  })())
})
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const path = event.notification.data && event.notification.data.actionUrl || "/notifications"
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const target = new URL(path, self.location.origin).href
    const existing = clients.find((client) => new URL(client.url).origin === self.location.origin)
    if (existing) { existing.navigate(target); return existing.focus() }
    return self.clients.openWindow(target)
  }))
})
