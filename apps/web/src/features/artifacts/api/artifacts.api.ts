import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { Artifact, ArtifactEntityType, ArtifactPage, ArtifactProvider, ArtifactRelationType, ArtifactType } from "../types/artifact.types"

export async function getArtifacts(params: { entityType: ArtifactEntityType; entityId: string; page: number; limit: number; type?: ArtifactType; search?: string }) {
  const response = await api.get("/artifacts", { params })
  return unwrapApiResponse<ArtifactPage>(response.data)
}

export async function uploadArtifact(input: { entityType: ArtifactEntityType; entityId: string; file: File; name?: string; description?: string; relationType: ArtifactRelationType; onProgress?: (percent: number) => void }) {
  const form = new FormData()
  form.append("file", input.file); form.append("entityType", input.entityType); form.append("entityId", input.entityId); form.append("relationType", input.relationType)
  if (input.name?.trim()) form.append("name", input.name.trim())
  if (input.description?.trim()) form.append("description", input.description.trim())
  const response = await api.post("/artifacts/upload", form, { onUploadProgress: (event) => input.onProgress?.(event.total ? Math.round((event.loaded / event.total) * 100) : 0) })
  return unwrapApiResponse<Artifact>(response.data)
}

export async function createExternalArtifact(input: { entityType: ArtifactEntityType; entityId: string; name: string; externalUrl: string; provider: ArtifactProvider; description?: string; relationType: ArtifactRelationType; metadata?: Record<string, unknown> }) {
  const response = await api.post("/artifacts/external", input)
  return unwrapApiResponse<Artifact>(response.data)
}

export async function deleteArtifact(id: string) { await api.delete(`/artifacts/${id}`) }
export async function unlinkArtifact(id: string, linkId: string) { await api.delete(`/artifacts/${id}/links/${linkId}`) }
export async function downloadArtifact(id: string, fileName: string) {
  const response = await api.get(`/attachments/${id}/download`, { responseType: "blob" })
  const url = URL.createObjectURL(response.data as Blob); const anchor = document.createElement("a")
  anchor.href = url; anchor.download = fileName; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url)
}
