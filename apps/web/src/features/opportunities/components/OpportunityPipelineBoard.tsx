import { Loader2 } from "lucide-react"
import { useMemo, useState, type DragEvent } from "react"

import { ErrorState } from "@/components/shared/ErrorState"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

import { usePipelineColumn } from "../hooks/useOpportunities"
import type { Opportunity, OpportunityFilters, OpportunityStage, OpportunityTransition } from "../types/opportunity.types"
import { formatOpportunityValue } from "../utils/opportunityFormatters"
import { OpportunityCard } from "./OpportunityCard"
import type { OpportunityActionPermissions } from "./OpportunityActionsMenu"

type Action = (opportunity: Opportunity) => void

export function OpportunityPipelineBoard({
  stages,
  transitions,
  filters,
  role,
  permissions,
  onView,
  onEdit,
  onChangeOwner,
  onChangeStage,
  onArchiveToggle,
  onDropStage,
}: {
  stages: OpportunityStage[]
  transitions: OpportunityTransition[] | null
  filters: OpportunityFilters
  role?: string
  permissions: OpportunityActionPermissions
  onView: Action
  onEdit: Action
  onChangeOwner: Action
  onChangeStage: Action
  onArchiveToggle: Action
  onDropStage: (opportunity: Opportunity, target: OpportunityStage) => void
}) {
  const [dragged, setDragged] = useState<Opportunity | null>(null)
  const validTargetIds = useMemo(() => {
    if (!dragged || !transitions) return new Set<string>()
    const candidates = transitions.filter((rule) => rule.fromStageId === dragged.stageId)
    const targets = new Set<string>()
    for (const target of stages) {
      const specific = candidates.find((rule) => rule.toStageId === target.id && rule.role === role)
      const general = candidates.find((rule) => rule.toStageId === target.id && rule.role == null)
      const selected = specific ?? general
      if (selected && (selected.isAllowed ?? selected.allowed ?? false)) targets.add(target.id)
    }
    return targets
  }, [dragged, role, stages, transitions])

  return (
    <div className="overflow-x-auto pb-3" dir="rtl">
      <div className="flex min-w-max items-start gap-3">
        {stages.map((stage) => (
          <PipelineLane
            key={stage.id}
            stage={stage}
            filters={filters}
            dragged={dragged}
            validDrop={Boolean(dragged && validTargetIds.has(stage.id))}
            invalidDrop={Boolean(dragged && stage.id !== dragged.stageId && !validTargetIds.has(stage.id))}
            permissions={permissions}
            onView={onView}
            onEdit={onEdit}
            onChangeOwner={onChangeOwner}
            onChangeStage={onChangeStage}
            onArchiveToggle={onArchiveToggle}
            onDragStart={(event, opportunity) => {
              event.dataTransfer.effectAllowed = "move"
              event.dataTransfer.setData("text/plain", opportunity.id)
              setDragged(opportunity)
            }}
            onDragEnd={() => setDragged(null)}
            onDrop={() => {
              if (dragged && validTargetIds.has(stage.id)) onDropStage(dragged, stage)
              setDragged(null)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function PipelineLane({
  stage,
  filters,
  dragged,
  validDrop,
  invalidDrop,
  permissions,
  onView,
  onEdit,
  onChangeOwner,
  onChangeStage,
  onArchiveToggle,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  stage: OpportunityStage
  filters: OpportunityFilters
  dragged: Opportunity | null
  validDrop: boolean
  invalidDrop: boolean
  permissions: OpportunityActionPermissions
  onView: Action
  onEdit: Action
  onChangeOwner: Action
  onChangeStage: Action
  onArchiveToggle: Action
  onDragStart: (event: DragEvent<HTMLElement>, opportunity: Opportunity) => void
  onDragEnd: () => void
  onDrop: () => void
}) {
  const text = uiText.opportunities.pipeline
  const query = usePipelineColumn(stage.id, filters)
  const pages = query.data?.pages ?? []
  const items = pages.flatMap((page) => Array.isArray(page.data) ? page.data : [])
  const total = pages[0]?.meta.total ?? 0
  const loadedValue = items.reduce((sum, item) => sum + (Number(item.estimatedValue) || 0), 0)
  const accent = stage.color || "var(--app-primary)"

  return (
    <section
      className={[
        "flex h-[clamp(520px,calc(100vh-300px),680px)] w-[300px] shrink-0 flex-col overflow-hidden rounded-[22px] border bg-[var(--app-background)]/75 transition sm:w-[320px]",
        validDrop ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]/45 ring-2 ring-[var(--app-primary)]/15" : "border-[var(--app-divider)]",
        invalidDrop ? "opacity-55 saturate-50" : "",
      ].join(" ")}
      onDragOver={(event) => {
        if (validDrop) {
          event.preventDefault()
          event.dataTransfer.dropEffect = "move"
        }
      }}
      onDrop={(event) => { event.preventDefault(); if (validDrop) onDrop() }}
      title={invalidDrop ? text.invalidTarget : undefined}
    >
      <div className="h-1 shrink-0" style={{ backgroundColor: accent }} />
      <header className="shrink-0 border-b border-[var(--app-divider)] bg-[var(--app-surface)]/90 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
            <h2 className="truncate text-sm font-bold text-[var(--app-heading)]">{stage.label}</h2>
          </div>
          <span className="rounded-full border border-[var(--app-divider)] bg-[var(--app-background)] px-2 py-1 text-xs font-bold text-[var(--app-primary)]">{total.toLocaleString("fa-IR")} {text.count}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--app-text-secondary)]">
          <span>{text.loadedValue}</span>
          <span className="font-bold text-[var(--app-heading)]">{formatOpportunityValue(loadedValue)} {uiText.opportunities.fields.valueUnit}</span>
        </div>
        {items.length < total ? <p className="mt-1 text-[8px] text-[var(--app-text-secondary)]">{text.partialValue}</p> : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        {query.isLoading ? <div className="grid h-32 place-items-center"><Loader2 className="size-5 animate-spin text-[var(--app-primary)]" /></div> : query.isError ? (
          <ErrorState title={uiText.opportunities.errors.listTitle} description={uiText.opportunities.errors.listDescription} retryLabel={uiText.common.retry} onRetry={() => void query.refetch()} />
        ) : items.length ? (
          <div className="grid gap-2.5">
            {items.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                permissions={permissions}
                dragging={dragged?.id === opportunity.id}
                onDragStart={(event) => onDragStart(event, opportunity)}
                onDragEnd={onDragEnd}
                onView={() => onView(opportunity)}
                onEdit={() => onEdit(opportunity)}
                onChangeOwner={() => onChangeOwner(opportunity)}
                onChangeStage={() => onChangeStage(opportunity)}
                onArchiveToggle={() => onArchiveToggle(opportunity)}
              />
            ))}
            {query.hasNextPage ? <Button type="button" variant="outline" size="sm" className="rounded-xl" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage ? <Loader2 className="size-4 animate-spin" /> : null}{uiText.opportunities.actions.loadMore}</Button> : null}
          </div>
        ) : <p className="py-12 text-center text-xs text-[var(--app-text-secondary)]">{text.emptyStage}</p>}
      </div>
    </section>
  )
}
