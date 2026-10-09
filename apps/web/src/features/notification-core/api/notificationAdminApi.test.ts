import { beforeEach, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { createDigestPolicy, dispatchNotificationDelivery, getNotificationDeliveries, getNotificationDelivery, getQuietHours, updateQuietHours } from "./notificationAdminApi"

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

it("preserves top-level pagination metadata for the delivery center", async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [], meta: { total: 23, page: 2, limit: 10, totalPages: 3 } } })
  const result = await getNotificationDeliveries({ page: 2, pageSize: 10, status: "FAILED" })
  expect(api.get).toHaveBeenCalledWith("/admin/notification-deliveries", { params: { page: 2, pageSize: 10, status: "FAILED" } })
  expect(result.meta).toMatchObject({ total: 23, page: 2, totalPages: 3, hasNext: true, hasPrevious: true })
})

it("uses the tenant-scoped policy endpoints for quiet hours and digests", async () => {
  const quiet = { enabled: true, startTime: "22:00", endTime: "07:00", timezone: "Asia/Tehran", channels: ["SMS" as const], allowCritical: true, mode: "DEFER" as const }
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: quiet } })
  vi.mocked(api.patch).mockResolvedValue({ data: { success: true, data: quiet } })
  vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: { id: "digest-1" } } })
  await getQuietHours(); await updateQuietHours(quiet)
  await createDigestPolicy({ name: "روزانه", enabled: true, frequency: "DAILY", sendTime: "09:00", timezone: "Asia/Tehran", eventNames: ["TASK.OVERDUE"], channels: ["EMAIL"] })
  expect(api.get).toHaveBeenCalledWith("/admin/notification-policies/quiet-hours")
  expect(api.patch).toHaveBeenCalledWith("/admin/notification-policies/quiet-hours", quiet)
  expect(api.post).toHaveBeenCalledWith("/admin/notification-policies/digests", expect.objectContaining({ eventNames: ["TASK.OVERDUE"] }))
})

it("loads safe delivery detail and retries the existing delivery endpoint", async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: { id: "delivery-1" } } })
  vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: { id: "delivery-1", status: "RETRYING" } } })
  await getNotificationDelivery("delivery-1")
  const retried = await dispatchNotificationDelivery("delivery-1")
  expect(api.get).toHaveBeenCalledWith("/admin/notification-deliveries/delivery-1")
  expect(api.post).toHaveBeenCalledWith("/admin/notification-deliveries/delivery-1/retry")
  expect(retried).toMatchObject({ id: "delivery-1", status: "RETRYING" })
})
