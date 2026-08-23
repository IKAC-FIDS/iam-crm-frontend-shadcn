import { Building2, MoreHorizontal, Pencil } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import type { Activity } from "../types/activity.types"

export function ActivityActionsMenu({
  activity,
  canUpdate,
  onEdit,
}: {
  activity: Activity
  canUpdate: boolean
  onEdit: () => void
}) {
  const navigate = useNavigate()
  const companyId = activity.companyId || activity.company?.id || ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            aria-label="عملیات بیشتر"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-44 rounded-xl"
        dir="rtl"
        onClick={(event) => event.stopPropagation()}
      >
        {companyId ? (
          <DropdownMenuItem
            onClick={() => navigate(`/companies/${companyId}`)}
          >
            <Building2 />
            مشاهده شرکت
          </DropdownMenuItem>
        ) : null}

        {canUpdate && activity.type !== "STAGE_CHANGE" ? (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil />
            ویرایش فعالیت
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
