export const ACTIVITY_TYPE_OPTIONS = [
  { value: "CALL", label: "تماس تلفنی" },
  { value: "EMAIL", label: "ایمیل" },
  { value: "LINKEDIN_MESSAGE", label: "پیام لینکدین" },
  { value: "LINKEDIN_ENGAGEMENT", label: "تعامل لینکدین" },
  { value: "MEETING", label: "جلسه" },
  { value: "NOTE", label: "یادداشت" },
  { value: "STAGE_CHANGE", label: "تغییر مرحله" },
] as const

export const MANUAL_ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPE_OPTIONS.filter(
  (item) => item.value !== "STAGE_CHANGE"
)

export type ActivityType = (typeof ACTIVITY_TYPE_OPTIONS)[number]["value"]
export type ManualActivityType = Exclude<ActivityType, "STAGE_CHANGE">
export type ActivityStatus = "RECORDED" | "COMPLETED"

export interface ActivityPerson {
  id: string
  fullName: string
  title?: string | null
  department?: string | null
}

export interface ActivityUser {
  id: string
  fullName: string
  email?: string | null
  role?: string | null
  team?: string | null
}

export interface ActivityCompany {
  id: string
  legalName: string
  brandName?: string | null
}

export interface Activity {
  id: string
  companyId?: string
  opportunityId?: string | null
  personId?: string | null
  userId?: string | null
  type: ActivityType
  notes?: string | null
  outcome?: string | null
  occurredAt?: string | null
  nextActionDate?: string | null
  completedAt?: string | null
  createdAt?: string
  title?: string | null
  description?: string | null
  status?: ActivityStatus
  activityDate?: string | null
  company?: ActivityCompany | null
  person?: ActivityPerson | null
  user?: ActivityUser | null
  owner?: ActivityUser | null
  createdBy?: ActivityUser | null
}

export interface ActivityPage {
  data: Activity[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
}

export interface ActivityListQuery {
  page: number
  limit: 10 | 20 | 50 | 100
  search?: string
  activityType?: ActivityType
  status?: ActivityStatus
  ownerId?: string
  createdById?: string
  personId?: string
  companyId?: string
  dateFrom?: string
  dateTo?: string
  ownershipScope?: "all" | "mine" | "team" | "unassigned"
  team?: string
  mine?: boolean
  unassigned?: boolean
  sortBy?: "activityDate" | "createdAt"
  sortOrder?: "asc" | "desc"
}

export interface CreateActivityPayload {
  companyId: string
  opportunityId?: string
  personId?: string
  type: ManualActivityType
  notes?: string
  outcome?: string
  occurredAt?: string
  nextActionDate?: string
}

export interface UpdateActivityPayload {
  type?: ManualActivityType
  personId?: string | null
  notes?: string | null
  outcome?: string | null
  occurredAt?: string
}

export interface ActivityOption {
  id: string
  label: string
  secondary?: string
}

export interface ActivityOwnerOption extends ActivityOption {
  team?: string
}
