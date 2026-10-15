import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

function NativeSelect({
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & {
  size?: "compact" | "default"
}) {
  return (
    <select
      data-slot="native-select"
      data-size={size}
      className={cn(
        "w-full min-w-0 rounded-lg border border-input bg-background px-3 text-start text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=compact]:h-8 data-[size=default]:h-11 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect }
