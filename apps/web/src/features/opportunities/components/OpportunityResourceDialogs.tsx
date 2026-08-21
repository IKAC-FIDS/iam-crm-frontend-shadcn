import { Loader2, Save, Upload, X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { PersianDateTimePicker } from "@/components/shared/PersianDateTimePicker"
import { uiText } from "@/config/uiText"
import { fromApiDate, toApiDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { useProductCatalogOptions } from "../hooks/useOpportunities"
import type {
  CommercialDocument,
  CommercialDocumentPayload,
  MeetingMode,
  OpportunityAttachment,
  OpportunityLineItem,
  OpportunityLineItemPayload,
  OpportunityMeeting,
  OpportunityMeetingPayload,
  OpportunityPayment,
  OpportunityPaymentPayload,
  OpportunityPriority,
  OpportunityTask,
  OpportunityTaskPayload,
  PaymentMethod,
  PaymentStatus,
  SalesChannel,
  TaskStatus,
} from "../types/opportunity.types"

const selectClass =
  "h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-[var(--app-primary)]"

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`min-w-0 ${className ?? ""}`}>
      <Label className="mb-2 block text-xs font-bold text-[var(--app-heading)]">
        {label}
      </Label>
      {children}
    </div>
  )
}
function BaseDialog({
  open,
  onOpenChange,
  title,
  description,
  pending,
  onSave,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  pending: boolean
  onSave: () => void
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        dir="rtl"
        className="max-h-[92vh] w-full max-w-[calc(100%_-_1.5rem)] min-w-0 gap-0 overflow-hidden rounded-[26px] p-0 sm:max-w-[720px]"
      >
        <DialogHeader className="border-b border-[var(--app-divider)] p-5">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription className="mt-1">
                  {description}
                </DialogDescription>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="min-h-0 max-w-full min-w-0 overflow-y-auto p-5">
          {children}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--app-divider)] bg-[var(--app-background)]/60 p-4">
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {uiText.common.cancel}
          </Button>
          <Button
            className="rounded-xl bg-[var(--app-primary)]"
            disabled={pending}
            onClick={onSave}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {uiText.opportunities.actions.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LineItemDialog({
  open,
  onOpenChange,
  item,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: OpportunityLineItem | null
  pending: boolean
  onSubmit: (payload: OpportunityLineItemPayload) => void
}) {
  const text = uiText.opportunities.detail
  const products = useProductCatalogOptions(open)
  const options = Array.isArray(products.data) ? products.data : []
  const [productId, setProductId] = useState("")
  const [description, setDescription] = useState("")
  const [channel, setChannel] =
    useState<Exclude<SalesChannel, "LEGACY_UNKNOWN">>("IN_PERSON")
  const [quantity, setQuantity] = useState("1")
  const [unitPrice, setUnitPrice] = useState("")
  const [discount, setDiscount] = useState("0")
  const [tax, setTax] = useState("0")
  useEffect(() => {
    if (open) {
      setProductId(item?.productId ?? "")
      setDescription(item?.description ?? "")
      setChannel(
        item?.salesChannel === "DIGIKALA" || item?.salesChannel === "OTHER"
          ? item.salesChannel
          : "IN_PERSON"
      )
      setQuantity(String(item?.quantity ?? 1))
      setUnitPrice(item?.unitPrice == null ? "" : String(item.unitPrice))
      setDiscount(String(item?.discountAmount ?? 0))
      setTax(String(item?.taxAmount ?? 0))
    }
  }, [item, open])
  function selectProduct(id: string) {
    setProductId(id)
    const product = options.find((value) => value.id === id)
    if (product)
      setUnitPrice(
        String(
          channel === "DIGIKALA"
            ? (product.digikalaPriceIrr ?? product.defaultUnitPrice ?? "")
            : (product.inPersonPriceIrr ?? product.defaultUnitPrice ?? "")
        )
      )
  }
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={item ? text.dialogs.lineItemEdit : text.dialogs.lineItemCreate}
      pending={pending}
      onSave={() =>
        onSubmit({
          productId: productId || null,
          description: description.trim() || undefined,
          salesChannel: productId ? channel : "OTHER",
          quantity: Number(quantity),
          unitPrice: unitPrice === "" ? undefined : Number(unitPrice),
          discountAmount: Number(discount) || 0,
          taxAmount: Number(tax) || 0,
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={text.fields.product}>
          <select
            className={selectClass}
            value={productId}
            onChange={(event) => selectProduct(event.target.value)}
          >
            <option value="">{text.fields.customItem}</option>
            {options.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.fields.salesChannel}>
          <select
            className={selectClass}
            value={channel}
            disabled={!productId}
            onChange={(event) =>
              setChannel(
                event.target.value as Exclude<SalesChannel, "LEGACY_UNKNOWN">
              )
            }
          >
            <option value="IN_PERSON">{text.salesChannels.IN_PERSON}</option>
            <option value="DIGIKALA">{text.salesChannels.DIGIKALA}</option>
            <option value="OTHER">{text.salesChannels.OTHER}</option>
          </select>
        </Field>
        <Field label={text.fields.quantity}>
          <Input
            type="number"
            min={0.01}
            step="0.01"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.unitPrice}>
          <Input
            type="number"
            min={0}
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.discount}>
          <Input
            type="number"
            min={0}
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.tax}>
          <Input
            type="number"
            min={0}
            value={tax}
            onChange={(event) => setTax(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field
          label={uiText.opportunities.fields.description}
          className="sm:col-span-2"
        >
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
          />
        </Field>
      </div>
    </BaseDialog>
  )
}

export function CommercialDocumentDialog({
  open,
  onOpenChange,
  document,
  pending,
  uploadMode = false,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: CommercialDocument | null
  pending: boolean
  uploadMode?: boolean
  onSubmit: (payload: CommercialDocumentPayload) => void
}) {
  const text = uiText.opportunities.detail
  const [type, setType] =
    useState<CommercialDocumentPayload["type"]>("PROPOSAL")
  const [status, setStatus] =
    useState<CommercialDocumentPayload["status"]>("DRAFT")
  const [title, setTitle] = useState("")
  const [number, setNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("IRR")
  const [issuedAt, setIssuedAt] = useState<Date>()
  const [validUntil, setValidUntil] = useState<Date>()
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File>()
  useEffect(() => {
    if (open) {
      setType(document?.type ?? "PROPOSAL")
      setStatus(document?.status ?? "DRAFT")
      setTitle(document?.title ?? "")
      setNumber(document?.number ?? "")
      setAmount(document?.amount == null ? "" : String(document.amount))
      setCurrency(document?.currency ?? "IRR")
      setIssuedAt(fromApiDate(document?.issuedAt))
      setValidUntil(fromApiDate(document?.validUntil))
      setDescription(document?.description ?? "")
      setFile(undefined)
    }
  }, [document, open])
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={document ? text.dialogs.documentEdit : text.dialogs.documentCreate}
      pending={pending}
      onSave={() =>
        onSubmit({
          type,
          status,
          title: title.trim(),
          number: number.trim() || undefined,
          amount: amount === "" ? undefined : Number(amount),
          currency,
          issuedAt: toApiDate(issuedAt) ?? undefined,
          validUntil: toApiDate(validUntil) ?? undefined,
          description: description.trim() || undefined,
          file,
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={text.fields.documentType}>
          <select
            className={selectClass}
            value={type}
            onChange={(event) =>
              setType(event.target.value as CommercialDocumentPayload["type"])
            }
          >
            {Object.entries(text.documentTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.fields.documentStatus}>
          <select
            className={selectClass}
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as CommercialDocumentPayload["status"]
              )
            }
          >
            {Object.entries(text.documentStatuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.fields.documentTitle}>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.documentNumber}>
          <Input
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.amount}>
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.currency}>
          <Input
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.issuedAt}>
          <PersianDatePicker value={issuedAt} onChange={setIssuedAt} />
        </Field>
        <Field label={text.fields.validUntil}>
          <PersianDatePicker value={validUntil} onChange={setValidUntil} />
        </Field>
        {uploadMode && !document ? (
          <Field label={text.fields.file} className="sm:col-span-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)]/30 p-5 text-xs text-[var(--app-primary)]">
              <Upload className="size-4" />
              {file?.name || text.fields.fileHint}
              <input
                type="file"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0])}
              />
            </label>
          </Field>
        ) : null}
        <Field
          label={uiText.opportunities.fields.description}
          className="sm:col-span-2"
        >
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
          />
        </Field>
      </div>
    </BaseDialog>
  )
}

