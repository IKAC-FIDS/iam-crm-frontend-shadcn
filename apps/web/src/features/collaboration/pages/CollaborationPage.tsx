import { useMemo, useState } from "react"
import { MessageCircleMore, Trash2, Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { EntityConversationPanel } from "@/features/conversations/components/EntityConversationPanel"
import { getConversationMentionOptions } from "@/features/conversations/api/conversations.api"
import { ErrorState } from "@/components/shared/ErrorState"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { LoadingState } from "@/components/shared/LoadingState"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { useAuthStore } from "@/store/authStore"
import { CollaborationEntityDialog, type CollaborationDialogValue } from "../components/CollaborationEntityDialog"
import { CollaborationNavigation } from "../components/CollaborationNavigation"
import { useCollaborationChannel, useCollaborationMembers, useCollaborationMutations, useCollaborationTopics, usePresenceHeartbeat } from "../hooks/useCollaboration"
import type { CollaborationChannel, CollaborationTopic, CollaborationTopicCategory } from "../types/collaboration.types"

type DialogState = { mode: "topic" | "channel"; topic?: CollaborationTopic; channel?: CollaborationChannel } | null
const has = (permissions: readonly string[] | undefined, permission: string) => Boolean(permissions?.includes(permission))

export function CollaborationPage() {
  usePresenceHeartbeat()
  const permissions = useAuthStore((state) => state.user?.permissions)
  const [category, setCategory] = useState<CollaborationTopicCategory>("TENDER")
  const topics = useCollaborationTopics(category)
  const mutations = useCollaborationMutations()
  const [selectedId, setSelectedId] = useState("")
  const [dialog, setDialog] = useState<DialogState>(null)
  const [membersOpen, setMembersOpen] = useState(false)
  const allChannels = useMemo(() => topics.data?.data.flatMap((topic) => topic.channels) ?? [], [topics.data])
  const activeChannelId = allChannels.some((channel) => channel.id === selectedId) ? selectedId : allChannels[0]?.id ?? ""
  const selected = allChannels.find((channel) => channel.id === activeChannelId)
  const selectedTopic = topics.data?.data.find((topic) => topic.channels.some((channel) => channel.id === activeChannelId))
  const detail = useCollaborationChannel(activeChannelId)

  async function submit(value: CollaborationDialogValue) {
    if (!dialog) return
    try {
      if (dialog.mode === "topic") {
        if (dialog.topic) await mutations.updateTopic.mutateAsync({ id: dialog.topic.id, name: value.name, description: value.description, category: value.category })
        else { const created = await mutations.createTopic.mutateAsync({ name: value.name, description: value.description, category: value.category ?? category }); if (created.channels?.[0]?.id) setSelectedId(created.channels[0].id) }
      } else if (dialog.channel) await mutations.updateChannel.mutateAsync({ id: dialog.channel.id, name: value.name, description: value.description, visibility: value.visibility })
      else if (dialog.topic) { const created = await mutations.createChannel.mutateAsync({ topicId: dialog.topic.id, name: value.name, description: value.description, visibility: value.visibility ?? "PUBLIC" }); setSelectedId(created.id) }
      toast.success("تغییرات مرکز همکاری ذخیره شد")
      setDialog(null)
    } catch (error) { toast.error(getApiErrorMessage(error, "ذخیره تغییرات انجام نشد")) }
  }

  if (topics.isLoading) return <LoadingState rows={6} />
  if (topics.isError) return <ErrorState title="دریافت مرکز همکاری ناموفق بود" description="لطفاً دوباره تلاش کنید." onRetry={() => void topics.refetch()} />
  return <main dir="rtl" className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
    <CollaborationNavigation topics={topics.data?.data ?? []} category={category} selectedChannelId={activeChannelId}
      canCreateTopic={has(permissions, "collaboration:topic:create")} canCreateChannel={has(permissions, "collaboration:channel:create")}
      canUpdateTopic={has(permissions, "collaboration:topic:update")} canDeleteTopic={has(permissions, "collaboration:topic:delete")}
      canUpdateChannel={has(permissions, "collaboration:channel:update")} canDeleteChannel={has(permissions, "collaboration:channel:delete")}
      onCategoryChange={(next) => { setCategory(next); setSelectedId("") }} onSelectChannel={(channel) => setSelectedId(channel.id)}
      onCreateTopic={() => setDialog({ mode: "topic" })} onEditTopic={(topic) => setDialog({ mode: "topic", topic })}
      onArchiveTopic={async (topic) => { await mutations.archiveTopic.mutateAsync(topic.id); toast.success("موضوع بایگانی شد") }}
      onCreateChannel={(topic) => setDialog({ mode: "channel", topic })} onEditChannel={(channel) => setDialog({ mode: "channel", channel, topic: selectedTopic })}
      onArchiveChannel={async (channel) => { await mutations.archiveChannel.mutateAsync(channel.id); toast.success("کانال بایگانی شد") }} />
    <section className="min-w-0">{selected ? <><div className="mb-3 flex items-center justify-between gap-3 xl:hidden"><div><h2 className="font-bold">{selected.name}</h2><p className="text-xs text-[var(--app-text-secondary)]">{selectedTopic?.name}</p></div><Button variant="outline" onClick={() => setMembersOpen(true)}><Users className="size-4" />اعضا</Button></div><EntityConversationPanel entityType="COLLABORATION_CHANNEL" entityId={selected.id} title={selected.name} description={selected.description || `کانال ${selectedTopic?.name ?? "همکاری"}`} showStatus={false} /></> : <SurfaceCard className="grid min-h-96 place-items-center p-8 text-center"><div><MessageCircleMore className="mx-auto size-12 text-[var(--app-text-secondary)]" /><h2 className="mt-4 font-bold">یک کانال را انتخاب کنید</h2><p className="mt-2 text-sm text-[var(--app-text-secondary)]">برای آغاز گفتگو، از فهرست کانال‌ها انتخاب کنید.</p></div></SurfaceCard>}</section>
    <div className="hidden xl:block"><MembersPanel channelId={activeChannelId} canManage={has(permissions, "collaboration:member:manage") && Boolean(detail.data)} /></div>
    <CollaborationEntityDialog key={dialog ? `${dialog.mode}:${dialog.channel?.id ?? dialog.topic?.id ?? "new"}` : "closed"} open={Boolean(dialog)} mode={dialog?.mode ?? "topic"} initial={dialog?.mode === "topic" && dialog.topic ? { name: dialog.topic.name, description: dialog.topic.description ?? undefined, category: dialog.topic.category } : dialog?.channel ? { name: dialog.channel.name, description: dialog.channel.description ?? undefined, visibility: dialog.channel.visibility } : undefined} pending={mutations.createTopic.isPending || mutations.updateTopic.isPending || mutations.createChannel.isPending || mutations.updateChannel.isPending} onClose={() => setDialog(null)} onSubmit={(value) => void submit(value)} />
    <ResponsiveModal open={membersOpen} onClose={() => setMembersOpen(false)} title="اعضای کانال"><MembersPanel channelId={activeChannelId} canManage={has(permissions, "collaboration:member:manage") && Boolean(detail.data)} /></ResponsiveModal>
  </main>
}

function MembersPanel({ channelId, canManage }: { channelId: string; canManage: boolean }) {
  const members = useCollaborationMembers(channelId)
  const mutations = useCollaborationMutations()
  const [search, setSearch] = useState("")
  const debounced = useDebouncedValue(search, 250)
  const options = useQuery({ queryKey: ["collaboration", "member-options", debounced], queryFn: () => getConversationMentionOptions(debounced), enabled: Boolean(channelId && canManage) })
  if (!channelId) return <SurfaceCard className="p-5 text-center text-sm text-[var(--app-text-secondary)]">کانالی انتخاب نشده است.</SurfaceCard>
  return <SurfaceCard className="overflow-hidden"><div className="border-b border-[var(--app-divider)] p-4"><h2 className="ui-section-title">اعضای کانال</h2><p className="mt-1 text-xs text-[var(--app-text-secondary)]">وضعیت حضور تقریبی است.</p></div>
    {canManage ? <div className="border-b border-[var(--app-divider)] p-3"><SearchableOptionSelect options={(options.data ?? []).filter((option) => !members.data?.data.some((member) => member.userId === option.id)).map((option) => ({ id: option.id, label: option.fullName, secondary: option.email || undefined }))} onChange={(userId) => { if (userId) mutations.addMember.mutate({ channelId, userId }) }} search={search} onSearchChange={setSearch} loading={options.isFetching} allowEmpty={false} placeholder="افزودن عضو" searchPlaceholder="جست‌وجوی همکار..." emptyText="همکاری یافت نشد" ariaLabel="افزودن عضو به کانال" /></div> : null}
    <div className="grid max-h-[65dvh] gap-2 overflow-y-auto p-3">{members.isLoading ? <LoadingState rows={4} /> : members.data?.data.map((member) => <div key={member.userId} className="flex items-center gap-2 rounded-xl p-2 hover:bg-[var(--app-background)]"><IdentityAvatar name={member.user.fullName} mediaPath={`/users/${member.user.id}/avatar`} hasMedia={Boolean(member.user.avatarObjectKey)} mediaVersion={member.user.avatarObjectKey} className="size-9" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{member.user.fullName}</p><div className="mt-1 flex gap-1"><StatusBadge tone={member.presence === "ONLINE" ? "success" : member.presence === "AWAY" ? "warning" : "neutral"}>{member.presence === "ONLINE" ? "آنلاین" : member.presence === "AWAY" ? "غایب" : "آفلاین"}</StatusBadge>{member.role !== "MEMBER" ? <StatusBadge tone="info">{member.role === "OWNER" ? "مالک" : "مدیر"}</StatusBadge> : null}</div></div>{canManage && member.role !== "OWNER" ? <Button size="icon" variant="ghost" aria-label={`حذف ${member.user.fullName}`} onClick={() => mutations.removeMember.mutate({ channelId, userId: member.userId })}><Trash2 className="size-4" /></Button> : null}</div>)}</div>
  </SurfaceCard>
}
