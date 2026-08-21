export type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED"
export type MeetingMode = "IN_PERSON" | "ONLINE" | "HYBRID"

export interface MeetingUser {
  id: string
  fullName?: string | null
  email?: string | null
  role?: string | null
  teamId?: string | null
  team?: { id: string; name: string } | null
}

export interface MeetingPerson {
  id: string
  fullName: string
  title?: string | null
  jobTitle?: string | null
  companyId: string
}

export interface Meeting {
  id: string
  companyId: string
  opportunityId?: string | null
  title: string
  agenda?: string | null
  description?: string | null
  mode: MeetingMode
  location?: string | null
  meetingUrl?: string | null
  startAt: string
  endAt: string
  reminderAt?: string | null
  status: MeetingStatus
  organizerId?: string
  organizer?: MeetingUser | null
  company?: {
    id: string
    legalName: string
    brandName?: string | null
  } | null
  opportunity?: {
    id: string
    title: string
    companyId: string
  } | null
  assignees?: { userId: string; user: MeetingUser }[]
  attendees?: { personId: string; person: MeetingPerson }[]
  completionNote?: string | null
  completedAt?: string | null
  completedBy?: MeetingUser | null
  cancellationReason?: string | null
  cancelledAt?: string | null
  cancelledBy?: MeetingUser | null
  createdAt?: string
  updatedAt?: string
}

export interface MeetingQuery {
  page: number
  limit: number
  search?: string
  companyId?: string
  opportunityId?: string
  organizerId?: string
  assignedUserId?: string
  attendeePersonId?: string
  status?: MeetingStatus
  mode?: MeetingMode
  dateFrom?: string
  dateTo?: string
  upcoming?: boolean
  past?: boolean
  mine?: boolean
  reminderDue?: boolean
}

export interface MeetingPayload {
  companyId: string
  opportunityId?: string
  title: string
  agenda?: string
  description?: string
  mode: MeetingMode
  location?: string
  meetingUrl?: string
  startAt: string
  endAt: string
  reminderAt?: string
  assigneeUserIds?: string[]
  attendeePersonIds?: string[]
}

export interface MeetingPage {
  data: Meeting[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext?: boolean
    hasPrevious?: boolean
  }
}

export interface AssigneeOption extends MeetingUser {
  id: string
}

export interface MeetingOpportunityOption {
  id: string
  title: string
  companyId: string
}

export interface MeetingAttachment {
  id: string
  entityType: "MEETING"
  entityId: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  description?: string | null
  createdAt: string
}

export interface MeetingAttachmentPage {
  data: MeetingAttachment[]
  meta: MeetingPage["meta"]
}
