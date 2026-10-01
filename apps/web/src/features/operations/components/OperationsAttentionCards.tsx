import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  ListChecks,
  MessageSquareText,
} from "lucide-react"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import type { OperationsWorkspace } from "../types/operations.types"

const cards: Array<{
  id: string
  label: string
  key: keyof OperationsWorkspace["attention"]
  icon: LucideIcon
  tone: string
}> = [
  {
    id: "today",
    label: "کارهای امروز",
    key: "dueTodayTasks",
    icon: ListChecks,
    tone: "text-[var(--warning)] bg-[var(--warning-light)]",
  },
  {
    id: "overdue",
    label: "کارهای عقب‌افتاده",
    key: "overdueTasks",
    icon: AlertTriangle,
    tone: "text-[var(--destructive)] bg-[var(--destructive-soft)]",
  },
  {
    id: "unread",
    label: "پیام‌های جدید",
    key: "unreadConversationMessages",
    icon: MessageSquareText,
    tone: "text-[var(--info)] bg-[var(--info-light)]",
  },
  {
    id: "meetings",
    label: "جلسات امروز",
    key: "meetingsToday",
    icon: CalendarDays,
    tone: "text-[var(--app-primary)] bg-[var(--app-primary-soft)]",
  },
  {
    id: "active",
    label: "فرصت‌های فعال",
    key: "activeOpportunities",
    icon: BriefcaseBusiness,
    tone: "text-[var(--success)] bg-[var(--success-light)]",
  },
]

export function OperationsAttentionCards({
  attention,
  onSelect,
}: {
  attention: OperationsWorkspace["attention"]
  onSelect: (id: string) => void
}) {
  return (
    <section
      aria-label="خلاصه عملیات روزانه"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
    >
      {cards.map(({ id, label, key, icon: Icon, tone }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className="min-w-0 rounded-[var(--app-radius-card)] text-start focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:outline-none"
        >
          <SurfaceCard className="flex h-full items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-[var(--app-primary)]/35 hover:shadow-sm">
            <span
              className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}
            >
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-[var(--app-text-secondary)]">
                {label}
              </span>
              <strong className="mt-1 block text-xl text-[var(--app-heading)]">
                {attention[key].toLocaleString("fa-IR")}
              </strong>
            </span>
          </SurfaceCard>
        </button>
      ))}
    </section>
  )
}