export function PaymentDialog({
  open,
  onOpenChange,
  payment,
  documents,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment?: OpportunityPayment | null
  documents: CommercialDocument[]
  pending: boolean
  onSubmit: (payload: OpportunityPaymentPayload) => void
}) {
  const text = uiText.opportunities.detail
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("IRR")
  const [status, setStatus] = useState<PaymentStatus>("PENDING")
  const [method, setMethod] = useState<PaymentMethod | "">("")
  const [documentId, setDocumentId] = useState("")
  const [dueDate, setDueDate] = useState<Date>()
  const [reference, setReference] = useState("")
  const [description, setDescription] = useState("")
  useEffect(() => {
    if (open) {
      setAmount(payment == null ? "" : String(payment.amount))
      setCurrency(payment?.currency ?? "IRR")
      setStatus(payment?.status ?? "PENDING")
      setMethod(payment?.method ?? "")
      setDocumentId(payment?.commercialDocumentId ?? "")
      setDueDate(fromApiDate(payment?.dueDate))
      setReference(payment?.referenceNumber ?? "")
      setDescription(payment?.description ?? "")
    }
  }, [open, payment])
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={payment ? text.dialogs.paymentEdit : text.dialogs.paymentCreate}
      pending={pending}
      onSave={() =>
        onSubmit({
          amount: Number(amount),
          currency,
          status,
          method: method || undefined,
          commercialDocumentId: documentId || undefined,
          dueDate: toApiDate(dueDate) ?? undefined,
          referenceNumber: reference.trim() || undefined,
          description: description.trim() || undefined,
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={text.fields.amount}>
          <Input
            type="number"
            min={0.01}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.currency}>
          <Input
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.paymentStatus}>
          <select
            className={selectClass}
            value={status}
            onChange={(event) => setStatus(event.target.value as PaymentStatus)}
          >
            {Object.entries(text.paymentStatuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.fields.method}>
          <select
            className={selectClass}
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as PaymentMethod | "")
            }
          >
            <option value="">{uiText.common.notAvailable}</option>
            {Object.entries(text.paymentMethods).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.fields.linkedDocument}>
          <select
            className={selectClass}
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
          >
            <option value="">{uiText.common.notAvailable}</option>
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.fields.dueDate}>
          <PersianDatePicker value={dueDate} onChange={setDueDate} />
        </Field>
        <Field label={text.fields.reference}>
          <Input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={uiText.opportunities.fields.description}>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
    </BaseDialog>
  )
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  opportunityId,
  companyId,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: OpportunityTask | null
  opportunityId: string
  companyId: string
  pending: boolean
  onSubmit: (payload: OpportunityTaskPayload) => void
}) {
  const text = uiText.opportunities.detail
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("TODO")
  const [priority, setPriority] = useState<OpportunityPriority>("MEDIUM")
  const [dueAt, setDueAt] = useState<Date>()
  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "")
      setDescription(task?.description ?? "")
      setStatus(task?.status ?? "TODO")
      setPriority(task?.priority ?? "MEDIUM")
      setDueAt(task?.dueAt ? new Date(task.dueAt) : undefined)
    }
  }, [open, task])
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? text.dialogs.taskEdit : text.dialogs.taskCreate}
      pending={pending}
      onSave={() =>
        onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          dueAt: dueAt?.toISOString(),
          companyId,
          opportunityId,
        })
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={text.fields.taskTitle} className="sm:col-span-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.taskStatus}>
          <select
            className={selectClass}
            value={status}
            onChange={(event) => setStatus(event.target.value as TaskStatus)}
          >
            {Object.entries(text.taskStatuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={uiText.opportunities.fields.priority}>
          <select
            className={selectClass}
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as OpportunityPriority)
            }
          >
            {Object.entries(uiText.opportunities.priorities).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              )
            )}
          </select>
        </Field>
        <Field label={text.fields.dueAt} className="sm:col-span-2">
          <PersianDateTimePicker value={dueAt} onChange={setDueAt} />
        </Field>
        <Field
          label={uiText.opportunities.fields.description}
          className="sm:col-span-2"
        >
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
          />
        </Field>
      </div>
    </BaseDialog>
  )
}

