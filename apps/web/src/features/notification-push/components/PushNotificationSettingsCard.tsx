import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BellRing } from "lucide-react"
import { toast } from "sonner"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { Button } from "@workspace/ui/components/button"
import { getPushPublicConfig, getPushSubscriptions, removePushSubscription, savePushSubscription, urlBase64ToUint8Array } from "../api/pushNotificationApi"

export function PushNotificationSettingsCard() {
  const client = useQueryClient()
  const config = useQuery({ queryKey: ["push-public-config"], queryFn: getPushPublicConfig })
  const subscriptions = useQuery({ queryKey: ["push-subscriptions"], queryFn: getPushSubscriptions })
  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
  const enable = useMutation({
    mutationFn: async () => {
      if (!supported || !config.data?.publicKey) throw new Error("اعلان پوش در این مرورگر یا سازمان آماده نیست")
      const permission = await Notification.requestPermission()
      if (permission !== "granted") throw new Error(permission === "denied" ? "اجازه اعلان در مرورگر رد شده است" : "اجازه اعلان صادر نشد")
      const registration = await navigator.serviceWorker.register("/push-sw.js")
      const existing = await registration.pushManager.getSubscription()
      const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(config.data.publicKey) })
      return savePushSubscription(subscription.toJSON())
    },
    onSuccess: async endpoint => {
      window.localStorage.setItem("crm.pushEndpointId", endpoint.id)
      await client.invalidateQueries({ queryKey: ["push-subscriptions"] })
      toast.success("اعلان پوش برای این دستگاه فعال شد.")
    },
    onError: error => toast.error(getApiErrorMessage(error, error instanceof Error ? error.message : "فعال‌سازی اعلان پوش ناموفق بود")),
  })
  const disable = useMutation({ mutationFn: removePushSubscription, onSuccess: async () => { const registration = await navigator.serviceWorker.getRegistration("/push-sw.js"); await (await registration?.pushManager.getSubscription())?.unsubscribe(); window.localStorage.removeItem("crm.pushEndpointId"); await client.invalidateQueries({ queryKey: ["push-subscriptions"] }); toast.success("اعلان پوش این دستگاه غیرفعال شد.") } })
  const count = subscriptions.data?.length ?? 0
  const thisDeviceEndpointId = typeof window === "undefined" ? null : window.localStorage.getItem("crm.pushEndpointId")
  return <article className="rounded-[var(--app-radius-card)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 lg:col-span-2">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 text-lg font-black"><BellRing className="size-5 text-[var(--app-primary)]" />اعلان پوش</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">اعلان کارها و جلسات را حتی وقتی تب سامانه باز نیست دریافت کنید.</p></div><StatusBadge tone={count ? "success" : config.data?.configured ? "warning" : "neutral"}>{!supported ? "مرورگر پشتیبانی نمی‌کند" : Notification.permission === "denied" ? "اجازه مسدود شده" : count ? `${count.toLocaleString("fa-IR")} اشتراک فعال` : config.data?.enabled ? "آماده فعال‌سازی" : "در سازمان غیرفعال"}</StatusBadge></div>
    <div className="mt-4 flex gap-2">{thisDeviceEndpointId && subscriptions.data?.some(item => item.id === thisDeviceEndpointId) ? <Button variant="outline" disabled={disable.isPending} onClick={() => disable.mutate(thisDeviceEndpointId)}>غیرفعال‌کردن این دستگاه</Button> : <Button disabled={!supported || !config.data?.publicKey || enable.isPending} onClick={() => enable.mutate()}>{enable.isPending ? "در حال فعال‌سازی..." : "فعال‌سازی اعلان‌های پوش"}</Button>}</div>
  </article>
}
