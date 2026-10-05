import { useMemo, useState } from "react"
import {
  Hash,
  LockKeyhole,
  MessageCircleMore,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { EntityConversationPanel } from "@/features/conversations/components/EntityConversationPanel"
import { getConversationMentionOptions } from "@/features/conversations/api/conversations.api"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import {
  useCollaborationChannel,
  useCollaborationMembers,
  useCollaborationMutations,
  useCollaborationTopics,
  usePresenceHeartbeat,
} from "../hooks/useCollaboration"
import type { CollaborationVisibility } from "../types/collaboration.types"

export function CollaborationPage() {
  usePresenceHeartbeat()
  const topics = useCollaborationTopics()
  const mutations = useCollaborationMutations()
  const [selectedId, setSelectedId] = useState("")
  const [topicModal, setTopicModal] = useState(false)
  const [channelModal, setChannelModal] = useState(false)
  const [membersModal, setMembersModal] = useState(false)
  const [name, setName] = useState("")
  const [visibility, setVisibility] =
    useState<CollaborationVisibility>("PUBLIC")
  const allChannels = useMemo(
    () => topics.data?.data.flatMap((topic) => topic.channels) ?? [],
    [topics.data]
  )
  const activeChannelId = selectedId || allChannels[0]?.id || ""
  const selected = allChannels.find((channel) => channel.id === activeChannelId)
  const selectedTopic = topics.data?.data.find((topic) =>
    topic.channels.some((channel) => channel.id === activeChannelId)
  )
  const detail = useCollaborationChannel(activeChannelId)

  async function createTopic() {
    try {
      const topic = await mutations.createTopic.mutateAsync({ name })
      setTopicModal(false)
      setName("")
      const channelId = topic.channels?.[0]?.id
      if (channelId) setSelectedId(channelId)
      toast.success("موضوع همکاری ایجاد شد")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ایجاد موضوع انجام نشد"))
    }
  }
  async function createChannel() {
    if (!selectedTopic) return
    try {
      const channel = await mutations.createChannel.mutateAsync({
        topicId: selectedTopic.id,
        name,
        visibility,
      })
      setChannelModal(false)
      setName("")
      setSelectedId(channel.id)
      toast.success("کانال ایجاد شد")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ایجاد کانال انجام نشد"))
    }
  }

  if (topics.isLoading) return <LoadingState rows={6} />
  if (topics.isError)
    return (
      <ErrorState
        title="دریافت مرکز همکاری ناموفق بود"
        description="لطفاً دوباره تلاش کنید."
        onRetry={() => void topics.refetch()}
      />
    )
  return (
    <main
      dir="rtl"
      className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_280px]"
    >
      <SurfaceCard className="overflow-hidden xl:sticky xl:top-20 xl:h-[calc(100dvh-7rem)]">
        <div className="flex items-center justify-between border-b border-[var(--app-divider)] p-4">
          <div>
            <h1 className="ui-section-title">مرکز همکاری</h1>
            <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
              موضوع‌ها و کانال‌های داخلی
            </p>
          </div>
          <Button
            size="icon"
            aria-label="ایجاد موضوع"
            onClick={() => {
              setName("")
              setTopicModal(true)
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="grid max-h-[60dvh] gap-4 overflow-y-auto p-3 xl:max-h-[calc(100dvh-13rem)]">
          {topics.data?.data.length ? (
            topics.data.data.map((topic) => (
              <section key={topic.id}>
                <div className="mb-1 flex items-center justify-between px-2">
                  <p className="text-sm font-bold text-[var(--app-heading)]">
                    {topic.name}
                  </p>
                  {topic.unreadCount ? (
                    <StatusBadge tone="info">
                      {topic.unreadCount.toLocaleString("fa-IR")}
                    </StatusBadge>
                  ) : null}
                </div>
                <div className="grid gap-1">
                  {topic.channels.map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => setSelectedId(channel.id)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-right text-sm transition ${channel.id === activeChannelId ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "hover:bg-[var(--app-background)]"}`}
                    >
                      {channel.visibility === "PRIVATE" ? (
                        <LockKeyhole className="size-4" />
                      ) : (
                        <Hash className="size-4" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {channel.name}
                      </span>
                      {channel.unreadCount ? (
                        <StatusBadge tone="info">
                          {channel.unreadCount.toLocaleString("fa-IR")}
                        </StatusBadge>
                      ) : null}
                    </button>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-[var(--app-text-secondary)]">
              هنوز موضوعی ایجاد نشده است.
            </div>
          )}
        </div>
        {selectedTopic ? (
          <div className="border-t border-[var(--app-divider)] p-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setName("")
                setVisibility("PUBLIC")
                setChannelModal(true)
              }}
            >
              <Plus className="size-4" />
              ایجاد کانال
            </Button>
          </div>
        ) : null}
      </SurfaceCard>

      <section className="min-w-0">
        {selected ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-3 xl:hidden">
              <div>
                <h2 className="font-bold">{selected.name}</h2>
                <p className="text-xs text-[var(--app-text-secondary)]">
                  {selectedTopic?.name}
                </p>
              </div>
              <Button variant="outline" onClick={() => setMembersModal(true)}>
                <Users className="size-4" />
                اعضا
              </Button>
            </div>
            <EntityConversationPanel
              entityType="COLLABORATION_CHANNEL"
              entityId={selected.id}
              title={selected.name}
              description={
                selected.description ||
                `کانال ${selectedTopic?.name ?? "همکاری"}`
              }
              showStatus={false}
            />
          </>
        ) : (
          <SurfaceCard className="grid min-h-96 place-items-center p-8 text-center">
            <div>
              <MessageCircleMore className="mx-auto size-12 text-[var(--app-text-secondary)]" />
              <h2 className="mt-4 font-bold">یک کانال را انتخاب کنید</h2>
              <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
                برای آغاز گفتگو، از فهرست کانال‌ها انتخاب کنید.
              </p>
            </div>
          </SurfaceCard>
        )}
      </section>

      <div className="hidden xl:block">
        <MembersPanel
          channelId={activeChannelId}
          canManage={Boolean(detail.data?.capabilities?.canManageMembers)}
        />
      </div>
      <ResponsiveModal
        open={topicModal}
        onClose={() => setTopicModal(false)}
        title="موضوع همکاری جدید"
        description="کانال عمومی به‌صورت خودکار ساخته می‌شود."
      >
        <div className="grid gap-4">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="نام موضوع"
            autoFocus
          />
          <Button
            disabled={!name.trim() || mutations.createTopic.isPending}
            onClick={() => void createTopic()}
          >
            ایجاد موضوع
          </Button>
        </div>
      </ResponsiveModal>
      <ResponsiveModal
        open={channelModal}
        onClose={() => setChannelModal(false)}
        title="کانال جدید"
      >
        <div className="grid gap-4">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="نام کانال"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant={visibility === "PUBLIC" ? "default" : "outline"}
              onClick={() => setVisibility("PUBLIC")}
            >
              عمومی
            </Button>
            <Button
              type="button"
              variant={visibility === "PRIVATE" ? "default" : "outline"}
              onClick={() => setVisibility("PRIVATE")}
            >
              خصوصی
            </Button>
          </div>
          <Button
            disabled={!name.trim() || mutations.createChannel.isPending}
            onClick={() => void createChannel()}
          >
            ایجاد کانال
          </Button>
        </div>
      </ResponsiveModal>
      <ResponsiveModal
        open={membersModal}
        onClose={() => setMembersModal(false)}
        title="اعضای کانال"
      >
        <MembersPanel
          channelId={activeChannelId}
          canManage={Boolean(detail.data?.capabilities?.canManageMembers)}
        />
      </ResponsiveModal>
    </main>
  )
}

function MembersPanel({
  channelId,
  canManage,
}: {
  channelId: string
  canManage: boolean
}) {
  const members = useCollaborationMembers(channelId)
  const mutations = useCollaborationMutations()
  const [search, setSearch] = useState("")
  const debounced = useDebouncedValue(search, 250)
  const options = useQuery({
    queryKey: ["collaboration", "member-options", debounced],
    queryFn: () => getConversationMentionOptions(debounced),
    enabled: Boolean(channelId),
  })
  const tone = (status: string) =>
    status === "ONLINE" ? "success" : status === "AWAY" ? "warning" : "neutral"
  if (!channelId)
    return (
      <SurfaceCard className="p-5 text-center text-sm text-[var(--app-text-secondary)]">
        کانالی انتخاب نشده است.
      </SurfaceCard>
    )
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="border-b border-[var(--app-divider)] p-4">
        <h2 className="ui-section-title">اعضای کانال</h2>
        <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
          وضعیت حضور تقریبی است.
        </p>
      </div>
      {canManage ? (
        <div className="border-b border-[var(--app-divider)] p-3">
          <SearchableOptionSelect
            options={(options.data ?? [])
              .filter(
                (option) =>
                  !members.data?.data.some(
                    (member) => member.userId === option.id
                  )
              )
              .map((option) => ({
                id: option.id,
                label: option.fullName,
                secondary: option.email || undefined,
              }))}
            onChange={(userId) => {
              if (userId) mutations.addMember.mutate({ channelId, userId })
            }}
            search={search}
            onSearchChange={setSearch}
            loading={options.isFetching}
            allowEmpty={false}
            placeholder="افزودن عضو"
            searchPlaceholder="جست‌وجوی همکار..."
            emptyText="همکاری یافت نشد"
            ariaLabel="افزودن عضو به کانال"
          />
        </div>
      ) : null}
      <div className="grid max-h-[65dvh] gap-2 overflow-y-auto p-3">
        {members.isLoading ? (
          <LoadingState rows={4} />
        ) : (
          members.data?.data.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-2 rounded-xl p-2 hover:bg-[var(--app-background)]"
            >
              <span className="relative">
                <IdentityAvatar
                  name={member.user.fullName}
                  mediaPath={`/users/${member.user.id}/avatar`}
                  hasMedia={Boolean(member.user.avatarObjectKey)}
                  mediaVersion={member.user.avatarObjectKey}
                  className="size-9"
                />
                <span
                  className={`absolute -bottom-0.5 -left-0.5 size-3 rounded-full border-2 border-[var(--app-surface)] ${member.presence === "ONLINE" ? "bg-emerald-500" : member.presence === "AWAY" ? "bg-amber-500" : "bg-muted-foreground"}`}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {member.user.fullName}
                </p>
                <div className="mt-1 flex gap-1">
                  <StatusBadge tone={tone(member.presence)}>
                    {member.presence === "ONLINE"
                      ? "آنلاین"
                      : member.presence === "AWAY"
                        ? "غایب"
                        : "آفلاین"}
                  </StatusBadge>
                  {member.role !== "MEMBER" ? (
                    <StatusBadge tone="info">
                      {member.role === "OWNER" ? "مالک" : "مدیر"}
                    </StatusBadge>
                  ) : null}
                </div>
              </div>
              {canManage && member.role !== "OWNER" ? (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`حذف ${member.user.fullName}`}
                  onClick={() =>
                    mutations.removeMember.mutate({
                      channelId,
                      userId: member.userId,
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </SurfaceCard>
  )
}