export function MeetingDialog({
  open,
  onOpenChange,
  meeting,
  opportunityId,
  companyId,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: OpportunityMeeting | null
  opportunityId: string
  companyId: string
  pending: boolean
  onSubmit: (payload: OpportunityMeetingPayload) => void
}) {
  const text = uiText.opportunities.detail
  const [title, setTitle] = useState("")
  const [mode, setMode] = useState<MeetingMode>("IN_PERSON")
  const [startAt, setStartAt] = useState<Date>()
  const [endAt, setEndAt] = useState<Date>()
  const [location, setLocation] = useState("")
  const [meetingUrl, setMeetingUrl] = useState("")
  const [agenda, setAgenda] = useState("")
  useEffect(() => {
    if (open) {
      setTitle(meeting?.title ?? "")
      setMode(meeting?.mode ?? "IN_PERSON")
      setStartAt(meeting?.startAt ? new Date(meeting.startAt) : undefined)
      setEndAt(meeting?.endAt ? new Date(meeting.endAt) : undefined)
      setLocation(meeting?.location ?? "")
      setMeetingUrl(meeting?.meetingUrl ?? "")
      setAgenda(meeting?.agenda ?? "")
    }
  }, [meeting, open])
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={meeting ? text.dialogs.meetingEdit : text.dialogs.meetingCreate}
      pending={pending}
      onSave={() => {
        if (!startAt || !endAt || endAt <= startAt)
          return toast.error(text.errors.endBeforeStart)
        onSubmit({
          companyId,
          opportunityId,
          title: title.trim(),
          mode,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          location: location.trim() || undefined,
          meetingUrl: meetingUrl.trim() || undefined,
          agenda: agenda.trim() || undefined,
        })
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={text.fields.meetingTitle} className="sm:col-span-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.meetingMode}>
          <select
            className={selectClass}
            value={mode}
            onChange={(event) => setMode(event.target.value as MeetingMode)}
          >
            {Object.entries(text.meetingModes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={text.fields.location}>
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.startAt}>
          <PersianDateTimePicker value={startAt} onChange={setStartAt} />
        </Field>
        <Field label={text.fields.endAt}>
          <PersianDateTimePicker value={endAt} onChange={setEndAt} />
        </Field>
        <Field label={text.fields.meetingUrl} className="sm:col-span-2">
          <Input
            dir="ltr"
            value={meetingUrl}
            onChange={(event) => setMeetingUrl(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label={text.fields.agenda} className="sm:col-span-2">
          <textarea
            rows={3}
            value={agenda}
            onChange={(event) => setAgenda(event.target.value)}
            className="w-full rounded-xl border border-input bg-transparent p-3 text-sm"
          />
        </Field>
      </div>
    </BaseDialog>
  )
}

export function AttachmentUploadDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending: boolean
  onSubmit: (file: File, description?: string) => void
}) {
  const text = uiText.opportunities.detail
  const [file, setFile] = useState<File>()
  const [description, setDescription] = useState("")
  useEffect(() => {
    if (open) {
      setFile(undefined)
      setDescription("")
    }
  }, [open])
  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={text.dialogs.attachmentUpload}
      pending={pending}
      onSave={() => {
        if (!file) return toast.error(text.errors.fileRequired)
        onSubmit(file, description.trim() || undefined)
      }}
    >
      <div className="grid gap-4">
        <Field label={text.fields.file}>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--app-primary)]/30 bg-[var(--app-primary-soft)]/25 p-8 text-xs text-[var(--app-primary)]">
            <Upload className="size-5" />
            {file?.name || text.fields.fileHint}
            <input
              type="file"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0])}
            />
          </label>
        </Field>
        <Field label={text.fields.attachmentDescription}>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
    </BaseDialog>
  )
}

export type ResourceDeleteTarget = {
  kind: "lineItem" | "document" | "payment" | "task" | "attachment"
  id: string
} | null
export type ResourceActionTarget = {
  kind:
    | "paymentPaid"
    | "paymentCancel"
    | "taskComplete"
    | "meetingComplete"
    | "meetingCancel"
  id: string
} | null
export type { OpportunityAttachment }
