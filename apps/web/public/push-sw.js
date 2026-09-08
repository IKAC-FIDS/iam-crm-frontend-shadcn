self.addEventListener("push", (event) => {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch { payload = { body: event.data ? event.data.text() : "" } }
  const safePath = typeof payload.actionUrl === "string" && payload.actionUrl.startsWith("/") && !payload.actionUrl.startsWith("//") ? payload.actionUrl : "/notifications"
  event.waitUntil(self.registration.showNotification(payload.title || "NESHANE OPERATION CENTER", { body: payload.body || "", icon: payload.icon || "/neshane-logo.png", badge: payload.badge || "/neshane-logo.png", data: { actionUrl: safePath } }))
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
