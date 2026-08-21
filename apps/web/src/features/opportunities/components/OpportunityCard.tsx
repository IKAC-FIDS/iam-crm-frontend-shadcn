import { CalendarDays, CircleDollarSign, GripVertical, UserRound } from "lucide-react"
import type { DragEvent } from "react"

import { uiText } from "@/config/uiText"
import type { Opportunity } from "../types/opportunity.types"
import { formatOpportunityDate, formatOpportunityValue, opportunityCompanyName, priorityLabel } from "../utils/opportunityFormatters"
import { OpportunityActionsMenu, type OpportunityActionPermissions } from "./OpportunityActionsMenu"

export function OpportunityCard({
  opportunity,
  permissions,
  dragging,
  onDragStart,
  onDragEnd,
  onView,
  onEdit,
  onChangeOwner,
  onChangeStage,
  onArchiveToggle,
}: {
  opportunity: Opportunity
  permissions: OpportunityActionPermissions
  dragging: boolean
  onDragStart: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onView: () => void
  onEdit: () => void
  onChangeOwner: () => void
  onChangeStage: () => void
  onArchiveToggle: () => void
}) {
  const canDrag = permissions.changeStage && !opportunity.archivedAt
  return (
    <article
      draggable={canDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onView}
      className={[
        "group rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-[var(--app-primary)]/25 hover:shadow-md",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        dragging ? "scale-[1.02] opacity-45 shadow-xl" : "",
        opportunity.archivedAt ? "border-dashed opacity-70" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        {canDrag ? <GripVertical className="mt-1 size-4 shrink-0 text-[var(--app-icon-muted)]" aria-label={uiText.opportunities.pipeline.dragHint} /> : null}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-xs font-bold leading-6 text-[var(--app-heading)]">{opportunity.title}</h3>
          <p className="mt-0.5 truncate text-[10px] text-[var(--app-text-secondary)]">{opportunityCompanyName(opportunity)}</p>
        </div>
        <OpportunityActionsMenu opportunity={opportunity} permissions={permissions} onView={onView} onEdit={onEdit} onChangeOwner={onChangeOwner} onChangeStage={onChangeStage} onArchiveToggle={onArchiveToggle} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-[9px] font-bold text-[var(--app-primary)]">{priorityLabel(opportunity.priority)}</span>
        {opportunity.probability !== null && opportunity.probability !== undefined ? <span className="text-[10px] font-bold text-[var(--app-heading)]">{opportunity.probability.toLocaleString("fa-IR")}%</span> : null}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[var(--app-heading)]">
        <CircleDollarSign className="size-3.5 text-[var(--app-primary)]" />
        {formatOpportunityValue(opportunity.estimatedValue)}
        <span className="text-[9px] font-normal text-[var(--app-text-secondary)]">{uiText.opportunities.fields.valueUnit}</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--app-divider)] pt-2.5 text-[9px] text-[var(--app-text-secondary)]">
        <span className="flex min-w-0 items-center gap-1"><UserRound className="size-3 shrink-0" /><span className="truncate">{opportunity.owner?.fullName || uiText.opportunities.fields.noOwner}</span></span>
        <span className="flex min-w-0 items-center justify-end gap-1"><CalendarDays className="size-3 shrink-0" /><span className="truncate">{formatOpportunityDate(opportunity.expectedCloseDate)}</span></span>
      </div>
    </article>
  )
}

