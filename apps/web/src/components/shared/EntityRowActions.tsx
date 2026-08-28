import { useState, type ReactNode } from "react"
import { Eye, MoreHorizontal, type LucideIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu"
import { ConfirmDialog } from "./ConfirmDialog"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { uiText } from "@/config/uiText"

export type EntityAction = {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void | Promise<unknown>
  enabled?: boolean
  disabled?: boolean
  tone?: "default" | "danger"
  confirmation?: { title: string; description: string }
}
export function EntityRowActions({
  label,
  onView,
  children,
  actions = [],
}: {
  label?: string
  onView?: () => void
  children?: ReactNode
  actions?: readonly EntityAction[]
}) {
  const [confirm, setConfirm] = useState<EntityAction>()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const available: EntityAction[] = [
    ...(onView
      ? [
          {
            id: "view",
            label: label || uiText.common.view,
            icon: Eye,
            onClick: onView,
          },
        ]
      : []),
    ...actions,
  ].filter((action) => action.enabled !== false)
  const direct = available.filter(
    (action) => action.id === "view" || action.id === "edit"
  )
  const overflow = available.filter(
    (action) => action.id !== "view" && action.id !== "edit"
  )
  async function run(action: EntityAction) {
    setPending(true)
    setError(undefined)
    try {
      await action.onClick()
      setConfirm(undefined)
    } catch (error) {
      setError(getApiErrorMessage(error, uiText.app.unexpected))
    } finally {
      setPending(false)
    }
  }
  function activate(action: EntityAction) {
    if (action.confirmation) {
      setError(undefined)
      setConfirm(action)
    } else void run(action)
  }
  if (!available.length && !children) return null
  return (
    <div
      className="flex min-w-20 items-center justify-end gap-1"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {children}
      {direct.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant="ghost"
          size="icon-sm"
          className={
            action.tone === "danger"
              ? "shrink-0 rounded-xl text-destructive"
              : "shrink-0 rounded-xl text-[var(--app-primary)]"
          }
          aria-label={action.label}
          title={action.label}
          disabled={action.disabled || pending}
          onClick={() => activate(action)}
        >
          <action.icon aria-hidden="true" className="size-4" />
        </Button>
      ))}
      {overflow.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 rounded-xl"
                aria-label={uiText.common.moreActions}
                disabled={pending}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            dir="rtl"
            className="min-w-44 rounded-xl"
          >
            {overflow.map((action) => (
              <DropdownMenuItem
                key={action.id}
                disabled={action.disabled}
                variant={action.tone === "danger" ? "destructive" : "default"}
                onClick={() => activate(action)}
              >
                <action.icon className="size-4" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {error && !confirm ? (
        <span
          role="alert"
          className="max-w-52 text-xs whitespace-normal text-destructive"
        >
          {error}
        </span>
      ) : null}
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open && !pending) setConfirm(undefined)
        }}
        title={confirm?.confirmation?.title || ""}
        description={error || confirm?.confirmation?.description}
        tone={confirm?.tone === "danger" ? "danger" : "primary"}
        isPending={pending}
        onConfirm={() => (confirm ? run(confirm) : undefined)}
      />
    </div>
  )
}
