import { forwardRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardList,
  ListChecks,
  MessageSquareText,
  UserRound,
  UsersRound,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { OperationsWorkspace } from "../types/operations.types"
import { formatRelativeOperationTime } from "../utils/operationsFormatters"

type Conversation = OperationsWorkspace["recentConversations"][number]
type SectionRow = {
  id: string
  title: string
  meta: string
  details: string[]
  preview?: string
  conversation?: Conversation
  onClick: () => void
}

export const OperationsTodaySection = forwardRef<
  HTMLElement,
  {
    workspace: OperationsWorkspace
    focus?: "tasks" | "meetings" | "conversations"
  }
>(({ workspace, focus }, ref) => {
  const navigate = useNavigate()
  const [showAllConversations, setShowAllConversations] = useState(false)
  const sections: Array<{
    id: "tasks" | "meetings" | "conversations"
    title: string
    icon: typeof ListChecks
    rows: SectionRow[]
  }> = [
    {
      id: "tasks",
      title: "کارهای امروز",
      icon: ListChecks,
      rows: workspace.today.tasks.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.company?.brandName || item.company?.legalName || "بدون شرکت"} · ${item.dueAt ? formatRelativeOperationTime(item.dueAt) : "بدون زمان"}`,
        details: [] as string[],
        onClick: () => navigate(`/tasks/${item.id}`),
      })),
    },
    {
      id: "meetings",
      title: "جلسات امروز",
      icon: CalendarDays,
      rows: workspace.today.meetings.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.company?.brandName || item.company?.legalName || "بدون شرکت"} · ${formatRelativeOperationTime(item.startAt)}`,
        details: [] as string[],
        onClick: () => navigate(`/meetings/${item.id}`),
      })),
    },
    {
      id: "conversations",
      title: "گفتگوهای اخیر",
      icon: MessageSquareText,
      rows: workspace.recentConversations.map((item) => ({
        id: item.threadId,
        title:
          item.context.task?.title ||
          item.context.opportunity?.title ||
          item.context.company?.name ||
          "گفتگوی مرتبط",
        meta: `${item.unreadCount.toLocaleString("fa-IR")} خوانده‌نشده · ${formatRelativeOperationTime(item.updatedAt)}`,
        preview: item.latestMessage?.body || "گفتگوی بدون پیام",
        conversation: item,
        details: [] as string[],
        onClick: () =>
          navigate(
            item.entityType === "COMPANY"
              ? `/companies/${item.entityId}`
              : item.entityType === "TASK"
                ? `/tasks/${item.entityId}`
                : `/activities`
          ),
      })),
    },
  ]
  return (
    <section
      ref={ref}
      id="operations-today"
      aria-labelledby="operations-today-title"
      className="grid scroll-mt-24 gap-3"
    >
      <div>
        <h2 id="operations-today-title" className="ui-section-title">
          امروز من
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          کارها، جلسه‌ها و گفتگوهایی که الان نیاز به توجه دارند.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {sections.map(({ id, title, icon: Icon, rows }) => (
          <SurfaceCard
            key={id}
            className={`overflow-hidden p-0 ${focus === id ? "ring-2 ring-[var(--app-primary)]" : ""}`}
          >
            <header className="flex items-center justify-between border-b border-[var(--app-divider)] p-4">
              <span className="flex items-center gap-2 font-bold">
                <Icon className="size-4 text-[var(--app-primary)]" />
                {title}
              </span>
              <span className="flex items-center gap-2">
                {id === "conversations" && rows.length ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setShowAllConversations(true)}
                  >
                    مشاهده همه
                  </Button>
                ) : null}
                <StatusBadge size="xs" tone={rows.length ? "info" : "neutral"}>
                  {rows.length.toLocaleString("fa-IR")}
                </StatusBadge>
              </span>
            </header>
            <div className="grid divide-y divide-[var(--app-divider)]">
              {rows.slice(0, 5).map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={row.onClick}
                  className="min-w-0 p-3 text-start hover:bg-[var(--app-background)]"
                >
                  <span className="block truncate text-sm font-semibold">
                    {row.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {row.meta}
                  </span>
                  {row.preview ? (
                    <span className="mt-1.5 block truncate text-xs text-muted-foreground">
                      {row.preview}
                    </span>
                  ) : null}
                  {row.conversation ? (
                    <ConversationBadges
                      conversation={row.conversation}
                      compact
                    />
                  ) : null}
                  {row.details.length ? (
                    <span className="mt-2 grid gap-1 text-xs leading-5 text-muted-foreground">
                      {row.details.map((detail) => (
                        <span key={detail} className="line-clamp-2">
                          {detail}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </button>
              ))}
              {!rows.length ? (
                <p className="p-5 text-center text-xs text-muted-foreground">
                  موردی برای امروز نیست.
                </p>
              ) : null}
            </div>
          </SurfaceCard>
        ))}
      </div>
      <ConversationsDialog
        open={showAllConversations}
        conversations={workspace.recentConversations}
        onClose={() => setShowAllConversations(false)}
        onOpen={(entityType, entityId) => {
          setShowAllConversations(false)
          navigate(
            entityType === "COMPANY"
              ? `/companies/${entityId}`
              : entityType === "TASK"
                ? `/tasks/${entityId}`
                : "/activities"
          )
        }}
      />
    </section>
  )
})
OperationsTodaySection.displayName = "OperationsTodaySection"

