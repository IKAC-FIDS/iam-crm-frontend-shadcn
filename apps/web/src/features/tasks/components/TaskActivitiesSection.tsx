import { Activity as ActivityIcon, ListTree, Plus } from "lucide-react"
import { useState } from "react"

import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { ActivityFormDialog } from "@/features/activities/components/ActivityFormDialog"
import { useTaskActivities } from "@/features/activities/hooks/useActivities"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import type { Task } from "../types/task.types"

export function TaskActivitiesSection({ task }: { task: Task }) {
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const canView = permissions.includes("activity:view")
  const canCreate = permissions.includes("activity:create")
  const [includeSubtasks, setIncludeSubtasks] = useState(false)
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const query = useTaskActivities(
    task.id,
    includeSubtasks,
    page,
    canView
  )

  if (!canView) return null

  const taskOption = {
    id: task.id,
    label: task.title,
    secondary: task.parentTask?.title
      ? `زیرکار «${task.parentTask.title}»`
      : "کار اصلی",
  }

  return (
    <SurfaceCard className="min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-divider)] p-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="size-4 text-[var(--app-primary)]" />
            <h2 className="text-sm font-bold">فعالیت‌های مرتبط</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
            تاریخچه اقدام‌های انجام‌شده برای این کار و در صورت نیاز زیرکارهای آن
          </p>
        </div>
        {canCreate && task.status !== "DONE" && task.status !== "CANCELLED" ? (
          <Button
            size="sm"
            className="rounded-xl"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            ثبت فعالیت
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--app-divider)] p-3">
        <Button
          size="sm"
          variant={!includeSubtasks ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => {
            setIncludeSubtasks(false)
            setPage(1)
          }}
        >
          این کار
        </Button>
        <Button
          size="sm"
          variant={includeSubtasks ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => {
            setIncludeSubtasks(true)
            setPage(1)
          }}
        >
          <ListTree className="size-4" />
          این کار و زیرکارها
        </Button>
      </div>

      <div className="min-h-40 p-4 sm:p-5">
        {query.isLoading ? (
          <LoadingState rows={3} />
        ) : query.isError ? (
          <ErrorState
            title="خطا در دریافت فعالیت‌ها"
            description="دریافت تاریخچه فعالیت‌های کار انجام نشد."
            onRetry={() => void query.refetch()}
          />
        ) : query.data?.data.length ? (
          <div className="grid gap-3">
            {query.data.data.map((activity) => (
              <article
                key={activity.id}
                className="rounded-2xl border border-[var(--app-divider)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-xs text-[var(--app-heading)]">
                        {activity.outcome?.trim() ||
                          activity.notes?.trim() ||
                          activity.type}
                      </strong>
                      <StatusBadge tone="neutral" dot={false}>
                        {activity.type}
                      </StatusBadge>
                    </div>
                    {activity.notes?.trim() &&
                    activity.outcome?.trim() !== activity.notes?.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-[var(--app-text-secondary)]">
                        {activity.notes}
                      </p>
                    ) : null}
                  </div>
                  <time className="shrink-0 text-xs text-[var(--app-text-secondary)]">
                    {formatJalaliDateTime(
                      activity.occurredAt ||
                        activity.activityDate ||
                        activity.createdAt ||
                        ""
                    )}
                  </time>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--app-text-secondary)]">
                  <span>
                    انجام‌دهنده:{" "}
                    <strong className="text-[var(--app-heading)]">
                      {activity.createdBy?.fullName ||
                        activity.user?.fullName ||
                        "—"}
                    </strong>
                  </span>
                  <span>
                    مربوط به:{" "}
                    <strong className="text-[var(--app-heading)]">
                      {activity.task?.parentTask?.title
                        ? `${activity.task.title} (زیرکار ${activity.task.parentTask.title})`
                        : activity.task?.title || task.title}
                    </strong>
                  </span>
                  {activity.company ? (
                    <span>
                      شرکت:{" "}
                      <strong className="text-[var(--app-heading)]">
                        {activity.company.brandName ||
                          activity.company.legalName}
                      </strong>
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ActivityIcon}
            title={
              includeSubtasks
                ? "برای این کار و زیرکارهای آن هنوز فعالیتی ثبت نشده است"
                : "برای این کار هنوز فعالیتی ثبت نشده است"
            }
            description="فعالیت‌های ثبت‌شده به ترتیب زمان در این بخش نمایش داده می‌شوند."
            action={
              canCreate &&
              task.status !== "DONE" &&
              task.status !== "CANCELLED" ? (
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="size-4" />
                  ثبت فعالیت
                </Button>
              ) : undefined
            }
          />
        )}

        {query.data && query.data.meta.totalPages > 1 ? (
          <PaginationControls
            page={query.data.meta.page}
            pageCount={query.data.meta.totalPages}
            total={query.data.meta.total}
            pageSize={20}
            onPageChange={setPage}
            disabled={query.isFetching}
          />
        ) : null}
      </div>

      {createOpen ? (
        <ActivityFormDialog
          open
          onOpenChange={(open) => {
            setCreateOpen(open)
            if (!open) void query.refetch()
          }}
          initialTargetType="TASK"
          initialTask={taskOption}
          lockTarget
        />
      ) : null}
    </SurfaceCard>
  )
}
