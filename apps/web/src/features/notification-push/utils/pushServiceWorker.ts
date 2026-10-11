import { urlBase64ToUint8Array } from "../api/pushNotificationApi"

export const PUSH_SERVICE_WORKER_URL = "/push-sw.js"
export const PUSH_SERVICE_WORKER_SCOPE = "/"
export const PUSH_SERVICE_WORKER_ACTIVATION_TIMEOUT_MS = 15_000

type ServiceWorkerContainerLike = Pick<
  ServiceWorkerContainer,
  "register" | "ready"
>

let subscriptionRequest: Promise<PushSubscription> | null = null

export function validateVapidPublicKey(publicKey: string) {
  let bytes: Uint8Array
  try {
    bytes = urlBase64ToUint8Array(publicKey.trim())
  } catch {
    throw new Error("کلید عمومی VAPID معتبر نیست؛ مدیر سامانه باید کلید عمومی را دوباره تنظیم کند.")
  }
  if (bytes.length !== 65 || bytes[0] !== 4) {
    throw new Error("کلید عمومی VAPID معتبر نیست؛ کلید باید از نوع P-256 و ۶۵ بایتی باشد.")
  }
  const key = new Uint8Array(bytes.length)
  key.set(bytes)
  return key.buffer
}

export function pushSubscriptionError(error: unknown) {
  const candidate = error as { name?: string; message?: string }
  const name = candidate?.name ?? ""
  const message = candidate?.message ?? ""
  if (name === "NotAllowedError") return new Error("اجازه اعلان یا Push در Firefox مسدود شده است؛ مجوز سایت را روی Allow قرار دهید.")
  if (name === "InvalidStateError") return new Error("Service Worker اعلان هنوز آماده نیست؛ صفحه را تازه‌سازی و دوباره تلاش کنید.")
  if (name === "NotSupportedError") return new Error("Push در این مرورگر یا حالت فعلی آن پشتیبانی نمی‌شود.")
  if (name === "AbortError" || /push service|registration failed/i.test(message)) {
    return new Error("مرورگر نتوانست به سرویس Push خود متصل شود. مجوز اعلان، تنظیمات حریم خصوصی یا Shields، اتصال اینترنت، VPN/Proxy و فایروال را بررسی و دوباره تلاش کنید.")
  }
  if (name === "TypeError") return new Error("ساخت اشتراک Push ممکن نشد؛ تنظیمات VAPID یا امنیت HTTPS را بررسی کنید.")
  return error instanceof Error ? error : new Error("ساخت اشتراک اعلان دسکتاپ در مرورگر ناموفق بود.")
}

function expectedScriptUrl() {
  return new URL(PUSH_SERVICE_WORKER_URL, window.location.origin).href
}

function expectedScopeUrl() {
  return new URL(PUSH_SERVICE_WORKER_SCOPE, window.location.origin).href
}

function isExpectedWorker(worker: ServiceWorker | null) {
  if (!worker || worker.state !== "activated") return false
  const actual = new URL(worker.scriptURL, window.location.origin)
  const expected = new URL(expectedScriptUrl())
  return actual.origin === expected.origin && actual.pathname === expected.pathname
}

function isExpectedRegistration(registration: ServiceWorkerRegistration) {
  return registration.scope === expectedScopeUrl() && isExpectedWorker(registration.active)
}

export async function waitForPushServiceWorkerActivation(
  registration: ServiceWorkerRegistration,
  ready: Promise<ServiceWorkerRegistration> = navigator.serviceWorker.ready,
  timeoutMs = PUSH_SERVICE_WORKER_ACTIVATION_TIMEOUT_MS
) {
  if (registration.scope !== expectedScopeUrl()) {
    throw new Error(
      `محدوده سرویس اعلان صحیح نیست. محدوده مورد انتظار ${PUSH_SERVICE_WORKER_SCOPE} است.`
    )
  }
  if (isExpectedRegistration(registration)) return registration

  return new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    let settled = false
    const workers = new Set<ServiceWorker>()

    const cleanup = () => {
      window.clearTimeout(timeout)
      registration.removeEventListener("updatefound", inspect)
      workers.forEach((worker) => worker.removeEventListener("statechange", inspect))
    }
    const finish = (value: ServiceWorkerRegistration) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(value)
    }
    const fail = (message: string) => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error(message))
    }
    const watch = (worker: ServiceWorker | null) => {
      if (!worker || workers.has(worker)) return
      workers.add(worker)
      worker.addEventListener("statechange", inspect)
    }
    function inspect() {
      watch(registration.installing)
      watch(registration.waiting)
      watch(registration.active)
      if (isExpectedRegistration(registration)) {
        finish(registration)
        return
      }

      const candidates = [registration.installing, registration.waiting].filter(
        (worker): worker is ServiceWorker => Boolean(worker)
      )
      const observedWorkers = [...workers]
      if (
        !isExpectedWorker(registration.active) &&
        (candidates.length > 0 || observedWorkers.length > 0) &&
        [...candidates, ...observedWorkers].every(
          (worker) => worker.state === "redundant"
        )
      ) {
        fail(
          "فعال‌سازی سرویس اعلان ناموفق شد. صفحه را تازه‌سازی کنید و دوباره تلاش کنید."
        )
      }
    }

    const timeout = window.setTimeout(() => {
      fail(
        "فعال‌سازی سرویس اعلان بیش از حد طول کشید. اتصال اینترنت را بررسی و دوباره تلاش کنید."
      )
    }, timeoutMs)

    registration.addEventListener("updatefound", inspect)
    inspect()

    // `ready` can help when activation completes between registration events, but
    // only an activated registration with our exact scope and script is accepted.
    void ready
      .then((readyRegistration) => {
        if (isExpectedRegistration(readyRegistration)) finish(readyRegistration)
      })
      .catch(() => {
        // The registration state listeners and bounded timeout remain authoritative.
      })
  })
}

async function subscribeToPush(
  publicKey: string,
  serviceWorkers: ServiceWorkerContainerLike
) {
  if (window.isSecureContext === false) {
    throw new Error("اعلان دسکتاپ فقط روی اتصال امن HTTPS قابل فعال‌سازی است.")
  }
  const applicationServerKey = validateVapidPublicKey(publicKey)
  const registered = await serviceWorkers.register(PUSH_SERVICE_WORKER_URL, {
    scope: PUSH_SERVICE_WORKER_SCOPE,
  })
  const registration = await waitForPushServiceWorkerActivation(
    registered,
    serviceWorkers.ready
  )

  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  try {
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    })
  } catch (error) {
    // A concurrent browser operation may have created the subscription first.
    const createdConcurrently = await registration.pushManager.getSubscription()
    if (createdConcurrently) return createdConcurrently
    throw pushSubscriptionError(error)
  }
}

export function getOrCreatePushSubscription(
  publicKey: string,
  serviceWorkers: ServiceWorkerContainerLike = navigator.serviceWorker
) {
  subscriptionRequest ??= subscribeToPush(publicKey, serviceWorkers).finally(() => {
    subscriptionRequest = null
  })
  return subscriptionRequest
}
