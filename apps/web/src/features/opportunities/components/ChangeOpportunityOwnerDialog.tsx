import { Loader2, UserRoundCog } from "lucide-react"
import { useEffect, useState } from "react"

import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog"
import { useOpportunityOwners } from "../hooks/useOpportunities"
import type { Opportunity } from "../types/opportunity.types"

export function ChangeOpportunityOwnerDialog({ opportunity, open, onOpenChange, isPending, onSubmit }: { opportunity: Opportunity; open: boolean; onOpenChange: (open: boolean) => void; isPending: boolean; onSubmit: (ownerId: string | null) => void | Promise<void> }) {
  const text = uiText.opportunities
  const [ownerId, setOwnerId] = useState(opportunity.ownerId ?? "")
  const owners = useOpportunityOwners(open)
  const options = Array.isArray(owners.data) ? owners.data : []
  useEffect(() => setOwnerId(opportunity.ownerId ?? ""), [opportunity])

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent dir="rtl" className="max-w-md rounded-[24px]">
      <DialogHeader><div className="mb-2 grid size-10 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><UserRoundCog className="size-5" /></div><DialogTitle>{text.dialogs.ownerTitle}</DialogTitle><DialogDescription>{text.dialogs.ownerDescription}</DialogDescription></DialogHeader>
      {owners.isError ? <p className="rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive-soft)] p-3 text-xs text-[var(--destructive)]">{text.errors.ownerOptionsPermission}</p> : null}
      <select className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm" value={ownerId} disabled={owners.isLoading || owners.isError} onChange={(event) => setOwnerId(event.target.value)}><option value="">{text.fields.noOwner}</option>{options.map((owner) => <option key={owner.id} value={owner.id}>{owner.fullName}</option>)}</select>
      <DialogFooter className="sm:flex-row sm:justify-end"><Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{uiText.common.cancel}</Button><Button className="rounded-xl bg-[var(--app-primary)]" disabled={isPending || owners.isError} onClick={() => void onSubmit(ownerId || null)}>{isPending ? <Loader2 className="size-4 animate-spin" /> : null}{text.actions.save}</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

