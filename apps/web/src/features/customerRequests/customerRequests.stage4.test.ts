import { beforeEach, describe, expect, it, vi } from "vitest"

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock("@/lib/api", () => ({ api }))
vi.mock("@/features/portalAuth/portalAuth.api", () => ({
  portalApi: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

import { internalRequestApi } from "./customerRequests.api"

describe("customer request Stage 4 API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("sends triage filters, sorting and pagination to the aggregate endpoint", async () => {
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: [],
        meta: {
          total: 0,
          page: 2,
          limit: 20,
          totalPages: 0,
          hasNext: false,
          hasPrevious: true,
        },
      },
    })

    await internalRequestApi.triageList({
      page: 2,
      priority: "URGENT",
      assignedToId: "user-1",
      sortBy: "submittedAt",
      sortOrder: "desc",
    })

    expect(api.get).toHaveBeenCalledWith("/customer-requests/triage", {
      params: expect.objectContaining({
        page: 2,
        priority: "URGENT",
        assignedToId: "user-1",
        sortOrder: "desc",
      }),
    })
  })

  it("preserves the optimistic revision in triage updates", async () => {
    api.patch.mockResolvedValue({ data: { success: true, data: { id: "r1" } } })

    await internalRequestApi.updateTriage("r1", {
      expectedRevision: 4,
      priority: "HIGH",
      assignedToId: "user-2",
      routingDestination: "TASK",
    })

    expect(api.patch).toHaveBeenCalledWith(
      "/customer-requests/r1/triage",
      expect.objectContaining({ expectedRevision: 4, assignedToId: "user-2" })
    )
  })

  it("uses dedicated CRM link endpoints and forwards idempotency keys", async () => {
    api.post.mockResolvedValue({ data: { success: true, data: { id: "link-1" } } })

    await internalRequestApi.createLinkedTask("r1", {
      title: "پیگیری درخواست",
      idempotencyKey: "request-r1-task-1",
    })

    expect(api.post).toHaveBeenCalledWith(
      "/customer-requests/r1/crm-links/tasks",
      expect.objectContaining({ idempotencyKey: "request-r1-task-1" })
    )
  })
})
