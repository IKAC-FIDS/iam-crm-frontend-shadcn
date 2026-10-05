import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { CollaborationChannel, CollaborationMember, CollaborationTopic, CollaborationVisibility } from "../types/collaboration.types"

export async function getCollaborationTopics() { const response = await api.get("/collaboration/topics"); return unwrapApiResponse<{ data: CollaborationTopic[]; totalUnreadCount: number }>(response.data) }
export async function createCollaborationTopic(payload: { name: string; description?: string }) { const response = await api.post("/collaboration/topics", payload); return unwrapApiResponse<CollaborationTopic>(response.data) }
export async function createCollaborationChannel(topicId: string, payload: { name: string; description?: string; visibility: CollaborationVisibility }) { const response = await api.post(`/collaboration/topics/${topicId}/channels`, payload); return unwrapApiResponse<CollaborationChannel>(response.data) }
export async function getCollaborationChannel(id: string) { const response = await api.get(`/collaboration/channels/${id}`); return unwrapApiResponse<CollaborationChannel>(response.data) }
export async function getCollaborationMembers(id: string) { const response = await api.get(`/collaboration/channels/${id}/members`); return unwrapApiResponse<{ data: CollaborationMember[] }>(response.data) }
export async function addCollaborationMember(channelId: string, userId: string) { const response = await api.post(`/collaboration/channels/${channelId}/members`, { userId, role: "MEMBER" }); return unwrapApiResponse(response.data) }
export async function removeCollaborationMember(channelId: string, userId: string) { const response = await api.delete(`/collaboration/channels/${channelId}/members/${userId}`); return unwrapApiResponse(response.data) }
export async function sendPresenceHeartbeat() { const response = await api.post("/collaboration/presence/heartbeat"); return unwrapApiResponse(response.data) }
