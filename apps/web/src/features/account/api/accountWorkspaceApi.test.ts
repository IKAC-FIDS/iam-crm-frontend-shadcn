import { beforeEach, expect, it, vi } from "vitest"

import { api } from "@/lib/api"
import { getAccountWorkspace } from "./accountWorkspaceApi"

vi.mock("@/lib/api", () => ({ api: { get: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

it("requests only the current account workspace with the selected reporting period", async () => {
  const workspace = {
    period: { startDate: null, endDate: null, defaultedToLast30Days: true },
  }
  vi.mocked(api.get).mockResolvedValue({
    data: { success: true, data: workspace },
  })

  const filters = {
    startDate: "2026-08-18",
    endDate: "2026-09-17",
    recentLimit: 5,
  }
  await expect(getAccountWorkspace(filters)).resolves.toBe(workspace)
  expect(api.get).toHaveBeenCalledWith("/account/workspace", {
    params: filters,
  })
})
