import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export type PushEndpoint = { id: string; provider: string; endpointType: string; active: boolean; lastSeenAt: string; createdAt: string }
export async function getPushPublicConfig() {
  const response = await api.get("/notification-push/public-config")
  return unwrapApiResponse<{ provider: string; enabled: boolean; configured: boolean; publicKey: string | null }>(response.data)
}
export async function getPushSubscriptions() {
  const response = await api.get("/notification-push/subscriptions")
  return unwrapApiResponse<PushEndpoint[]>(response.data)
}
export async function savePushSubscription(subscription: PushSubscriptionJSON) {
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys.auth) throw new Error("اشتراک پوش مرورگر ناقص است")
  const response = await api.post("/notification-push/subscriptions", { endpoint: subscription.endpoint, expirationTime: subscription.expirationTime, keys: subscription.keys, label: navigator.userAgent })
  return unwrapApiResponse<PushEndpoint>(response.data)
}
export async function removePushSubscription(id: string) {
  const response = await api.delete(`/notification-push/subscriptions/${id}`)
  return unwrapApiResponse<{ disabled: boolean }>(response.data)
}

export function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const raw = window.atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)))
}
