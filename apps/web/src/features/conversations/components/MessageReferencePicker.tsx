import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  ListTodo,
  Loader2,
  Search,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"

import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { useDebouncedValue } from "@/lib/useDebouncedValue"

export type DraftReference = {
  type: "COMPANY" | "OPPORTUNITY" | "TASK" | "MEETING"
  id: string
  label: string
}

const commands = [
  { command: "company", type: "COMPANY", label: "شرکت", icon: Building2 },
  {
    command: "opportunity",
    type: "OPPORTUNITY",
    label: "فرصت فروش",
    icon: CircleDollarSign,
  },
  { command: "task", type: "TASK", label: "کار", icon: ListTodo },
  { command: "meeting", type: "MEETING", label: "جلسه", icon: CalendarDays },
] as const

type ReferenceType = DraftReference["type"]

export function MessageReferencePicker({
  body,
  onCommand,
  onSelect,
}: {
  body: string
  onCommand: (command: string, token: string) => void
  onSelect: (reference: DraftReference, token: string) => void
}) {
  const match = body.match(/\/([a-z]*)(?:\s+([^\n]*))?$/i)
  const commandText = match?.[1]?.toLowerCase() ?? ""
  const inlineSearch = match?.[2]
  const selectedCommand = commands.find(
    (item) => item.command === commandText && inlineSearch !== undefined
  )
  const type: ReferenceType | null = selectedCommand?.type ?? null
  const selectedLabel = selectedCommand?.label ?? "مرجع"
  const token = match?.[0] ?? ""
  const [search, setSearch] = useState("")
  const [active, setActive] = useState(0)
  const [dismissed, setDismissed] = useState("")
  const debouncedSearch = useDebouncedValue(search, 300)

  const visibleCommands = useMemo(
    () =>
      commands.filter(
        (item) => !commandText || item.command.startsWith(commandText)
      ),
    [commandText]
  )

  const query = useQuery({
    queryKey: ["conversation-reference-options", type, debouncedSearch],
    enabled: Boolean(type),
    queryFn: async () => {
      const response = await api.get("/conversations/reference-options", {
        params: { type, search: debouncedSearch || undefined },
      })
      return unwrapApiResponse<{
        data: Array<{ id: string; label: string }>
      }>(response.data).data
    },
  })
  const options = useMemo(() => query.data ?? [], [query.data])
  const itemsLength = type ? options.length : visibleCommands.length
  const selectedIndex = Math.min(active, Math.max(itemsLength - 1, 0))

  useEffect(() => {
    if (!match || dismissed === token) return
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setDismissed(token)
      }
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActive((value) => Math.min(value + 1, itemsLength - 1))
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActive((value) => Math.max(value - 1, 0))
      }
      if (event.key === "Enter") {
        if (type && options[selectedIndex]) {
          event.preventDefault()
          setSearch("")
          onSelect({ type, ...options[selectedIndex] }, token)
        } else if (!type && visibleCommands[selectedIndex]) {
          event.preventDefault()
          setSearch("")
          setActive(0)
          onCommand(visibleCommands[selectedIndex].command, token)
        }
      }
    }
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [
    dismissed,
    itemsLength,
    match,
    onCommand,
    onSelect,
    options,
    selectedIndex,
    token,
    type,
    visibleCommands,
  ])

  if (!match || dismissed === token) return null

  return (
    <div
      dir="rtl"
      role="listbox"
      aria-label={
        type ? `جست‌وجوی ${selectedLabel}` : "انتخاب نوع مرجع"
      }
      className="absolute right-0 bottom-full z-30 mb-2 w-full rounded-xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-2 shadow-xl"
    >
      {type ? (
        <>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setActive(0)
              }}
              placeholder={`جست‌وجوی ${selectedLabel}...`}
              aria-label={`جست‌وجوی ${selectedLabel}`}
              className="h-10 rounded-xl pe-9"
            />
          </div>
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {query.isFetching && !options.length ? (
              <div className="flex items-center justify-center gap-2 p-5 text-xs text-[var(--app-text-secondary)]">
                <Loader2 className="size-4 animate-spin" />
                در حال جست‌وجو...
              </div>
            ) : options.length ? (
              options.map((option, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={index === selectedIndex}
                  key={option.id}
                  onMouseDown={(event) => {
                    event.preventDefault()
                    setSearch("")
                    onSelect({ type, ...option }, token)
                  }}
                  className={`block min-h-10 w-full rounded-lg px-3 py-2 text-right text-sm ${index === selectedIndex ? "bg-[var(--app-primary-soft)]" : "hover:bg-[var(--app-background)]"}`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="p-5 text-center text-xs text-[var(--app-text-secondary)]">
                موردی یافت نشد.
              </p>
            )}
          </div>
        </>
      ) : visibleCommands.length ? (
        visibleCommands.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.command}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              onMouseDown={(event) => {
                event.preventDefault()
                setSearch("")
                setActive(0)
                onCommand(item.command, token)
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-right ${index === selectedIndex ? "bg-[var(--app-primary-soft)]" : "hover:bg-[var(--app-background)]"}`}
            >
              <Icon className="size-4 shrink-0 text-[var(--app-primary)]" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[var(--app-heading)]">
                  {item.label}
                </span>
                <span
                  dir="ltr"
                  className="block text-left text-xs text-[var(--app-text-secondary)]"
                >
                  /{item.command}
                </span>
              </span>
            </button>
          )
        })
      ) : (
        <p className="p-5 text-center text-xs text-[var(--app-text-secondary)]">
          دستور معتبری یافت نشد.
        </p>
      )}
    </div>
  )
}
