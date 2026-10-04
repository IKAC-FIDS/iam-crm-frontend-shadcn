import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  Building2,
  ListChecks,
  MessageSquareText,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EntityConversationPanel } from "@/features/conversations/components/EntityConversationPanel"
import { getCompanyConversationHub } from "@/features/conversations/api/conversations.api"
import type {
  CompanyConversationHubThread,
  CompanyConversationEntityType,
  ConversationEntityType,
} from "@/features/conversations/types/conversation.types"
import { formatRelativeOperationTime } from "../utils/operationsFormatters"

type Tab = "ALL" | CompanyConversationEntityType

export function CompanyConversationDialog({
  company,
  onClose,
}: {
  company: { id: string; legalName: string } | null
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>("ALL")
  const [selected, setSelected] = useState<{
    entityType: ConversationEntityType
    entityId: string
  } | null>(null)
  const query = useQuery({
    queryKey: ["conversations", "company-hub", company?.id],
    queryFn: () => getCompanyConversationHub(company!.id),
    enabled: Boolean(company),
  })
  const rows = useMemo(
    () =>
      (query.data?.threads ?? []).filter(
        (thread) => tab === "ALL" || thread.entityType === tab
      ),
    [query.data?.threads, tab]
  )
  const labels: Record<CompanyConversationEntityType, string> = {
    COMPANY: "گفتگوی مستقیم شرکت",
    TASK: "کار",
    ACTIVITY: "فعالیت",
  }
  const icons = { COMPANY: Building2, TASK: ListChecks, ACTIVITY: Activity }
  const close = () => {
    setSelected(null)
    setTab("ALL")
    onClose()
  }
  return (
    <ResponsiveModal
      open={Boolean(company)}
      onClose={close}
      title={company ? `گفتگوهای ${company.legalName}` : "گفتگوهای شرکت"}
      description="گفتگوی مستقیم شرکت و بحث‌های مرتبط با کارها و فعالیت‌ها"
      icon={MessageSquareText}
      width="max-w-5xl"
    >
      {company ? (
        selected ? (
          <div className="grid gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => setSelected(null)}
            >
              بازگشت به گفتگوهای مرتبط
            </Button>
            <EntityConversationPanel
              entityType={selected.entityType}
              entityId={selected.entityId}
              enabled
            />
          </div>
        ) : (
          <QueryContent
            query={query}
            errorTitle="دریافت گفتگوهای شرکت ناموفق بود"
          >
            <div className="grid gap-4">
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="نوع گفتگو"
              >
                {(["ALL", "COMPANY", "TASK", "ACTIVITY"] as Tab[]).map(
                  (value) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={tab === value ? "default" : "outline"}
                      onClick={() => setTab(value)}
                    >
                      {value === "ALL"
                        ? "همه"
                        : value === "COMPANY"
                          ? "شرکت"
                          : value === "TASK"
                            ? "کارها"
                            : "فعالیت‌ها"}
                    </Button>
                  )
                )}
              </div>
              {(tab === "ALL" || tab === "COMPANY") && !query.data?.direct ? (
                <button
                  type="button"
                  className="flex items-center justify-between rounded-xl border border-dashed border-[var(--app-divider)] p-4 text-start hover:border-[var(--app-primary)]"
                  onClick={() =>
                    setSelected({ entityType: "COMPANY", entityId: company.id })
                  }
                >
                  <span>
                    <strong className="block">گفتگوی مستقیم شرکت</strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      هنوز پیامی ثبت نشده؛ گفتگو را شروع کنید.
                    </span>
                  </span>
                  <span className="text-xs font-bold text-[var(--app-primary)]">
                    باز کردن
                  </span>
                </button>
              ) : null}
              <div className="grid gap-2">
                {rows.map((thread: CompanyConversationHubThread) => {
                  const Icon = icons[thread.entityType]
                  return (
                    <button
                      key={thread.threadId}
                      type="button"
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--app-divider)] p-3 text-start hover:border-[var(--app-primary)]/40"
                      onClick={() =>
                        setSelected({
                          entityType: thread.entityType,
                          entityId: thread.entityId,
                        })
                      }
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate">
                          {labels[thread.entityType]}: {thread.entityLabel}
                        </strong>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          {thread.latestMessage?.body || "بدون پیام"} ·{" "}
                          {formatRelativeOperationTime(thread.updatedAt)}
                        </span>
                      </span>
                      {thread.unreadCount ? (
                        <StatusBadge tone="info">
                          {thread.unreadCount.toLocaleString("fa-IR")} جدید
                        </StatusBadge>
                      ) : null}
                    </button>
                  )
                })}
                {!rows.length && !(tab === "ALL" || tab === "COMPANY") ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    گفتگوی مرتبطی در این بخش وجود ندارد.
                  </p>
                ) : null}
              </div>
            </div>
          </QueryContent>
        )
      ) : null}
    </ResponsiveModal>
  )
}