function conversationContextLabel(
  context: OperationsWorkspace["recentConversations"][number]["context"]
) {
  return [
    context.company ? `شرکت: ${context.company.name}` : null,
    context.opportunity ? `فرصت: ${context.opportunity.title}` : null,
    context.task ? `کار: ${context.task.title}` : null,
  ]
    .filter(Boolean)
    .join(" · ")
}

function ConversationBadges({
  conversation,
  compact = false,
}: {
  conversation: Conversation
  compact?: boolean
}) {
  const primaryContext = conversation.context.task
    ? {
        icon: ClipboardList,
        label: conversation.context.task.title,
        tone: "warning" as const,
      }
    : conversation.context.opportunity
      ? {
          icon: BriefcaseBusiness,
          label: conversation.context.opportunity.title,
          tone: "info" as const,
        }
      : conversation.context.company
        ? {
            icon: Building2,
            label: conversation.context.company.name,
            tone: "neutral" as const,
          }
        : null
  return (
    <span className="mt-2 flex flex-wrap gap-1.5">
      <StatusBadge size="xs" tone="neutral" icon={UserRound}>
        {conversation.createdBy.fullName}
      </StatusBadge>
      {conversation.relatedUsers.length ? (
        <StatusBadge size="xs" tone="info" icon={UsersRound}>
          {conversation.relatedUsers.length.toLocaleString("fa-IR")} نفر مرتبط
        </StatusBadge>
      ) : null}
      {compact && primaryContext ? (
        <StatusBadge
          size="xs"
          tone={primaryContext.tone}
          icon={primaryContext.icon}
        >
          {primaryContext.label}
        </StatusBadge>
      ) : null}
      {!compact && conversation.context.company ? (
        <StatusBadge size="xs" tone="neutral" icon={Building2}>
          {conversation.context.company.name}
        </StatusBadge>
      ) : null}
      {!compact && conversation.context.opportunity ? (
        <StatusBadge size="xs" tone="info" icon={BriefcaseBusiness}>
          {conversation.context.opportunity.title}
        </StatusBadge>
      ) : null}
      {!compact && conversation.context.task ? (
        <StatusBadge size="xs" tone="warning" icon={ClipboardList}>
          {conversation.context.task.title}
        </StatusBadge>
      ) : null}
    </span>
  )
}

function ConversationsDialog({
  open,
  conversations,
  onClose,
  onOpen,
}: {
  open: boolean
  conversations: Conversation[]
  onClose: () => void
  onOpen: (entityType: Conversation["entityType"], entityId: string) => void
}) {
  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title="گفتگوهای اخیر من"
      description="گفتگوهای مرتبط با شما همراه با اشخاص و زمینه CRM"
      icon={MessageSquareText}
      width="max-w-3xl"
    >
      <div className="grid gap-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.threadId}
            type="button"
            className="min-w-0 rounded-xl border border-[var(--app-divider)] p-3 text-start transition-colors hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-background)]"
            onClick={() =>
              onOpen(conversation.entityType, conversation.entityId)
            }
          >
            <span className="flex min-w-0 items-start justify-between gap-3">
              <span className="min-w-0">
                <strong className="block truncate text-sm">
                  {conversation.context.task?.title ||
                    conversation.context.opportunity?.title ||
                    conversation.context.company?.name ||
                    "گفتگوی مرتبط"}
                </strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {conversation.latestMessage?.body || "گفتگوی بدون پیام"}
                </span>
              </span>
              <StatusBadge
                size="xs"
                tone={conversation.unreadCount ? "info" : "neutral"}
              >
                {conversation.unreadCount
                  ? `${conversation.unreadCount.toLocaleString("fa-IR")} خوانده‌نشده`
                  : "خوانده‌شده"}
              </StatusBadge>
            </span>
            <ConversationBadges conversation={conversation} />
            {conversation.relatedUsers.length ? (
              <span className="mt-2 block truncate text-xs text-muted-foreground">
                افراد مرتبط:{" "}
                {conversation.relatedUsers
                  .map((item) => item.fullName)
                  .join("، ")}
              </span>
            ) : null}
            <span className="mt-2 block text-[11px] text-muted-foreground">
              {conversationContextLabel(conversation.context)} ·{" "}
              {formatRelativeOperationTime(conversation.updatedAt)}
            </span>
          </button>
        ))}
      </div>
    </ResponsiveModal>
  )
}
