import { Pencil, Plus, Trash2 } from "lucide-react"
import type { ReactNode } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"

export function PersonNestedSectionHeader({
  title,
  canEdit,
  addLabel,
  onAdd,
}: {
  title: string
  canEdit: boolean
  addLabel: string
  onAdd: () => void
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-[var(--app-heading)]">{title}</h3>
      {canEdit ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={onAdd}
        >
          <Plus aria-hidden="true" className="size-3.5" />
          {addLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function PersonNestedRowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-lg"
        aria-label={uiText.people.actions.edit}
        onClick={onEdit}
      >
        <Pencil aria-hidden="true" className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-lg text-[var(--destructive)]"
        aria-label={uiText.people.actions.delete}
        onClick={onDelete}
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
      </Button>
    </div>
  )
}

export function PersonPrimaryBadge() {
  return (
    <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-xs font-bold text-[var(--app-primary)]">
      {uiText.people.nested.primary}
    </span>
  )
}

export function PersonNestedEmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl bg-[var(--app-background)]/55 p-4 text-center text-xs text-[var(--app-text-secondary)]">
      {children}
    </p>
  )
}
