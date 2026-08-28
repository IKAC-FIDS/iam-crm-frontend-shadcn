import { enumParam } from "@/lib/listQuery"
import type { OpportunityFilters } from "../types/opportunity.types"

export const opportunityFilterKeys = [
  "search",
  "ownershipScope",
  "companyId",
  "ownerId",
  "teamId",
  "team",
  "stageId",
  "priority",
  "sourceOptionId",
  "primaryContactId",
  "expectedCloseFrom",
  "expectedCloseTo",
  "archiveState",
] as const
export function readOpportunityFilters(
  params: URLSearchParams
): OpportunityFilters {
  const value = (key: string) => params.get(key) || undefined
  return {
    search: value("search"),
    ownershipScope: enumParam(
      params.get("ownershipScope"),
      ["all", "mine", "team", "unassigned"],
      "all"
    ),
    archiveState: enumParam(
      params.get("archiveState"),
      ["active", "archived", "all"],
      "active"
    ),
    companyId: value("companyId"),
    ownerId: value("ownerId"),
    teamId: value("teamId"),
    team: value("team"),
    stageId: value("stageId"),
    priority:
      enumParam(
        params.get("priority"),
        ["", "LOW", "MEDIUM", "HIGH", "STRATEGIC"],
        ""
      ) || undefined,
    sourceOptionId: value("sourceOptionId"),
    primaryContactId: value("primaryContactId"),
    expectedCloseFrom: value("expectedCloseFrom"),
    expectedCloseTo: value("expectedCloseTo"),
  }
}
