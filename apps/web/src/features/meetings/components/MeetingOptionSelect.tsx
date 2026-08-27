import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react"
import { useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

export interface MeetingSelectOption {
  id: string
  label: string
  secondary?: string
}

type CommonProps = {
  options: MeetingSelectOption[]
  search: string
  onSearchChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  loading?: boolean
  emptyText?: string
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

function Options({
  options,
  selectedIds,
  onSelect,
  loading,
  emptyText,
  hasMore,
  loadingMore,
  onLoadMore,
}: CommonProps & {
  selectedIds: string[]
  onSelect: (option: MeetingSelectOption) => void
}) {
  const text = uiText.meetings
  if (loading && !options.length) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--app-text-secondary)]">
        <Loader2 className="size-4 animate-spin" />
        {text.placeholders.loading}
      </div>
    )
  }
  return (
    <div className="max-h-72 overflow-y-auto overscroll-contain">
      {options.length ? (
        options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start hover:bg-[var(--app-primary-soft)]"
            onClick={() => onSelect(option)}
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
            {selectedIds.includes(option.id) ? (
              <Check className="size-4 shrink-0 text-[var(--app-primary)]" />
            ) : null}
          </button>
        ))
      ) : (
        <p className="px-3 py-8 text-center text-xs text-[var(--app-text-secondary)]">
          {emptyText || text.placeholders.noOptions}
        </p>
      )}
      {hasMore ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1 w-full rounded-xl"
          disabled={loadingMore}
          onClick={onLoadMore}
        >
          {loadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
          {text.actions.loadMore}
        </Button>
      ) : null}
    </div>
  )
}

function SearchBox({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="relative mb-2">
      <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={uiText.meetings.placeholders.searchOptions}
        className="h-10 rounded-xl pe-9"
      />
    </div>
  )
}

export function MeetingOptionSelect({
  value,
  selectedOption,
  onChange,
  allowEmpty = true,
  ...props
}: CommonProps & {
  value?: string
  selectedOption?: MeetingSelectOption
  onChange: (option?: MeetingSelectOption) => void
  allowEmpty?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected =
    props.options.find((option) => option.id === value) || selectedOption
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={props.disabled}
            className="h-11 w-full min-w-0 justify-between rounded-xl px-3 font-normal"
          />
        }
      >
        <span
          className={selected ? "truncate" : "truncate text-muted-foreground"}
        >
          {selected?.label || props.placeholder}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-[var(--app-icon-muted)]" />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        dir="rtl"
        className="w-[min(390px,calc(100vw-32px))] rounded-2xl p-2"
      >
        <SearchBox value={props.search} onChange={props.onSearchChange} />
        {allowEmpty && value ? (
          <button
            type="button"
            className="mb-1 flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-xs text-[var(--app-text-secondary)] hover:bg-[var(--app-background)]"
            onClick={() => {
              onChange(undefined)
              setOpen(false)
            }}
          >
            <X className="size-4" />
            {uiText.common.table.clearFilters}
          </button>
        ) : null}
        <Options
          {...props}
          selectedIds={value ? [value] : []}
          onSelect={(option) => {
            onChange(option)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function MeetingMultiOptionSelect({
  value,
  onChange,
  ...props
}: CommonProps & {
  value: MeetingSelectOption[]
  onChange: (options: MeetingSelectOption[]) => void
}) {
  const merged = [...value]
  props.options.forEach((option) => {
    if (!merged.some((item) => item.id === option.id)) merged.push(option)
  })
  return (
    <div className="grid min-w-0 gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={props.disabled}
              className="h-11 w-full min-w-0 justify-between rounded-xl px-3 font-normal"
            />
          }
        >
          <span
            className={
              value.length ? "truncate" : "truncate text-muted-foreground"
            }
          >
            {value.length
              ? `${value.length.toLocaleString("fa-IR")} ${uiText.meetings.placeholders.selectedCount}`
              : props.placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-[var(--app-icon-muted)]" />
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          dir="rtl"
          className="w-[min(390px,calc(100vw-32px))] rounded-2xl p-2"
        >
          <SearchBox value={props.search} onChange={props.onSearchChange} />
          <Options
            {...props}
            options={merged}
            selectedIds={value.map((item) => item.id)}
            onSelect={(option) =>
              onChange(
                value.some((item) => item.id === option.id)
                  ? value.filter((item) => item.id !== option.id)
                  : [...value, option]
              )
            }
          />
        </PopoverContent>
      </Popover>
      {value.length ? (
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {value.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                onChange(value.filter((item) => item.id !== option.id))
              }
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-[var(--app-primary-soft)] px-2.5 py-1 text-xs text-[var(--app-on-primary-container)]"
            >
              <span className="truncate">{option.label}</span>
              <X className="size-3 shrink-0" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
