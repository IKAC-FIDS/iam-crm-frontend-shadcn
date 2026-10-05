import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type {
  CompanyConversationHub,
  ConversationEntityType,
  ConversationMentionOption,
  ConversationMessage,
  ConversationMessageType,
  ConversationResponse,
  ConversationThreadStatus,
} from "../types/conversation.types"

const path = (type: ConversationEntityType, id: string) =>
  `/conversations/${type}/${id}`

export async function getConversation(
  type: ConversationEntityType,
  id: string,
  page = 1,
  limit = 50
) {
  const response = await api.get(path(type, id), { params: { page, limit } })
  return unwrapApiResponse<ConversationResponse>(response.data)
}

export async function getCompanyConversationHub(companyId: string) {
  const response = await api.get(`/conversations/company-hub/${companyId}`)
  return unwrapApiResponse<CompanyConversationHub>(response.data)
}

export async function createConversationMessage(
  type: ConversationEntityType,
  id: string,
  payload: {
    body: string
    type: ConversationMessageType
    parentMessageId?: string
    mentionedUserIds?: string[]
    references?: Array<{ type: "COMPANY" | "OPPORTUNITY" | "TASK" | "MEETING"; id: string }>
    attachmentIds?: string[]
  }
) {
  const response = await api.post(`${path(type, id)}/messages`, payload)
  return unwrapApiResponse<ConversationMessage>(response.data)
}

export async function askConversationBot(
  channelId: string,
  payload: Parameters<typeof createConversationMessage>[2] & { requestId: string }
) {
  const response = await api.post(
    `/conversations/COLLABORATION_CHANNEL/${channelId}/bot`,
    payload
  )
  return unwrapApiResponse<{ request: ConversationMessage; response: ConversationMessage }>(response.data)
}

export async function uploadConversationAttachment(channelId: string, file: File) {
  const form = new FormData(); form.append("file", file)
  const response = await api.post(`/conversations/COLLABORATION_CHANNEL/${channelId}/attachments`, form)
  return unwrapApiResponse<{ id: string; name: string; originalFileName?: string | null; mimeType?: string | null; sizeBytes?: number | null }>(response.data)
}

export async function downloadConversationAttachment(id: string, name: string) {
  const response = await api.get(`/attachments/${id}/download`, { responseType: "blob" })
  const url = URL.createObjectURL(response.data); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url)
}

export async function getConversationMentionOptions(search: string) {
  const response = await api.get("/conversations/mention-options", {
    params: { search: search.trim() || undefined },
  })
  const result = unwrapApiResponse<unknown>(response.data)
  if (Array.isArray(result)) return result as ConversationMentionOption[]
  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    Array.isArray((result as { data: unknown }).data)
  ) {
    return (result as { data: ConversationMentionOption[] }).data
  }
  return []
}

export async function markConversationRead(
  type: ConversationEntityType,
  id: string
) {
  const response = await api.post(`${path(type, id)}/read`)
  return unwrapApiResponse<{ unreadCount: number; lastReadAt: string | null }>(
    response.data
  )
}

export async function updateConversationMessage(
  messageId: string,
  body: string
) {
  const response = await api.patch(`/conversations/messages/${messageId}`, {
    body,
  })
  return unwrapApiResponse<ConversationMessage>(response.data)
}

export async function deleteConversationMessage(messageId: string) {
  const response = await api.delete(`/conversations/messages/${messageId}`)
  return unwrapApiResponse<{ id: string; deletedAt: string }>(response.data)
}

export async function updateConversationStatus(
  threadId: string,
  status: ConversationThreadStatus
) {
  const response = await api.patch(`/conversations/${threadId}/status`, {
    status,
  })
  return unwrapApiResponse<{
    id: string
    status: ConversationThreadStatus
    updatedAt: string
  }>(response.data)
}
