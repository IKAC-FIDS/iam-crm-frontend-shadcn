import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { ConversationEntityType, ConversationMessage, ConversationMessageType, ConversationResponse, ConversationThreadStatus } from "../types/conversation.types"

const path = (type: ConversationEntityType, id: string) => `/conversations/${type}/${id}`

export async function getConversation(type: ConversationEntityType, id: string) {
  const response = await api.get(path(type, id), { params: { page: 1, limit: 100 } })
  return unwrapApiResponse<ConversationResponse>(response.data)
}

export async function createConversationMessage(type: ConversationEntityType, id: string, payload: { body: string; type: ConversationMessageType; parentMessageId?: string }) {
  const response = await api.post(`${path(type, id)}/messages`, payload)
  return unwrapApiResponse<ConversationMessage>(response.data)
}

export async function markConversationRead(type: ConversationEntityType, id: string) {
  const response = await api.post(`${path(type, id)}/read`)
  return unwrapApiResponse<{ unreadCount: number; lastReadAt: string | null }>(response.data)
}

export async function updateConversationMessage(messageId: string, body: string) {
  const response = await api.patch(`/conversations/messages/${messageId}`, { body })
  return unwrapApiResponse<ConversationMessage>(response.data)
}

export async function deleteConversationMessage(messageId: string) {
  const response = await api.delete(`/conversations/messages/${messageId}`)
  return unwrapApiResponse<{ id: string; deletedAt: string }>(response.data)
}

export async function updateConversationStatus(threadId: string, status: ConversationThreadStatus) {
  const response = await api.patch(`/conversations/${threadId}/status`, { status })
  return unwrapApiResponse<{ id: string; status: ConversationThreadStatus; updatedAt: string }>(response.data)
}
