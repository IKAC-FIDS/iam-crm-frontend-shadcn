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

function getCompanyId(activity: Activity) {
  return activity.companyId || activity.company?.id || ""
}

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
  const companyId = getCompanyId(activity)

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
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-44 rounded-xl"
        dir="rtl"
      >
        {companyId ? (
          <DropdownMenuItem onClick={() => navigate(`/companies/${companyId}`)}>
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
