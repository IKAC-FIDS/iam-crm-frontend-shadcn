import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

import type {
  DashboardLatestActivity,
  DashboardSummary,
} from "../types/dashboard.types"

export async function getDashboardSummary() {
  const response = await api.get("/dashboard/summary")
  return unwrapApiResponse<DashboardSummary>(response.data)
}

export async function getDashboardLatestActivities() {
  const response = await api.get("/dashboard/latest-activities")
  return unwrapApiResponse<DashboardLatestActivity[]>(response.data)
}
