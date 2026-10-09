import { useState, type FormEvent, type ReactNode } from "react"
import { FileText, MapPin, Share2 } from "lucide-react"
import { toast } from "sonner"

import { FormActions } from "@/components/shared/FormActions"
import { FormSection } from "@/components/shared/FormSection"
import { PersianDatePicker } from "@/components/shared/date"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { api } from "@/lib/api"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { toApiDate } from "@/lib/date/jalali"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

const textAreaClass =
  "min-h-24 rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"

const platforms = [
  ["LINKEDIN", "لینکدین"],
  ["INSTAGRAM", "اینستاگرام"],
  ["TELEGRAM", "تلگرام"],
  ["BALE", "بله"],
  ["EITAA", "ایتا"],
  ["SOROUSH", "سروش"],
  ["ROOBIKA", "روبیکا"],
  ["APARAT", "آپارات"],
  ["YOUTUBE", "یوتیوب"],
  ["WEBSITE", "وب‌سایت"],
] as const

const legalDocumentTypes = [
  ["OFFICIAL_GAZETTE", "روزنامه رسمی"],
  ["LATEST_CHANGES", "آخرین تغییرات"],
] as const

function DialogFormActions({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  return (
    <div className="border-t border-[var(--app-divider)] pt-4">
      <FormActions onCancel={onClose} pending={pending} submitLabel="ثبت" />
    </div>
  )
}

export function CreateCompanyBranchDialog({ companyId, open, onClose, onCreated }: DialogProps) {
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const form = new FormData(event.currentTarget)
    try {
      await api.post(`/companies/${companyId}/branches`, {
        name: value(form, "name"),
        city: value(form, "city"),
        address: value(form, "address"),
        phone: value(form, "phone"),
      })
      toast.success("شعبه ثبت شد.")
      await onCreated()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ثبت شعبه انجام نشد."))
    } finally {
      setPending(false)
    }
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="ثبت شعبه" description="اطلاعات شعبه جدید شرکت را وارد کنید." icon={MapPin}>
      <form className="grid gap-4" onSubmit={submit}>
        <FormSection title="اطلاعات شعبه" description="نام، شهر و راه‌های ارتباطی شعبه را وارد کنید.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نام شعبه"><Input name="name" /></Field>
            <Field label="شهر"><Input name="city" /></Field>
            <Field label="تلفن"><Input name="phone" dir="ltr" /></Field>
            <Field label="نشانی" wide><textarea name="address" className={textAreaClass} /></Field>
          </div>
        </FormSection>
        <DialogFormActions pending={pending} onClose={onClose} />
      </form>
    </ResponsiveModal>
  )
}

export function CreateCompanySocialDialog({ companyId, open, onClose, onCreated }: DialogProps) {
  const [pending, setPending] = useState(false)
  const [platform, setPlatform] = useState<(typeof platforms)[number][0]>("LINKEDIN")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const form = new FormData(event.currentTarget)
    try {
      await api.post(`/companies/${companyId}/social-channels`, {
        platform,
        handle: value(form, "handle"),
      })
      toast.success("کانال اجتماعی ثبت شد.")
      await onCreated()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ثبت کانال اجتماعی انجام نشد."))
    } finally {
      setPending(false)
    }
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="ثبت کانال اجتماعی" description="شبکه و نشانی کانال رسمی شرکت را وارد کنید." icon={Share2}>
      <form className="grid gap-4" onSubmit={submit}>
        <FormSection title="اطلاعات کانال" description="شبکه اجتماعی و شناسه یا نشانی رسمی را مشخص کنید.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="شبکه">
              <SearchableOptionSelect ariaLabel="انتخاب شبکه اجتماعی" value={platform} options={platforms.map(([id, label]) => ({ id, label }))} search="" onSearchChange={() => undefined} onChange={(next) => setPlatform(next as typeof platform)} searchable={false} allowEmpty={false} />
            </Field>
            <Field label="شناسه یا نشانی"><Input name="handle" required dir="ltr" /></Field>
          </div>
        </FormSection>
        <DialogFormActions pending={pending} onClose={onClose} />
      </form>
    </ResponsiveModal>
  )
}

export function UploadCompanyLegalDocumentDialog({ companyId, open, onClose, onCreated }: DialogProps) {
  const [pending, setPending] = useState(false)
  const [type, setType] = useState<(typeof legalDocumentTypes)[number][0]>("OFFICIAL_GAZETTE")
  const [documentDate, setDocumentDate] = useState<Date>()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const form = new FormData(event.currentTarget)
    form.set("type", type)
    const apiDate = toApiDate(documentDate)
    if (apiDate) form.set("documentDate", apiDate)
    else form.delete("documentDate")
    try {
      await api.post(`/companies/${companyId}/legal-documents/upload`, form)
      toast.success("سند حقوقی ثبت شد.")
      await onCreated()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "ثبت سند حقوقی انجام نشد."))
    } finally {
      setPending(false)
    }
  }

  return (
    <ResponsiveModal open={open} onClose={onClose} title="ثبت سند حقوقی" description="مشخصات سند و فایل مربوط به شرکت را اضافه کنید." icon={FileText} width="max-w-3xl">
      <form className="grid gap-4" onSubmit={submit}>
        <FormSection title="مشخصات سند" description="نوع، عنوان و تاریخ سند را مشخص کنید.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نوع سند">
              <SearchableOptionSelect ariaLabel="انتخاب نوع سند" value={type} options={legalDocumentTypes.map(([id, label]) => ({ id, label }))} search="" onSearchChange={() => undefined} onChange={(next) => setType(next as typeof type)} searchable={false} allowEmpty={false} />
            </Field>
            <Field label="عنوان"><Input name="title" required maxLength={200} /></Field>
            <Field label="تاریخ سند"><PersianDatePicker value={documentDate} onChange={setDocumentDate} ariaLabel="انتخاب تاریخ سند" /></Field>
            <Field label="فایل سند"><Input name="file" type="file" required /></Field>
            <Field label="توضیحات" wide><textarea name="description" maxLength={2000} className={textAreaClass} /></Field>
          </div>
        </FormSection>
        <DialogFormActions pending={pending} onClose={onClose} />
      </form>
    </ResponsiveModal>
  )
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "grid gap-2 sm:col-span-2" : "grid gap-2"}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

type DialogProps = { companyId: string; open: boolean; onClose: () => void; onCreated: () => void | Promise<void> }

function value(form: FormData, key: string) {
  const result = String(form.get(key) ?? "").trim()
  return result || undefined
}
