import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import type { CollaborationTopicCategory, CollaborationVisibility } from "../types/collaboration.types"

export type CollaborationDialogValue = { name: string; description?: string; category?: CollaborationTopicCategory; visibility?: CollaborationVisibility }
export function CollaborationEntityDialog({ open, mode, initial, pending, onClose, onSubmit }: { open: boolean; mode: "topic" | "channel"; initial?: CollaborationDialogValue; pending?: boolean; onClose: () => void; onSubmit: (value: CollaborationDialogValue) => void }) {
  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")
  const [category, setCategory] = useState<CollaborationTopicCategory>(initial?.category ?? "INTERNAL")
  const [visibility, setVisibility] = useState<CollaborationVisibility>(initial?.visibility ?? "PUBLIC")
  const editing = Boolean(initial)
  return <ResponsiveModal open={open} onClose={onClose} title={`${editing ? "ویرایش" : "ایجاد"} ${mode === "topic" ? "موضوع" : "کانال"}`} description={mode === "topic" && !editing ? "یک کانال عمومی اولیه به‌صورت خودکار ساخته می‌شود." : undefined}>
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-bold">نام<Input value={name} onChange={(event) => setName(event.target.value)} autoFocus maxLength={mode === "topic" ? 120 : 80} /></label>
      <label className="grid gap-1.5 text-sm font-bold">توضیحات <span className="font-normal text-[var(--app-text-secondary)]">(اختیاری)</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} className="min-h-24 rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" /></label>
      {mode === "topic" ? <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-bold">دسته موضوع</legend><div className="flex gap-2">{(["TENDER", "INTERNAL"] as const).map((value) => <Button key={value} type="button" variant={category === value ? "default" : "outline"} onClick={() => setCategory(value)}>{value === "TENDER" ? "مناقصات" : "داخلی"}</Button>)}</div></fieldset> : <fieldset className="grid gap-2"><legend className="mb-1 text-sm font-bold">سطح مشاهده</legend><div className="flex gap-2">{(["PUBLIC", "PRIVATE"] as const).map((value) => <Button key={value} type="button" variant={visibility === value ? "default" : "outline"} onClick={() => setVisibility(value)}>{value === "PUBLIC" ? "عمومی" : "خصوصی"}</Button>)}</div></fieldset>}
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>انصراف</Button><Button disabled={!name.trim() || pending} onClick={() => onSubmit({ name: name.trim(), description: description.trim() || undefined, ...(mode === "topic" ? { category } : { visibility }) })}>{editing ? "ذخیره تغییرات" : "ایجاد"}</Button></div>
    </div>
  </ResponsiveModal>
}
