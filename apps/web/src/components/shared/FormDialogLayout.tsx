import type { HTMLAttributes } from "react"
import { cn } from "@workspace/ui/lib/utils"

export function FormDialogBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "ui-form-body grid auto-rows-max content-start gap-4",
        className
      )}
      {...props}
    />
  )
}
export function FormDialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ui-form-footer", className)} {...props} />
}
