import { BriefcaseBusiness, Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

import {
  useCreateEmploymentHistory,
  useCreateEmploymentPosition,
  useDeleteEmploymentHistory,
  useDeleteEmploymentPosition,
  usePersonEmploymentHistory,
  useUpdateEmploymentHistory,
  useUpdateEmploymentPosition,
} from "../hooks/usePeople"
import type {
  EmploymentHistory,
  EmploymentHistoryPayload,
  EmploymentPosition,
  EmploymentPositionPayload,
} from "../types/person.types"
import { getPeopleErrorMessage } from "../utils/peopleError"
import { formatPersonDate } from "../utils/personFormatters"
import { EmptyLine, RowActions, SectionHeader } from "./PersonContactsSection"
import { PersonEmploymentDialog } from "./PersonEmploymentDialog"
import { PersonPositionDialog } from "./PersonPositionDialog"

type PositionTarget = {
  employment: EmploymentHistory
  position: EmploymentPosition | null
}

type TimelineItem = PositionTarget & { showEmploymentActions: boolean }

function positionTime(position: EmploymentPosition | null) {
  if (!position?.startDate) return Number.MAX_SAFE_INTEGER
  const timestamp = new Date(position.startDate).getTime()
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp
}

export function PersonEmploymentSection({
  personId,
  canEdit,
}: {
  personId: string
  canEdit: boolean
}) {
  const text = uiText.people
  const query = usePersonEmploymentHistory(personId)
  const createEmployment = useCreateEmploymentHistory(personId)
  const updateEmployment = useUpdateEmploymentHistory(personId)
  const deleteEmployment = useDeleteEmploymentHistory(personId)
  const createPosition = useCreateEmploymentPosition(personId)
  const updatePosition = useUpdateEmploymentPosition(personId)
  const deletePosition = useDeleteEmploymentPosition(personId)
  const [editingEmployment, setEditingEmployment] =
    useState<EmploymentHistory | null | undefined>(undefined)
  const [editingPosition, setEditingPosition] =
    useState<PositionTarget | undefined>()
  const [deletingEmployment, setDeletingEmployment] =
    useState<EmploymentHistory | null>(null)
  const [deletingPosition, setDeletingPosition] =
    useState<PositionTarget | undefined>()

  const histories = Array.isArray(query.data) ? query.data : []
  const timeline = useMemo<TimelineItem[]>(() => {
    const flattened = histories.flatMap<PositionTarget>((employment) => {
      const positions = Array.isArray(employment.positions)
        ? employment.positions
        : []
      return positions.length
        ? positions.map((position) => ({ employment, position }))
        : [{ employment, position: null }]
    })
    flattened.sort(
      (left, right) => positionTime(left.position) - positionTime(right.position),
    )
    const seenEmployment = new Set<string>()
    return flattened.map((item) => {
      const showEmploymentActions = !seenEmployment.has(item.employment.id)
      seenEmployment.add(item.employment.id)
      return { ...item, showEmploymentActions }
    })
  }, [histories])

  async function saveEmployment(payload: EmploymentHistoryPayload) {
    if (editingEmployment) {
      await updateEmployment.mutateAsync({ id: editingEmployment.id, payload })
    } else {
      await createEmployment.mutateAsync(payload)
    }
    setEditingEmployment(undefined)
  }

  async function savePosition(payload: EmploymentPositionPayload) {
    if (!editingPosition) return
    if (editingPosition.position) {
      await updatePosition.mutateAsync({
        employmentId: editingPosition.employment.id,
        positionId: editingPosition.position.id,
        payload,
      })
    } else {
      await createPosition.mutateAsync({
        employmentId: editingPosition.employment.id,
        payload,
      })
    }
    setEditingPosition(undefined)
  }

  return (
    <>
      <SectionHeader
        title={text.sections.career}
        canEdit={canEdit}
        addLabel={text.career.addEmployment}
        onAdd={() => setEditingEmployment(null)}
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState
          title={text.nested.loadError}
          description={getPeopleErrorMessage(
            query.error,
            text.nested.loadError,
          )}
          retryLabel={uiText.common.retry}
          onRetry={() => void query.refetch()}
        />
      ) : timeline.length ? (
        <div className="relative grid max-h-[590px] gap-3 overflow-y-auto overscroll-contain pe-1 before:absolute before:bottom-5 before:right-[11px] before:top-5 before:w-px before:bg-[var(--app-divider)]">
          {timeline.map(({ employment, position, showEmploymentActions }) => {
            const companyName =
              employment.company?.brandName ||
              employment.company?.legalName ||
              text.notSpecified
            const start = formatPersonDate(position?.startDate)
            const end = position?.isCurrent
              ? text.career.present
              : formatPersonDate(position?.endDate)

            return (
              <div
                key={`${employment.id}:${position?.id || "empty"}`}
                className="relative flex gap-4"
              >
                <span className="relative z-10 mt-4 grid size-[23px] shrink-0 place-items-center rounded-full border-4 border-[var(--app-surface)] bg-[var(--app-primary)]">
                  <BriefcaseBusiness className="size-2.5 text-white" />
                </span>

                <article className="min-w-0 flex-1 rounded-[18px] border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[var(--app-primary)]">
                        {[start || text.notSpecified, end || text.notSpecified].join(
                          " — ",
                        )}
                      </p>
                      <p className="mt-1.5 truncate text-sm font-bold text-[var(--app-heading)]">
                        {companyName}
                      </p>
                      {position ? (
                        <div className="mt-2">
                          <p className="text-[9px] font-bold text-[var(--app-text-secondary)]">
                            {text.career.position}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold text-[var(--app-heading)]">
                              {position.title}
                            </p>
                            {position.isCurrent ? (
                              <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-[8px] font-bold text-[var(--app-primary)]">
                                {text.career.current}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-[10px] text-[var(--app-text-secondary)]">
                          {text.career.noPositions}
                        </p>
                      )}
                    </div>

                    {canEdit && position ? (
                      <RowActions
                        onEdit={() =>
                          setEditingPosition({ employment, position })
                        }
                        onDelete={() =>
                          setDeletingPosition({ employment, position })
                        }
                      />
                    ) : null}
                  </div>

                  {position?.description ? (
                    <p
                      className="mt-2 line-clamp-2 text-[10px] leading-5 text-[var(--app-text-secondary)]"
                      title={position.description}
                    >
                      {position.description}
                    </p>
                  ) : employment.description ? (
                    <p
                      className="mt-2 line-clamp-2 text-[10px] leading-5 text-[var(--app-text-secondary)]"
                      title={employment.description}
                    >
                      {employment.description}
                    </p>
                  ) : null}

                  {canEdit && showEmploymentActions ? (
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--app-divider)] pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 rounded-lg text-[10px] text-[var(--app-primary)]"
                        onClick={() =>
                          setEditingPosition({ employment, position: null })
                        }
                      >
                        <Plus className="size-3.5" />
                        {text.career.addPosition}
                      </Button>
                      <div aria-label={text.career.companyActions}>
                        <RowActions
                          onEdit={() => setEditingEmployment(employment)}
                          onDelete={() => setDeletingEmployment(employment)}
                        />
                      </div>
                    </div>
                  ) : null}
                </article>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyLine>{text.empty.career}</EmptyLine>
      )}

      <PersonEmploymentDialog
        open={editingEmployment !== undefined}
        onOpenChange={(open) => {
          if (!open) setEditingEmployment(undefined)
        }}
        employment={editingEmployment}
        isPending={createEmployment.isPending || updateEmployment.isPending}
        error={createEmployment.error || updateEmployment.error}
        onSubmit={saveEmployment}
      />
      <PersonPositionDialog
        open={Boolean(editingPosition)}
        onOpenChange={(open) => {
          if (!open) setEditingPosition(undefined)
        }}
        position={editingPosition?.position}
        isPending={createPosition.isPending || updatePosition.isPending}
        error={createPosition.error || updatePosition.error}
        onSubmit={savePosition}
      />
      <ConfirmDialog
        open={Boolean(deletingEmployment)}
        onOpenChange={(open) => {
          if (!open) setDeletingEmployment(null)
        }}
        title={text.career.deleteEmploymentTitle}
        description={
          deleteEmployment.error
            ? getPeopleErrorMessage(
                deleteEmployment.error,
                text.nested.deleteError,
              )
            : text.career.deleteEmploymentDescription
        }
        confirmLabel={text.actions.delete}
        isPending={deleteEmployment.isPending}
        onConfirm={async () => {
          if (!deletingEmployment) return
          await deleteEmployment.mutateAsync(deletingEmployment.id)
          setDeletingEmployment(null)
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingPosition)}
        onOpenChange={(open) => {
          if (!open) setDeletingPosition(undefined)
        }}
        title={text.career.deletePositionTitle}
        description={
          deletePosition.error
            ? getPeopleErrorMessage(deletePosition.error, text.nested.deleteError)
            : text.career.deletePositionDescription
        }
        confirmLabel={text.actions.delete}
        isPending={deletePosition.isPending}
        onConfirm={async () => {
          if (!deletingPosition?.position) return
          await deletePosition.mutateAsync({
            employmentId: deletingPosition.employment.id,
            positionId: deletingPosition.position.id,
          })
          setDeletingPosition(undefined)
        }}
      />
    </>
  )
}
