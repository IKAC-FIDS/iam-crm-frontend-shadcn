import { Check, ChevronsUpDown, Search } from "lucide-react"
import { useMemo, useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"

import type { UniversityOption } from "../types/person.types"

export function SearchableUniversitySelect({ value, options, onChange, disabled }: { value?: string; options: UniversityOption[] | unknown; onChange: (value?: string) => void; disabled?: boolean }) {
  const text = uiText.people.education; const [open, setOpen] = useState(false); const [search, setSearch] = useState(""); const safeOptions = useMemo(() => Array.isArray(options) ? options : [], [options])
  const filtered = useMemo(() => { const query = search.trim().toLocaleLowerCase("fa"); return query ? safeOptions.filter((item) => `${item.name} ${item.code || ""}`.toLocaleLowerCase("fa").includes(query)) : safeOptions }, [safeOptions, search])
  const selected = safeOptions.find((item) => item.id === value)
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger render={<Button type="button" variant="outline" disabled={disabled} className="h-11 w-full justify-between rounded-xl px-3 font-normal" />}><span className={selected ? "truncate" : "truncate text-muted-foreground"}>{selected?.name || text.selectUniversity}</span><ChevronsUpDown className="size-4" /></PopoverTrigger><PopoverContent align="start" className="w-[min(420px,calc(100vw-32px))] rounded-2xl p-2"><div className="relative"><Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text.searchUniversity} className="h-10 rounded-xl pe-9" /></div><div className="mt-2 max-h-64 overflow-y-auto">{filtered.length ? filtered.map((item) => <button key={item.id} type="button" onClick={() => { onChange(item.id); setOpen(false) }} className="flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-start text-xs hover:bg-[var(--app-primary-soft)]"><span>{item.name}</span>{item.id === value ? <Check className="size-4 text-[var(--app-primary)]" /> : null}</button>) : <p className="p-5 text-center text-xs text-[var(--app-text-secondary)]">{text.universityEmpty}</p>}</div></PopoverContent></Popover>
}
