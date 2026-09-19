export type ConversationEntityType = "COMPANY" | "TASK" | "ACTIVITY"
export type ConversationMessageType = "COMMENT" | "QUESTION" | "ANSWER"
export type ConversationThreadStatus = "OPEN" | "RESOLVED"

export type ConversationMentionOption = {
  id: string
  fullName: string
  email?: string | null
}

export type ConversationMessage = {
  id: string
  threadId: string
  authorId: string
  author: { id: string; fullName: string; avatarObjectKey?: string | null }
  parentMessageId?: string | null
  parentMessage?: { id: string; body: string; type: ConversationMessageType; author: { id: string; fullName: string } } | null
  type: ConversationMessageType
  body: string | null
  editedAt?: string | null
  deletedAt?: string | null
  createdAt: string
}

export type ConversationResponse = {
  thread: { id: string; status: ConversationThreadStatus; createdById: string; createdAt: string; updatedAt: string } | null
  messages: ConversationMessage[]
  unreadCount: number
  meta: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }
}
