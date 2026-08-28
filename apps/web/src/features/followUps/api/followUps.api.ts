import { z } from "zod"
import { parsePaginatedResponse } from "@/lib/pagination"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { FollowUpActivity } from "../types/followUp.types"
export async function getDueFollowUps(p = 1, l = 20) {
  const r = await api.get("/activities/follow-ups/due", {
    params: { page: p, limit: l },
  })
  return parsePaginatedResponse(
    r.data,
    z.custom<FollowUpActivity>(
      (value) =>
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        typeof value.id === "string"
    )
  )
}
export async function completeFollowUp(
  id: string,
  outcome?: string,
  note?: string
) {
  const r = await api.patch(`/activities/${id}/complete`, {
    outcome: outcome?.trim() || undefined,
    completionNote: note?.trim() || undefined,
  })
  return unwrapApiResponse<FollowUpActivity>(r.data)
}
export async function rescheduleFollowUp(
  id: string,
  nextActionDate: string,
  note?: string
) {
  const r = await api.patch(`/activities/${id}/reschedule`, {
    nextActionDate,
    note: note?.trim() || undefined,
  })
  return unwrapApiResponse<FollowUpActivity>(r.data)
}
