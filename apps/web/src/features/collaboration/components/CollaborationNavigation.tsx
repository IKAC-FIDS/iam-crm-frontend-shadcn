import { useState } from "react"
import {
  ChevronDown,
  ChevronLeft,
  Hash,
  LockKeyhole,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  EntityRowActions,
  type EntityAction,
} from "@/components/shared/EntityRowActions"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import type {
  CollaborationChannel,
  CollaborationTopic,
  CollaborationTopicCategory,
} from "../types/collaboration.types"

export function CollaborationNavigation({
  topics,
  category,
  selectedChannelId,
  canCreateChannel,
  canUpdateTopic,
  canDeleteTopic,
  canUpdateChannel,
  canDeleteChannel,
  onCategoryChange,
  onSelectChannel,
  onEditTopic,
  onArchiveTopic,
  onCreateChannel,
  onEditChannel,
  onArchiveChannel,
}: {
  topics: CollaborationTopic[]
  category: CollaborationTopicCategory
  selectedChannelId: string
  canCreateChannel: boolean
  canUpdateTopic: boolean
  canDeleteTopic: boolean
  canUpdateChannel: boolean
  canDeleteChannel: boolean
  onCategoryChange: (category: CollaborationTopicCategory) => void
  onSelectChannel: (channel: CollaborationChannel) => void
  onEditTopic: (topic: CollaborationTopic) => void
  onArchiveTopic: (topic: CollaborationTopic) => Promise<unknown>
  onCreateChannel: (topic: CollaborationTopic) => void
  onEditChannel: (channel: CollaborationChannel) => void
  onArchiveChannel: (channel: CollaborationChannel) => Promise<unknown>
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  return (
    <SurfaceCard className="overflow-hidden xl:sticky xl:top-20 xl:h-[calc(100dvh-7rem)]">
      <div className="border-b border-[var(--app-divider)] p-4">
        <div>
          <h2 className="ui-section-title">موضوع‌ها و کانال‌ها</h2>
          <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
            فضای گفتگو را انتخاب کنید.
          </p>
        </div>
        <div
          className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-[var(--app-background)] p-1"
          role="tablist"
          aria-label="دسته موضوع‌ها"
        >
          {(["TENDER", "INTERNAL"] as const).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={category === value ? "default" : "ghost"}
              role="tab"
              aria-selected={category === value}
              onClick={() => onCategoryChange(value)}
            >
              {value === "TENDER" ? "مناقصات" : "داخلی"}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid max-h-[65dvh] gap-3 overflow-y-auto p-3 xl:max-h-[calc(100dvh-14rem)]">
        {topics.length ? (
          topics.map((topic) => {
            const isCollapsed = collapsed.has(topic.id)
            const topicActions: EntityAction[] = [
              {
                id: "edit",
                label: "ویرایش موضوع",
                icon: Pencil,
                onClick: () => onEditTopic(topic),
                visible: canUpdateTopic,
              },
              {
                id: "create-channel",
                label: "ایجاد کانال",
                icon: Plus,
                onClick: () => onCreateChannel(topic),
                visible: canCreateChannel,
              },
              {
                id: "archive",
                label: "بایگانی موضوع",
                icon: Trash2,
                tone: "danger",
                onClick: () => onArchiveTopic(topic),
                visible: canDeleteTopic,
                confirmation: {
                  title: "بایگانی موضوع؟",
                  description:
                    "موضوع و همه کانال‌های آن بایگانی می‌شوند؛ گفتگوها حذف نخواهند شد.",
                },
              },
            ]
            return (
              <section
                key={topic.id}
                className="rounded-xl border border-[var(--app-divider)]"
              >
                <div className="flex items-center gap-1 px-2 py-2">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-right"
                    onClick={() => toggle(topic.id)}
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? (
                      <ChevronLeft className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {topic.name}
                    </span>
                    {topic.unreadCount ? (
                      <StatusBadge tone="info">
                        {topic.unreadCount.toLocaleString("fa-IR")}
                      </StatusBadge>
                    ) : null}
                  </button>
                  <EntityRowActions actions={topicActions} />
                </div>
                {!isCollapsed ? (
                  <div className="grid gap-1 border-t border-[var(--app-divider)] p-1.5">
                    {topic.channels.map((channel) => (
                      <div
                        key={channel.id}
                        className={`flex items-center rounded-lg ${channel.id === selectedChannelId ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "hover:bg-[var(--app-background)]"}`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectChannel(channel)}
                          className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-right text-sm"
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
                        <EntityRowActions
                          actions={[
                            {
                              id: "edit",
                              label: "ویرایش کانال",
                              icon: Pencil,
                              onClick: () => onEditChannel(channel),
                              visible: canUpdateChannel,
                            },
                            {
                              id: "archive",
                              label: "بایگانی کانال",
                              icon: Trash2,
                              tone: "danger",
                              onClick: () => onArchiveChannel(channel),
                              visible: canDeleteChannel,
                              confirmation: {
                                title: "بایگانی کانال؟",
                                description:
                                  "کانال از فهرست فعال خارج می‌شود؛ سابقه گفتگو حذف نخواهد شد.",
                              },
                            },
                          ]}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            )
          })
        ) : (
          <div className="p-6 text-center text-sm text-[var(--app-text-secondary)]">
            در این دسته هنوز موضوع قابل مشاهده‌ای وجود ندارد.
          </div>
        )}
      </div>
    </SurfaceCard>
  )
}
