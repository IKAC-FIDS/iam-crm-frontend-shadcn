import { api } from '@/lib/api'
import { unwrapApiResponse } from '@/lib/apiResponse'

export type AssistantHistoryItem = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantAnswer = {
  answer: string
  toolsUsed: string[]
}

export async function askCrmAssistant(
  message: string,
  history: AssistantHistoryItem[],
) {
  const response = await api.post('/assistant/ask', { message, history })
  return unwrapApiResponse<AssistantAnswer>(response.data)
}
