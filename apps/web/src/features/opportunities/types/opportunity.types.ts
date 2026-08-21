export type OpportunityPriority = "LOW" | "MEDIUM" | "HIGH" | "STRATEGIC"
export type OwnershipScope = "all" | "mine" | "team" | "unassigned"
export type ArchiveState = "active" | "all" | "archived"

export interface OpportunityStage {
  id: string
  code: string
  label: string
  sortOrder: number
  color?: string | null
  isActive?: boolean
  isDefault?: boolean
  isTerminal?: boolean
  terminalType?: "NONE" | "WON" | "LOST" | string | null
}

export interface OpportunityTransition {
  id: string
  fromStageId: string | null
  toStageId: string
  role?: string | null
  isAllowed?: boolean
  allowed?: boolean
}

export interface Opportunity {
  id: string
  companyId: string
  title: string
  description?: string | null
  company?: { id: string; legalName: string; brandName?: string | null } | null
  ownerId?: string | null
  owner?: { id: string; fullName: string; email?: string | null; team?: string | null } | null
  stageId: string
  stage: OpportunityStage
  priority: OpportunityPriority
  estimatedValue?: number | string | null
  expectedCloseDate?: string | null
  source?: string | null
  sourceOptionId?: string | null
  sourceOption?: { id: string; code: string; label: string } | null
  primaryContactId?: string | null
  primaryContact?: { id: string; fullName: string } | null
  probability?: number | null
  competitor?: string | null
  archivedAt?: string | null
  archiveReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface OpportunityFilters {
  search?: string
  ownershipScope: OwnershipScope
  companyId?: string
  ownerId?: string
  teamId?: string
  team?: string
  stageId?: string
  priority?: OpportunityPriority
  sourceOptionId?: string
  primaryContactId?: string
  expectedCloseFrom?: string
  expectedCloseTo?: string
  archiveState: ArchiveState
}

export interface OpportunityListQuery extends OpportunityFilters {
  page: number
  limit: number
}

export interface OpportunityPage {
  data: Opportunity[]
  meta: { total: number; page: number; limit: number; totalPages: number; hasNext?: boolean; hasPrevious?: boolean }
}

export interface OpportunityPayload {
  companyId: string
  title: string
  description?: string
  ownerId?: string
  stageId?: string
  priority?: OpportunityPriority
  estimatedValue?: number
  expectedCloseDate?: string
  sourceOptionId?: string
  primaryContactId?: string
  probability?: number
  competitor?: string
}

export type OpportunityUpdatePayload = Omit<Partial<OpportunityPayload>, "companyId" | "ownerId" | "stageId">

export interface OpportunityOwnerOption {
  id: string
  fullName: string
  email?: string | null
  team?: string | null
  teamId?: string | null
}

export interface OpportunitySourceOption {
  id: string
  code: string
  label: string
  isActive?: boolean
}
