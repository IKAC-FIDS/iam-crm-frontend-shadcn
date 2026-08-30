export type ArtifactType = "FILE" | "EXTERNAL_URL"
export type ArtifactProvider = "LOCAL" | "OBJECT_STORAGE" | "GOOGLE_DRIVE" | "SHAREPOINT" | "ONEDRIVE" | "GITHUB" | "GENERIC_URL"
export type ArtifactEntityType = "COMPANY" | "OPPORTUNITY" | "PERSON" | "TASK" | "ACTIVITY" | "MEETING" | "PRODUCT" | "ORGANIZATION" | "COMMERCIAL_DOCUMENT" | "PAYMENT" | "COMPANY_LEGAL_DOCUMENT" | "TECHNICAL_DOCUMENT" | "TECHNICAL_RESOURCE"
export type ArtifactRelationType = "ATTACHMENT" | "PROPOSAL" | "CONTRACT" | "TECHNICAL_DOCUMENT" | "MEETING_MINUTES" | "SCREENSHOT" | "EVIDENCE" | "REFERENCE" | "OTHER"

export interface ArtifactLink {
  id: string
  entityType: ArtifactEntityType
  entityId: string
  relationType: ArtifactRelationType
  createdAt: string
}

export interface Artifact {
  id: string
  type: ArtifactType
  provider: ArtifactProvider
  name: string
  description?: string | null
  externalUrl?: string | null
  originalFileName?: string | null
  mimeType?: string | null
  sizeBytes?: number | null
  sha256?: string | null
  category?: string | null
  tags?: string[]
  versionLabel?: string | null
  confidentiality?: string | null
  metadata?: Record<string, unknown> | null
  uploadedBy?: { id: string; fullName?: string; email?: string } | null
  createdAt: string
  updatedAt: string
  links: ArtifactLink[]
  _count?: { links: number }
}

export interface ArtifactPage { data: Artifact[]; meta: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean } }
