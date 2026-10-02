import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BriefcaseBusiness,
  CalendarPlus,
  ListPlus,
  PackageSearch,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export type OperationsDialogKind =
  | "task"
  | "opportunity"
  | "activity"
  | "meeting"
  | "products"
  | "conversation"
  | "opportunities"
  | "activity-detail"

const actions: Array<{
  id: Exclude<
    OperationsDialogKind,
    "conversation" | "opportunities" | "activity-detail"
  >
  label: string
  icon: LucideIcon
  permission: string
}> = [
  { id: "task", label: "کار جدید", icon: ListPlus, permission: "task:create" },
  {
    id: "opportunity",
    label: "فرصت جدید",
    icon: BriefcaseBusiness,
    permission: "opportunity:create",
  },
  {
    id: "activity",
    label: "ثبت تماس / فعالیت",
    icon: Activity,
    permission: "activity:create",
  },
  {
    id: "meeting",
    label: "جلسه جدید",
    icon: CalendarPlus,
    permission: "meeting:create",
  },
  {
    id: "products",
    label: "قیمت محصولات",
    icon: PackageSearch,
    permission: "product:view",
  },
]

export function OperationsQuickActions({
  permissions,
  onAction,
}: {
  permissions: readonly string[]
  onAction: (action: OperationsDialogKind) => void
}) {
  const visible = actions.filter((action) =>
    permissions.includes(action.permission)
  )
  if (!visible.length) return null
  return (
    <div
      className="flex min-w-0 gap-2 overflow-x-auto"
      aria-label="عملیات سریع"
    >
      {visible.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          className="shrink-0 rounded-xl"
          onClick={() => onAction(id)}
        >
          <Icon className="size-4" />
          {label}
        </Button>
      ))}
    </div>
  )
}
