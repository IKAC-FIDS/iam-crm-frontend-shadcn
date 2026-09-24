import { api } from '@/lib/api'
import { unwrapApiResponse } from '@/lib/apiResponse'

export type AssistantHistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantAnswer = {
  answer: string
  toolsUsed: string[]
  pendingActions: PendingAssistantAction[]
}

export type PendingAssistantAction = {
  token: string
  actionType: 'company.create' | 'opportunity.create' | 'task.create'
  title: string
  description: string
  fields: Array<{ label: string; value: string }>
  expiresAt: string
}

export type AssistantActionResult = {
  actionType: PendingAssistantAction['actionType']
  entity: { id: string; label: string; href: string }
  message: string
}

export async function askCrmAssistant(
  message: string,
  history: AssistantHistoryItem[],
) {
  const response = await api.post('/assistant/ask', { message, history })
  return unwrapApiResponse<AssistantAnswer>(response.data)
}

export async function confirmCrmAssistantAction(token: string) {
  const response = await api.post('/assistant/actions/confirm', { token })
  return unwrapApiResponse<AssistantActionResult>(response.data)
}
