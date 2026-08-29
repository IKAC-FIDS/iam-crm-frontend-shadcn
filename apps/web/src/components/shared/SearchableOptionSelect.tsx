import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

export type SearchableOption = {
  id: string
  label: string
  secondary?: string
}

export function SearchableOptionSelect({
  value,
  options,
  onChange,
  search,
  onSearchChange,
  placeholder = "انتخاب کنید",
  searchPlaceholder = "جست‌وجو...",
  emptyText = "موردی پیدا نشد.",
  loading = false,
  disabled = false,
  allowEmpty = true,
  ariaLabel,
}: {
  value?: string
  options: SearchableOption[]
  onChange: (value?: string) => void
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  loading?: boolean
  disabled?: boolean
  allowEmpty?: boolean
  ariaLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={ariaLabel}
            className="h-11 w-full min-w-0 justify-between rounded-xl px-3 font-normal"
          />
        }
      >
        <span
          className={
            selected ? "truncate" : "truncate text-[var(--app-text-secondary)]"
          }
        >
          {selected?.label || (value ? "مقدار انتخاب‌شده" : placeholder)}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-[var(--app-icon-muted)]" />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        dir="rtl"
        className="w-[min(390px,calc(100vw-32px))] rounded-2xl p-2"
      >
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-xl pe-9"
          />
        </div>

        <div className="max-h-72 overflow-y-auto overscroll-contain">
          {allowEmpty && value ? (
            <button
              type="button"
              className="mb-1 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-xs text-[var(--app-text-secondary)] hover:bg-[var(--app-background)]"
              onClick={() => {
                onChange(undefined)
                onSearchChange("")
                setOpen(false)
              }}
            >
              <X className="size-4" />
              پاک کردن انتخاب
            </button>
          ) : null}

          {loading && !options.length ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--app-text-secondary)]">
              <Loader2 className="size-4 animate-spin" />
              در حال دریافت...
            </div>
          ) : options.length ? (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start hover:bg-[var(--app-primary-soft)]"
                onClick={() => {
                  onChange(option.id)
                  onSearchChange("")
                  setOpen(false)
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-[var(--app-heading)]">
                    {option.label}
                  </span>
                  {option.secondary ? (
                    <span className="mt-0.5 block truncate text-xs text-[var(--app-text-secondary)]">
                      {option.secondary}
                    </span>
                  ) : null}
                </span>
                {value === option.id ? (
                  <Check className="size-4 shrink-0 text-[var(--app-primary)]" />
                ) : null}
              </button>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-xs text-[var(--app-text-secondary)]">
              {emptyText}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
