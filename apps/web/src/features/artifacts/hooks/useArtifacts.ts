import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createExternalArtifact, deleteArtifact, getArtifacts, unlinkArtifact, uploadArtifact } from "../api/artifacts.api"
import type { ArtifactEntityType, ArtifactType } from "../types/artifact.types"

const keys = { all: ["artifacts"] as const, list: (entityType: ArtifactEntityType, entityId: string) => ["artifacts", entityType, entityId] as const }
export function useArtifacts(input: { entityType: ArtifactEntityType; entityId: string; page: number; limit: number; type?: ArtifactType; search?: string }, enabled = true) {
  return useQuery({ queryKey: [...keys.list(input.entityType, input.entityId), input], queryFn: () => getArtifacts(input), enabled: enabled && Boolean(input.entityId) })
}
function useInvalidate(entityType: ArtifactEntityType, entityId: string) { const client = useQueryClient(); return () => client.invalidateQueries({ queryKey: keys.list(entityType, entityId) }) }
export function useUploadArtifact(entityType: ArtifactEntityType, entityId: string) { const invalidate = useInvalidate(entityType, entityId); return useMutation({ mutationFn: uploadArtifact, onSuccess: invalidate }) }
export function useCreateExternalArtifact(entityType: ArtifactEntityType, entityId: string) { const invalidate = useInvalidate(entityType, entityId); return useMutation({ mutationFn: createExternalArtifact, onSuccess: invalidate }) }
export function useDeleteArtifact(entityType: ArtifactEntityType, entityId: string) { const invalidate = useInvalidate(entityType, entityId); return useMutation({ mutationFn: deleteArtifact, onSuccess: invalidate }) }
export function useUnlinkArtifact(entityType: ArtifactEntityType, entityId: string) { const invalidate = useInvalidate(entityType, entityId); return useMutation({ mutationFn: ({ id, linkId }: { id: string; linkId: string }) => unlinkArtifact(id, linkId), onSuccess: invalidate }) }
