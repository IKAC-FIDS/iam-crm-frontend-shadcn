import { beforeEach, describe, expect, it, vi } from "vitest"

import { api } from "@/lib/api"

import { getOpportunities } from "./opportunities.api"
import { readOpportunityFilters } from "../utils/opportunityQuery"

vi.mock("@/lib/api", () => ({ api: { get: vi.fn() } }))

const emptyPage = {
  success: true,
  data: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
}

describe("opportunity overdue-stage filter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.get).mockResolvedValue({ data: emptyPage })
  })

  it("restores the active filter from URL state", () => {
    const filters = readOpportunityFilters(
      new URLSearchParams("stageOverdueOnly=true&ownershipScope=mine")
    )

    expect(filters.stageOverdueOnly).toBe(true)
    expect(filters.ownershipScope).toBe("mine")
  })

  it("sends the server-side filter alongside existing list or pipeline filters", async () => {
    await getOpportunities({
      page: 1,
      limit: 20,
      ownershipScope: "mine",
      archiveState: "active",
      stageId: "stage-1",
      stageOverdueOnly: true,
    })

    expect(api.get).toHaveBeenCalledWith("/opportunities", {
      params: expect.objectContaining({
        page: 1,
        limit: 20,
        ownershipScope: "mine",
        stageId: "stage-1",
        stageOverdueOnly: "true",
      }),
    })
  })

  it("does not enable the server parameter after the filter is reset", async () => {
    await getOpportunities({
      page: 1,
      limit: 20,
      ownershipScope: "all",
      archiveState: "active",
    })

    const [, config] = vi.mocked(api.get).mock.calls[0]
    expect(config).toEqual(expect.objectContaining({
      params: expect.objectContaining({ stageOverdueOnly: undefined }),
    }))
  })
})
