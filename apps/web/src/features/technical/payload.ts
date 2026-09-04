import type { TechnicalFormValues } from "./components/TechnicalForm"
import type { TechnicalKind } from "./types"

export function buildPayload(
  kind: TechnicalKind,
  value: TechnicalFormValues,
  revision?: number
) {
  const clean = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      item === "" ? undefined : item,
    ])
  )
  if (kind === "releases")
    return withRevision(clean, revision, [
      "productId", "version", "title", "summary", "releaseNotes",
      "releaseDate", "supportStartDate", "supportEndDate", "endOfLifeDate",
    ])
  if (kind === "knowledge-base") {
    const knowledge: Record<string, unknown> = { ...clean }
    for (const key of [
      "summary",
      "category",
      "productId",
      "releaseId",
      "ownerId",
      "reviewerId",
      "nextReviewAt",
    ]) {
      if (value[key as keyof TechnicalFormValues] === "") knowledge[key] = null
    }
    return pick(knowledge, [
      "title", "slug", "content", "summary", "category", "visibility",
      "productId", "releaseId", "ownerId", "reviewerId", "nextReviewAt",
    ])
  }
  if (kind === "documents")
    return withRevision(clean, revision, [
      "title", "documentType", "ownerId", "description", "confidentiality",
      "productId", "releaseId", "companyId", "opportunityId", "tenderId",
      "effectiveFrom", "expiresAt",
    ])
  if (kind === "resources")
    return pick(clean, [
      "title", "resourceType", "description", "productId", "releaseId",
      "url", "version", "checksum", "ownerId", "status",
    ])
  return {
    ...withRevision(clean, revision, [
      "title", "tenderType", "ownerId", "referenceNumber", "companyId",
      "opportunityId", "teamId", "source", "description", "submissionDeadline",
      "technicalDeadline", "expectedDecisionDate", "estimatedValue", "currency",
      "technicalLeadId", "commercialLeadId",
    ]),
    probability: value.probability ? Number(value.probability) : undefined,
  }
}

function withRevision(
  value: Record<string, unknown>,
  revision: number | undefined,
  keys: string[]
) {
  return { ...pick(value, keys), revision }
}

function pick(value: Record<string, unknown>, keys: string[]) {
  return Object.fromEntries(
    keys.filter((key) => value[key] !== undefined).map((key) => [key, value[key]])
  )
}
