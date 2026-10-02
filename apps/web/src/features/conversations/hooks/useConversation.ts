import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import {
  createConversationMessage,
  deleteConversationMessage,
  getConversation,
  markConversationRead,
  updateConversationMessage,
  updateConversationStatus,
} from "../api/conversations.api"
import type {
  ConversationEntityType,
  ConversationMessageType,
  ConversationThreadStatus,
} from "../types/conversation.types"

export const conversationKeys = {
  all: ["conversations"] as const,
  detail: (type: ConversationEntityType, id: string) =>
    [...conversationKeys.all, type, id] as const,
}

export function useConversation(
  type: ConversationEntityType,
  id: string,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [...conversationKeys.detail(type, id), useQueryScope()],
    queryFn: ({ pageParam }) => getConversation(type, id, pageParam, 50),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    enabled: enabled && Boolean(id),
  })
}

export function useConversationMutations(
  type: ConversationEntityType,
  id: string
) {
  const client = useQueryClient()
  const invalidate = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: conversationKeys.detail(type, id) }),
      client.invalidateQueries({
        queryKey: [...conversationKeys.all, "company-hub"],
      }),
      client.invalidateQueries({ queryKey: ["operations"] }),
    ])
  return {
    send: useMutation({
      mutationFn: (payload: {
        body: string
        type: ConversationMessageType
        parentMessageId?: string
        mentionedUserIds?: string[]
      }) => createConversationMessage(type, id, payload),
      onSuccess: invalidate,
    }),
    read: useMutation({
      mutationFn: () => markConversationRead(type, id),
      onSuccess: invalidate,
    }),
    edit: useMutation({
      mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
        updateConversationMessage(messageId, body),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: deleteConversationMessage,
      onSuccess: invalidate,
    }),
    status: useMutation({
      mutationFn: ({
        threadId,
        status,
      }: {
        threadId: string
        status: ConversationThreadStatus
      }) => updateConversationStatus(threadId, status),
      onSuccess: invalidate,
    }),
  }
}
