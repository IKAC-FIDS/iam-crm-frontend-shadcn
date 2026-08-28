import { Button } from "@workspace/ui/components/button"
import { uiText } from "@/config/uiText"

export function FormActions({
  onCancel,
  pending,
  submitLabel = uiText.common.save,
  disabled = false,
}: {
  onCancel: () => void
  pending: boolean
  submitLabel?: string
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={pending}
      >
        {uiText.common.cancel}
      </Button>
      <Button type="submit" disabled={pending || disabled}>
        {pending ? uiText.common.processing : submitLabel}
      </Button>
    </div>
  )
}
