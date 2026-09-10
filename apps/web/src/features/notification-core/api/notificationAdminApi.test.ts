import { beforeEach, expect, it, vi } from "vitest"
import { api } from "@/lib/api"
import { dispatchNotificationDelivery, getNotificationDeliveries, getNotificationDelivery } from "./notificationAdminApi"

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

it("preserves top-level pagination metadata for the delivery center", async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [], meta: { total: 23, page: 2, limit: 10, totalPages: 3 } } })
  const result = await getNotificationDeliveries({ page: 2, pageSize: 10, status: "FAILED" })
  expect(api.get).toHaveBeenCalledWith("/admin/notification-deliveries", { params: { page: 2, pageSize: 10, status: "FAILED" } })
  expect(result.meta).toMatchObject({ total: 23, page: 2, totalPages: 3, hasNext: true, hasPrevious: true })
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
