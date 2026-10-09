export type CollaborationVisibility = "PUBLIC" | "PRIVATE"
export type CollaborationRole = "OWNER" | "ADMIN" | "MEMBER"
export type CollaborationTopicCategory = "TENDER" | "INTERNAL"
export type PresenceStatus = "ONLINE" | "AWAY" | "OFFLINE"

export type CollaborationChannel = {
  id: string
  topicId: string
  name: string
  description?: string | null
  visibility: CollaborationVisibility
  currentUserRole?: CollaborationRole | null
  memberCount: number
  unreadCount: number
  capabilities?: { canManage: boolean; canPost: boolean; canManageMembers: boolean }
}
export type CollaborationTopic = { id: string; name: string; description?: string | null; category: CollaborationTopicCategory; unreadCount: number; channels: CollaborationChannel[] }
export type CollaborationMember = { channelId: string; userId: string; role: CollaborationRole; joinedAt: string; presence: PresenceStatus; user: { id: string; fullName: string; email: string; avatarObjectKey?: string | null; team?: string | null; lastSeenAt?: string | null } }
