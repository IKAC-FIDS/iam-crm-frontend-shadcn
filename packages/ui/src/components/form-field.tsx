import * as React from "react"

import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

type FormFieldControlProps = {
  id: string
  "aria-describedby"?: string
  "aria-invalid"?: true
  "aria-required"?: true
  disabled?: boolean
  required?: boolean
}

type FormFieldProps = {
  label: React.ReactNode
  children: (props: FormFieldControlProps) => React.ReactNode
  className?: string
  description?: React.ReactNode
  disabled?: boolean
  error?: React.ReactNode
  id?: string
  optional?: boolean
  required?: boolean
}

function FormField({
  label,
  children,
  className,
  description,
  disabled = false,
  error,
  id,
  optional = false,
  required = false,
}: FormFieldProps) {
  const generatedId = React.useId()
  const controlId = id ?? `field-${generatedId.replaceAll(":", "")}`
  const descriptionId = description ? `${controlId}-description` : undefined
  const errorId = error ? `${controlId}-error` : undefined
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div
      data-slot="form-field"
      data-disabled={disabled || undefined}
      data-invalid={Boolean(error) || undefined}
      className={cn("grid min-w-0 gap-2", className)}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <Label htmlFor={controlId} className="min-w-0 leading-5">
          {label}
        </Label>
        {required || optional ? (
          <span className="shrink-0 text-xs text-muted-foreground">
            {required ? "الزامی" : "اختیاری"}
          </span>
        ) : null}
      </div>
      {children({
        id: controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
        disabled,
        required: required || undefined,
      })}
      {description ? (
        <p
          id={descriptionId}
          className="text-xs leading-5 text-muted-foreground"
        >
          {description}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs leading-5 text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { FormField }
export type { FormFieldControlProps, FormFieldProps }
