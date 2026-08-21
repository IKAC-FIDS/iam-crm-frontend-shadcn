import { Loader2, Waypoints } from "lucide-react"
import { useEffect, useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import type { OpportunityStage } from "../types/opportunity.types"

export function ChangeOpportunityStageDialog({ targets, initialTarget, open, onOpenChange, isPending, onSubmit }: { targets: OpportunityStage[]; initialTarget?: OpportunityStage | null; open: boolean; onOpenChange: (open: boolean) => void; isPending: boolean; onSubmit: (stageId: string, note?: string) => void | Promise<void> }) {
  const text = uiText.opportunities
  const [stageId, setStageId] = useState(initialTarget?.id ?? "")
  const [note, setNote] = useState("")
  const target = targets.find((stage) => stage.id === stageId) ?? initialTarget
  const terminal = Boolean(target?.isTerminal)
  useEffect(() => { if (open) { setStageId(initialTarget?.id ?? ""); setNote("") } }, [initialTarget, open])

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent dir="rtl" className="max-w-md rounded-[24px]">
      <DialogHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Waypoints className="size-5" /></div><DialogTitle>{terminal ? text.dialogs.terminalTitle : text.dialogs.stageTitle}</DialogTitle><DialogDescription>{terminal ? text.dialogs.terminalDescription : text.dialogs.stageDescription}</DialogDescription></DialogHeader>
      <select className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm" value={stageId} disabled={Boolean(initialTarget)} onChange={(event) => setStageId(event.target.value)}><option value="">{text.fields.selectPlaceholder}</option>{targets.map((stage) => <option key={stage.id} value={stage.id}>{stage.label}</option>)}</select>
      <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder={text.fields.note} className="h-11 rounded-xl" />
      <DialogFooter className="sm:flex-row sm:justify-end"><Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{uiText.common.cancel}</Button><Button className="rounded-xl bg-[var(--app-primary)]" disabled={isPending || !stageId} onClick={() => void onSubmit(stageId, note || undefined)}>{isPending ? <Loader2 className="size-4 animate-spin" /> : null}{text.actions.changeStage}</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
