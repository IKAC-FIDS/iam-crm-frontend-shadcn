import { useActivities } from "@/features/activities/hooks/useActivities"
import { ActivityDetailDialog } from "@/features/activities/components/ActivityDetailDialog"

export function OperationsActivityDetailDialog({
  activityId,
  companyId,
  open,
  onClose,
}: {
  activityId?: string
  companyId?: string
  open: boolean
  onClose: () => void
}) {
  const query = useActivities(
    { page: 1, limit: 20, companyId },
    open && Boolean(activityId && companyId)
  )
  const activity =
    query.data?.data.find((item) => item.id === activityId) ?? null
  return (
    <ActivityDetailDialog
      activity={activity}
      open={open && Boolean(activity)}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      canUpdate={false}
      onEdit={() => undefined}
    />
  )
}
