import { beforeEach, expect, it, vi } from "vitest"

import { api } from "@/lib/api"
import { testCurrentPushNotification } from "./pushNotificationApi"

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

it("uses the authenticated current-user desktop push test endpoint", async () => {
  vi.mocked(api.post).mockResolvedValue({
    data: {
      success: true,
      data: { attempted: 1, successful: 1, failed: 0 },
    },
  })

  await expect(testCurrentPushNotification()).resolves.toMatchObject({
    successful: 1,
  })
  expect(api.post).toHaveBeenCalledWith("/notification-push/test")
})

it("reports a real delivery failure instead of faking a browser notification", async () => {
  vi.mocked(api.post).mockResolvedValue({
    data: {
      success: true,
      data: { attempted: 1, successful: 0, failed: 1 },
    },
  })

  await expect(testCurrentPushNotification()).rejects.toThrow(
    "ارسال اعلان آزمایشی به این دستگاه ناموفق بود"
  )
})
