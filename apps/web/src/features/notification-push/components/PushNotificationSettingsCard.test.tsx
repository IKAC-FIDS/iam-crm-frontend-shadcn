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
})
