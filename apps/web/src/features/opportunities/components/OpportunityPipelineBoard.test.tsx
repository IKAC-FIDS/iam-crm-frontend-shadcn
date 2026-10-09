import { render } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"

import type { OpportunityStage } from "../types/opportunity.types"

const { usePipelineColumn } = vi.hoisted(() => ({
  usePipelineColumn: vi.fn((...args: [string, unknown, boolean]) => {
    void args
    return {
      data: undefined,
      hasNextPage: false,
      isError: false,
      isFetchingNextPage: false,
      isLoading: false,
      fetchNextPage: vi.fn(),
      refetch: vi.fn(),
    }
  }),
}))

vi.mock("../hooks/useOpportunities", () => ({ usePipelineColumn }))
vi.mock("./OpportunityCard", () => ({ OpportunityCard: () => null }))

import { OpportunityPipelineBoard } from "./OpportunityPipelineBoard"

class IdleIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return []
  }
  readonly root = null
  readonly rootMargin = "0px"
  readonly thresholds = [0]
}

beforeEach(() => {
  usePipelineColumn.mockClear()
  vi.stubGlobal("IntersectionObserver", IdleIntersectionObserver)
})

it("does not request off-screen pipeline columns before intersection", () => {
  const stages: OpportunityStage[] = [
    { id: "stage-1", code: "NEW", label: "جدید", sortOrder: 1 },
    { id: "stage-2", code: "QUALIFIED", label: "واجد شرایط", sortOrder: 2 },
  ]

  render(
    <OpportunityPipelineBoard
      stages={stages}
      transitions={[]}
      filters={{ ownershipScope: "mine", archiveState: "active" }}
      permissions={{
        update: false,
        changeOwner: false,
        changeStage: false,
        archive: false,
        restore: false,
      }}
      onView={vi.fn()}
      onEdit={vi.fn()}
      onChangeOwner={vi.fn()}
      onChangeStage={vi.fn()}
      onArchiveToggle={vi.fn()}
      onDropStage={vi.fn()}
    />
  )

  expect(usePipelineColumn).toHaveBeenCalledTimes(2)
  expect(usePipelineColumn.mock.calls.every((call) => call[2] === false)).toBe(
    true
  )
})
