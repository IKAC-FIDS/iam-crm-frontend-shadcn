import { forwardRef } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarDays, ListChecks, MessageSquareText } from "lucide-react"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { OperationsWorkspace } from "../types/operations.types"
import { formatRelativeOperationTime } from "../utils/operationsFormatters"

export const OperationsTodaySection = forwardRef<
  HTMLElement,
  {
    workspace: OperationsWorkspace
    focus?: "tasks" | "meetings" | "conversations"
  }
>(({ workspace, focus }, ref) => {
  const navigate = useNavigate()
  const sections = [
    {
      id: "tasks",
      title: "کارهای امروز",
      icon: ListChecks,
      rows: workspace.today.tasks.map((item) => ({
        id: item.id,
        title: item.title,
        meta: `${item.company?.brandName || item.company?.legalName || "بدون شرکت"} · ${item.dueAt ? formatRelativeOperationTime(item.dueAt) : "بدون زمان"}`,
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
        onClick: () => navigate(`/meetings/${item.id}`),
      })),
    },
    {
      id: "conversations",
      title: "گفتگوهای اخیر",
      icon: MessageSquareText,
      rows: workspace.recentConversations.map((item) => ({
        id: item.threadId,
        title: item.latestMessage?.body || "گفتگوی بدون پیام",
        meta: `${item.unreadCount.toLocaleString("fa-IR")} خوانده‌نشده · ${formatRelativeOperationTime(item.updatedAt)}`,
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
  ] as const
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
              <StatusBadge size="xs" tone={rows.length ? "info" : "neutral"}>
                {rows.length.toLocaleString("fa-IR")}
              </StatusBadge>
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
    </section>
  )
})
OperationsTodaySection.displayName = "OperationsTodaySection"
