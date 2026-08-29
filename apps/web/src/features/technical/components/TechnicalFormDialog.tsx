import {
  BookOpen,
  FileText,
  FolderOpen,
  Gavel,
  PackageOpen,
} from "lucide-react"

import { DialogHeroHeader } from "@/components/shared/DialogHeroHeader"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"

import { useTechnicalSave } from "../hooks"
import { buildPayload } from "../payload"
import type { TechnicalKind } from "../types"
import { TechnicalForm, type TechnicalFormValues } from "./TechnicalForm"

const dialogCopy = {
  releases: {
    create: "ایجاد انتشار فنی",
    edit: "ویرایش انتشار فنی",
    description: "نسخه، محصول و زمان‌بندی چرخه پشتیبانی را ثبت کنید.",
    icon: PackageOpen,
  },
  "knowledge-base": {
    create: "ایجاد مقاله پایگاه دانش",
    edit: "ویرایش مقاله پایگاه دانش",
    description: "محتوای فنی، سطح دسترسی و زمان بازبینی را تکمیل کنید.",
    icon: BookOpen,
  },
  documents: {
    create: "ایجاد سند فنی",
    edit: "ویرایش سند فنی",
    description: "مشخصات، محرمانگی و ارتباط‌های سند را ثبت کنید.",
    icon: FileText,
  },
  resources: {
    create: "ایجاد منبع فنی",
    edit: "ویرایش منبع فنی",
    description: "نوع منبع، نسخه و روش دسترسی را مشخص کنید.",
    icon: FolderOpen,
  },
  tenders: {
    create: "ایجاد مناقصه",
    edit: "ویرایش مناقصه",
    description: "اطلاعات فنی–تجاری، روابط CRM و مهلت‌ها را ثبت کنید.",
    icon: Gavel,
  },
} satisfies Record<
  TechnicalKind,
  {
    create: string
    edit: string
    description: string
    icon: typeof PackageOpen
  }
>

export function TechnicalFormDialog({
  open,
  onOpenChange,
  kind,
  item,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: TechnicalKind
  item?: { id: string; revision?: number }
  onSaved?: (row: { id: string }) => void
}) {
  const save = useTechnicalSave(kind)
  const copy = dialogCopy[kind]

  async function submit(values: TechnicalFormValues) {
    const row = await save.mutateAsync({
      id: item?.id,
      payload: buildPayload(kind, values, item?.revision),
    })
    onOpenChange(false)
    onSaved?.(row)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!save.isPending) onOpenChange(next)
      }}
    >
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="grid max-h-[94dvh] w-full max-w-[calc(100%-1rem)] min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-[960px]"
      >
        <DialogHeroHeader
          title={item ? copy.edit : copy.create}
          description={copy.description}
          icon={copy.icon}
          onClose={() => onOpenChange(false)}
        />
        <TechnicalForm
          key={`${kind}-${item?.id || "new"}`}
          kind={kind}
          item={item as never}
          onSubmit={submit}
          onCancel={() => onOpenChange(false)}
          pending={save.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
