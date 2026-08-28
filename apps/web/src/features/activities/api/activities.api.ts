import { z } from "zod"
import { parsePaginatedResponse } from "@/lib/pagination"
import { getPeopleDirectory } from "@/features/people/api/people.api"
import {
  getOpportunities,
  getOpportunityOwnerOptions,
} from "@/features/opportunities/api/opportunities.api"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type {
  Activity,
  ActivityTypeOption,
  ActivityListQuery,
  ActivityOption,
  ActivityOwnerOption,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "../types/activity.types"

function clean(value: object) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) => item !== undefined && item !== ""
    )
  )
}

export async function getActivityTypes() {
  const response = await api.get("/activities/types/options")
  const data = unwrapApiResponse<ActivityTypeOption[]>(response.data)
  return Array.isArray(data) ? data : []
}

export async function getActivities(query: ActivityListQuery) {
  const response = await api.get("/activities", {
    params: clean({
      ...query,
      mine: query.mine === undefined ? undefined : String(query.mine),
      unassigned:
        query.unassigned === undefined ? undefined : String(query.unassigned),
    }),
  })
  return parsePaginatedResponse(
    response.data,
    z.custom<Activity>(
      (value) =>
        !!value &&
        typeof value === "object" &&
        "id" in value &&
        typeof value.id === "string" &&
        "type" in value &&
        typeof value.type === "string"
    )
  )
}

export async function createActivity(payload: CreateActivityPayload) {
  const response = await api.post("/activities", clean(payload))
  return unwrapApiResponse<Activity>(response.data)
}

export async function updateActivity(
  id: string,
  payload: UpdateActivityPayload
) {
  const response = await api.patch(`/activities/${id}`, clean(payload))
  return unwrapApiResponse<Activity>(response.data)
}

export async function getActivityPeopleOptions(
  companyId: string,
  search: string
): Promise<ActivityOption[]> {
  const page = await getPeopleDirectory({
    page: 1,
    limit: 25,
    companyId: companyId || undefined,
    search: search.trim() || undefined,
  })

  return page.data.map((person) => ({
    id: person.id,
    label: person.fullName,
    secondary:
      person.title ||
      person.jobTitle ||
      person.department ||
      person.company?.brandName ||
      person.company?.legalName ||
      undefined,
  }))
}

export async function getActivityOpportunityOptions(
  companyId: string,
  search: string
): Promise<ActivityOption[]> {
  if (!companyId) return []
  const page = await getOpportunities({
    page: 1,
    limit: 25,
    search: search.trim() || undefined,
    companyId,
    ownershipScope: "all",
    archiveState: "active",
  })

  return page.data.map((item) => ({
    id: item.id,
    label: item.title,
    secondary: item.company?.brandName || item.company?.legalName || undefined,
  }))
}

export async function getActivityOwnerOptions(): Promise<
  ActivityOwnerOption[]
> {
  const data = await getOpportunityOwnerOptions()
  return data.map((item) => ({
    id: item.id,
    label: item.fullName || item.email || item.id,
    secondary: item.email || undefined,
    team: item.team || undefined,
  }))
}
