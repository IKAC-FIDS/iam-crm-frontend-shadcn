import { describe, expect, it } from "vitest"

import type {
  OpportunityStage,
  OpportunityTransition,
} from "../types/opportunity.types"
import { getAllowedOpportunityStages } from "./opportunityTransitions"

const stages: OpportunityStage[] = [
  { id: "current", code: "CURRENT", label: "فعلی", sortOrder: 1 },
  { id: "target", code: "TARGET", label: "مقصد", sortOrder: 2 },
]

function allowedIds(transitions: OpportunityTransition[], role = "REP") {
  return getAllowedOpportunityStages("current", stages, transitions, role).map(
    (stage) => stage.id
  )
}

describe("getAllowedOpportunityStages", () => {
  it("includes targets allowed from all source stages", () => {
    expect(
      allowedIds([
        {
          id: "all",
          fromStageId: null,
          toStageId: "target",
          role: null,
          isAllowed: true,
        },
      ])
    ).toEqual(["target"])
  })

  it("keeps role-specific rules ahead of generic rules", () => {
    expect(
      allowedIds([
        {
          id: "exact-general",
          fromStageId: "current",
          toStageId: "target",
          role: null,
          isAllowed: true,
        },
        {
          id: "all-role",
          fromStageId: null,
          toStageId: "target",
          role: "REP",
          isAllowed: false,
        },
      ])
    ).toEqual([])
  })

  it("keeps exact-source rules ahead of all-source rules at the same role", () => {
    expect(
      allowedIds([
        {
          id: "all-role",
          fromStageId: null,
          toStageId: "target",
          role: "REP",
          isAllowed: false,
        },
        {
          id: "exact-role",
          fromStageId: "current",
          toStageId: "target",
          role: "REP",
          isAllowed: true,
        },
      ])
    ).toEqual(["target"])
  })
})
