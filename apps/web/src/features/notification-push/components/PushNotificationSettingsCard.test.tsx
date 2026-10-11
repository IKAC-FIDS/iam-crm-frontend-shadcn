import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getPushPublicConfig,
  getPushSubscriptions,
} from "../api/pushNotificationApi"
import { PushNotificationSettingsCard } from "./PushNotificationSettingsCard"

vi.mock("../api/pushNotificationApi", () => ({
  getPushPublicConfig: vi.fn(),
  getPushSubscriptions: vi.fn(),
  removePushSubscription: vi.fn(),
  savePushSubscription: vi.fn(),
  testCurrentPushNotification: vi.fn(),
}))
vi.mock("../utils/pushServiceWorker", () => ({
  getOrCreatePushSubscription: vi.fn(),
}))
vi.mock("../utils/notificationSound", () => ({
  isNotificationSoundEnabled: vi.fn(() => false),
  previewNotificationSound: vi.fn(),
  setNotificationSoundEnabled: vi.fn(),
}))

describe("PushNotificationSettingsCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPushPublicConfig).mockResolvedValue({
      provider: "WEB_PUSH",
      enabled: true,
      configured: true,
      publicKey: "public-key",
    })
    vi.mocked(getPushSubscriptions).mockResolvedValue([])
  })

  it("shows a non-intrusive unsupported-browser state", async () => {
    render(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false } },
          })
        }
      >
        <PushNotificationSettingsCard />
      </QueryClientProvider>
    )

    expect(
      await screen.findByText(
        "این مرورگر از اعلان دسکتاپ پشتیبانی نمی‌کند"
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "فعال‌سازی اعلان دسکتاپ" })
    ).toBeDisabled()
    expect(
      screen.getByRole("button", { name: "ارسال اعلان آزمایشی" })
    ).toBeDisabled()
  })

  it("does not treat a stored endpoint as enabled when browser permission returned to default", async () => {
    Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: {} })
    Object.defineProperty(window, "PushManager", { configurable: true, value: class PushManager {} })
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: class Notification {
        static permission = "default"
        static requestPermission = vi.fn()
      },
    })
    window.localStorage.setItem("crm.pushEndpointId", "endpoint-1")
    vi.mocked(getPushSubscriptions).mockResolvedValue([{ id: "endpoint-1", provider: "WEB_PUSH", endpointType: "WEB", active: true, lastSeenAt: "2026-10-11T00:00:00.000Z", createdAt: "2026-10-11T00:00:00.000Z" }])

    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <PushNotificationSettingsCard />
      </QueryClientProvider>
    )

    expect(await screen.findByText("مجوز اعلان این دستگاه صادر نشده است")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "فعال‌سازی اعلان دسکتاپ" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "ارسال اعلان آزمایشی" })).toBeDisabled()
  })
})
