import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import { useDebouncedValue } from "@/lib/useDebouncedValue"

export type DraftReference = {
  type: "COMPANY" | "OPPORTUNITY" | "TASK" | "MEETING"
  id: string
  label: string
}
const commands = {
  company: "COMPANY",
  opportunity: "OPPORTUNITY",
  task: "TASK",
  meeting: "MEETING",
} as const

export function MessageReferencePicker({
  body,
  onSelect,
}: {
  body: string
  onSelect: (reference: DraftReference, token: string) => void
}) {
  const match = body.match(
    /\/(company|opportunity|task|meeting)(?:\s+([^\n]*))?$/i
  )
  const type = match
    ? commands[match[1].toLowerCase() as keyof typeof commands]
    : null
  const search = useDebouncedValue(match?.[2]?.trim() ?? "", 300)
  const query = useQuery({
    queryKey: ["conversation-reference-options", type, search],
    enabled: Boolean(type),
    queryFn: async () => {
      const response = await api.get("/conversations/reference-options", {
        params: { type, search: search || undefined },
      })
      return unwrapApiResponse<{ data: Array<{ id: string; label: string }> }>(
        response.data
      ).data
    },
  })
  const [active, setActive] = useState(0)
  const [dismissed, setDismissed] = useState("")
  const options = useMemo(() => query.data ?? [], [query.data])
  const token = match?.[0] ?? ""
  const selectedIndex = Math.min(active, Math.max(options.length - 1, 0))
  useEffect(() => {
    if (!type) return
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setDismissed(token)
      }
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActive((value) => Math.min(value + 1, options.length - 1))
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActive((value) => Math.max(value - 1, 0))
      }
      if (event.key === "Enter" && options[selectedIndex]) {
        event.preventDefault()
        onSelect({ type, ...options[selectedIndex] }, token)
      }
    }
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [onSelect, options, selectedIndex, token, type])
  if (!type || dismissed === token) return null
  return (
    <div
      dir="rtl"
      role="listbox"
      className="absolute right-0 bottom-full z-30 mb-2 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-1 shadow-xl"
    >
      {query.isFetching ? (
        <p className="p-3 text-xs">در حال جست‌وجو...</p>
      ) : options.length ? (
        options.map((option, index) => (
          <button
            type="button"
            role="option"
            aria-selected={index === selectedIndex}
            key={option.id}
            onMouseDown={(event) => {
              event.preventDefault()
              onSelect({ type, ...option }, token)
            }}
            className={`block w-full rounded-lg px-3 py-2 text-right text-sm ${index === selectedIndex ? "bg-[var(--app-primary-soft)]" : "hover:bg-[var(--app-background)]"}`}
          >
            {option.label}
          </button>
        ))
      ) : (
        <p className="p-3 text-xs text-[var(--app-text-secondary)]">
          موردی یافت نشد.
        </p>
      )}
    </div>
  )
}
