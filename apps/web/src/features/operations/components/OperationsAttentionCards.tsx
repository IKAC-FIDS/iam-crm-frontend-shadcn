import {
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  ListChecks,
  MessageSquareText,
} from "lucide-react"
import { MetricCard } from "@/components/shared/MetricCard"
import type { OperationsWorkspace } from "../types/operations.types"

const cards = [
  {
    id: "today",
    label: "کارهای امروز",
    key: "dueTodayTasks",
    icon: ListChecks,
    tone: "warning",
  },
  {
    id: "overdue",
    label: "کارهای عقب‌افتاده",
    key: "overdueTasks",
    icon: AlertTriangle,
    tone: "warning",
  },
  {
    id: "unread",
    label: "پیام‌های جدید",
    key: "unreadConversationMessages",
    icon: MessageSquareText,
    tone: "info",
  },
  {
    id: "meetings",
    label: "جلسات امروز",
    key: "meetingsToday",
    icon: CalendarDays,
    tone: "primary",
  },
  {
    id: "active",
    label: "فرصت‌های فعال",
    key: "activeOpportunities",
    icon: BriefcaseBusiness,
    tone: "success",
  },
] as const

export function OperationsAttentionCards({
  attention,
  capabilities,
  active,
  onSelect,
}: {
  attention: OperationsWorkspace["attention"]
  capabilities?: OperationsWorkspace["capabilities"]
  active?: string
  onSelect: (id: string) => void
}) {
  return (
    <section
      aria-label="خلاصه عملیات روزانه"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
    >
      {cards
        .filter(({ id }) =>
          id === "unread"
            ? capabilities?.conversations !== false
            : id === "meetings"
              ? capabilities?.meetings !== false
              : id === "active"
                ? capabilities?.opportunities !== false
                : capabilities?.tasks !== false
        )
        .map(({ id, label, key, icon, tone }) => (
          <MetricCard
            key={id}
            label={label}
            value={attention[key].toLocaleString("fa-IR")}
            icon={icon}
            tone={tone}
            active={active === id}
            onClick={() => onSelect(id)}
          />
        ))}
    </section>
  )
}
