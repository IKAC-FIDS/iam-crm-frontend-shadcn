import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import {
  usePeopleCompanyOption,
  usePeopleCompanyOptions,
} from "../hooks/usePeople"

export function SearchableCompanySelect({
  value,
  onChange,
  placeholder,
  allowEmpty = true,
}: {
  value?: string
  onChange: (value?: string) => void
  placeholder?: string
  allowEmpty?: boolean
}) {
  const text = uiText.people.companySelect
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [search])

  const optionsQuery = usePeopleCompanyOptions(debouncedSearch, open)
  const selectedQuery = usePeopleCompanyOption(value, Boolean(value))

  const options = Array.isArray(optionsQuery.data?.data)
    ? optionsQuery.data.data
    : []

  const selected = useMemo(() => {
    return (
      options.find((option) => option.id === value) ||
      selectedQuery.data ||
      null
    )
  }, [options, selectedQuery.data, value])

  const selectedLabel = selected
    ? selected.brandName || selected.legalName
    : placeholder || text.placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full justify-between rounded-xl px-3 font-normal"
          />
        }
      >
        <span
          className={[
            "truncate",
            selected ? "text-[var(--app-heading)]" : "text-muted-foreground",
          ].join(" ")}
        >
          {selectedLabel}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-[var(--app-icon-muted)]" />
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-[min(420px,calc(100vw-32px))] gap-2 rounded-2xl p-2"
      >
        <div className="relative">
          <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={text.searchPlaceholder}
            className="h-10 rounded-xl pe-9"
          />
        </div>

        <div className="max-h-[330px] overflow-y-auto overscroll-contain">
          {allowEmpty ? (
            <button
              type="button"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
              className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-start text-xs text-[var(--app-text-secondary)] hover:bg-[var(--app-background)]"
            >
              <span>{text.clear}</span>
              {!value ? <Check className="size-4 text-[var(--app-primary)]" /> : null}
            </button>
          ) : null}

          {optionsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-8 text-xs text-[var(--app-text-secondary)]">
              <Loader2 className="size-4 animate-spin" />
              {text.loading}
            </div>
          ) : options.length ? (
            options.map((company) => {
              const label = company.brandName || company.legalName
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => {
                    onChange(company.id)
                    setOpen(false)
                  }}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start hover:bg-[var(--app-primary-soft)]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-[var(--app-heading)]">
                      {label}
                    </span>
                    {company.brandName && company.brandName !== company.legalName ? (
                      <span className="mt-0.5 block truncate text-[9px] text-[var(--app-text-secondary)]">
                        {company.legalName}
                      </span>
                    ) : null}
                  </span>
                  {value === company.id ? (
                    <Check className="size-4 shrink-0 text-[var(--app-primary)]" />
                  ) : null}
                </button>
              )
            })
          ) : (
            <p className="px-3 py-8 text-center text-xs text-[var(--app-text-secondary)]">
              {text.empty}
            </p>
          )}
        </div>

        {optionsQuery.data?.meta.total &&
        optionsQuery.data.meta.total > options.length ? (
          <p className="border-t border-[var(--app-divider)] px-3 pt-2 text-[9px] text-[var(--app-text-secondary)]">
            {text.firstTenHint}
          </p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
