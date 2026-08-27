import {
  CreditCard,
  FileText,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react"
import {
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDate } from "@/lib/date/jalali"
import { Button } from "@workspace/ui/components/button"

import {
  useCancelOpportunityPayment,
  useChangeCommercialDocumentStatus,
  useCommercialDocuments,
  useCreateCommercialDocument,
  useCreateOpportunityLineItem,
  useCreateOpportunityPayment,
  useDeleteCommercialDocument,
  useDeleteOpportunityLineItem,
  useDeleteOpportunityPayment,
  useMarkOpportunityPaymentPaid,
  useOpportunityLineItems,
  useOpportunityPayments,
  useUpdateCommercialDocument,
  useUpdateOpportunityLineItem,
  useUpdateOpportunityPayment,
} from "../hooks/useOpportunities"
import type {
  CommercialDocument,
  CommercialDocumentPayload,
  CommercialDocumentStatus,
  Opportunity,
  OpportunityLineItem,
  OpportunityLineItemPayload,
  OpportunityPayment,
  OpportunityPaymentPayload,
} from "../types/opportunity.types"
import {
  CommercialDocumentDialog,
  LineItemDialog,
  PaymentDialog,
  type ResourceActionTarget,
  type ResourceDeleteTarget,
} from "./OpportunityResourceDialogs"

export function OpportunityCommercialSection({
  opportunity,
  permissions,
}: {
  opportunity: Opportunity
  permissions: string[]
}) {
  const text = uiText.opportunities.detail
  const canViewItems = permissions.includes("opportunity-line-item:view")
  const canManageItems =
    permissions.includes("opportunity-line-item:manage") &&
    !opportunity.archivedAt
  const canViewDocuments = permissions.includes("commercial-document:view")
  const canManageDocuments =
    permissions.includes("commercial-document:manage") &&
    !opportunity.archivedAt
  const canViewPayments = permissions.includes("payment:view")
  const canManagePayments =
    permissions.includes("payment:manage") && !opportunity.archivedAt
  const [documentPage, setDocumentPage] = useState(1)
  const [paymentPage, setPaymentPage] = useState(1)
  const lineItems = useOpportunityLineItems(opportunity.id, canViewItems)
  const documents = useCommercialDocuments(
    opportunity.id,
    documentPage,
    canViewDocuments
  )
  const payments = useOpportunityPayments(
    opportunity.id,
    paymentPage,
    canViewPayments
  )
  const [lineItem, setLineItem] = useState<
    OpportunityLineItem | null | undefined
  >(undefined)
  const [document, setDocument] = useState<
    CommercialDocument | null | undefined
  >(undefined)
  const [uploadMode, setUploadMode] = useState(false)
  const [payment, setPayment] = useState<OpportunityPayment | null | undefined>(
    undefined
  )
  const [deleteTarget, setDeleteTarget] = useState<ResourceDeleteTarget>(null)
  const [actionTarget, setActionTarget] = useState<ResourceActionTarget>(null)
  const createLine = useCreateOpportunityLineItem(opportunity.id)
  const updateLine = useUpdateOpportunityLineItem(opportunity.id)
  const deleteLine = useDeleteOpportunityLineItem(opportunity.id)
  const createDocument = useCreateCommercialDocument(opportunity.id)
  const updateDocument = useUpdateCommercialDocument(opportunity.id)
  const statusDocument = useChangeCommercialDocumentStatus(opportunity.id)
  const deleteDocument = useDeleteCommercialDocument(opportunity.id)
  const createPayment = useCreateOpportunityPayment(opportunity.id)
  const updatePayment = useUpdateOpportunityPayment(opportunity.id)
  const paidPayment = useMarkOpportunityPaymentPaid(opportunity.id)
  const cancelPayment = useCancelOpportunityPayment(opportunity.id)
  const deletePayment = useDeleteOpportunityPayment(opportunity.id)

  async function saveLine(payload: OpportunityLineItemPayload) {
    try {
      if (lineItem)
        await updateLine.mutateAsync({ lineItemId: lineItem.id, payload })
      else await createLine.mutateAsync(payload)
      toast.success(text.feedback.saved)
      setLineItem(undefined)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function saveDocument(payload: CommercialDocumentPayload) {
    if (uploadMode && !payload.file)
      return toast.error(text.errors.fileRequired)
    if (payload.file && payload.file.size > 25 * 1024 * 1024)
      return toast.error(text.errors.fileTooLarge)
    try {
      if (document)
        await updateDocument.mutateAsync({ documentId: document.id, payload })
      else await createDocument.mutateAsync(payload)
      toast.success(payload.file ? text.feedback.uploaded : text.feedback.saved)
      setDocument(undefined)
      setUploadMode(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function savePayment(payload: OpportunityPaymentPayload) {
    try {
      if (payment)
        await updatePayment.mutateAsync({ paymentId: payment.id, payload })
      else await createPayment.mutateAsync(payload)
      toast.success(text.feedback.saved)
      setPayment(undefined)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function removeTarget() {
    if (!deleteTarget) return
    try {
      if (deleteTarget.kind === "lineItem")
        await deleteLine.mutateAsync(deleteTarget.id)
      if (deleteTarget.kind === "document")
        await deleteDocument.mutateAsync(deleteTarget.id)
      if (deleteTarget.kind === "payment")
        await deletePayment.mutateAsync(deleteTarget.id)
      toast.success(text.feedback.deleted)
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  async function confirmAction() {
    if (!actionTarget) return
    try {
      if (actionTarget.kind === "paymentPaid")
        await paidPayment.mutateAsync({ paymentId: actionTarget.id })
      if (actionTarget.kind === "paymentCancel")
        await cancelPayment.mutateAsync(actionTarget.id)
      toast.success(text.feedback.saved)
      setActionTarget(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }
  const completePayments =
    payments.data && payments.data.meta.total <= payments.data.data.length
      ? payments.data.data
      : null
  const summaryCurrencies = new Set(
    completePayments?.map((item) => item.currency) ?? []
  )
  const paymentSummary =
    completePayments && summaryCurrencies.size === 1
      ? {
          total: completePayments.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          ),
          paid: completePayments
            .filter((item) => item.status === "PAID")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
          overdue: completePayments.filter((item) => item.status === "OVERDUE")
            .length,
          currency: completePayments[0]?.currency ?? "",
        }
      : null

  return (
    <div className="grid w-full max-w-full min-w-0 items-start gap-4 xl:grid-cols-2">
      <ResourceSection
        className="xl:col-span-2"
        title={text.sections.lineItems}
        count={opportunity._count?.lineItems}
        action={
          canManageItems ? (
            <Button
              size="sm"
              className="rounded-xl bg-[var(--app-primary)]"
              onClick={() => setLineItem(null)}
            >
              <Plus className="size-4" />
              {text.actions.addLineItem}
            </Button>
          ) : null
        }
      >
        {!canViewItems ? (
          <PermissionNotice />
        ) : lineItems.isLoading ? (
          <LoadingState rows={2} />
        ) : lineItems.isError ? (
          <SectionError onRetry={() => void lineItems.refetch()} />
        ) : lineItems.data?.length ? (
          <div className="w-full max-w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[820px] text-start text-xs">
              <thead>
                <tr className="border-b border-[var(--app-divider)] text-xs text-[var(--app-text-secondary)]">
                  <th className="p-3 text-start">{text.fields.product}</th>
                  <th>{text.fields.quantity}</th>
                  <th>{text.fields.unit}</th>
                  <th>{text.fields.unitPrice}</th>
                  <th>{text.fields.discount}</th>
                  <th>{text.fields.tax}</th>
                  <th>{text.fields.total}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lineItems.data.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--app-divider)] last:border-0"
                  >
                    <td className="p-3">
                      <p className="font-bold text-[var(--app-heading)]">
                        {item.product?.name ||
                          item.productNameSnapshot ||
                          text.fields.customItem}
                      </p>
                      <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                        {text.salesChannels[item.salesChannel]}
                      </p>
                      {item.description ? (
                        <p className="mt-1 max-w-xs truncate text-xs text-[var(--app-text-secondary)]">
                          {item.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="text-center">
                      {Number(item.quantity).toLocaleString("fa-IR")}
                    </td>
                    <td className="text-center">
                      {item.product?.unit || uiText.common.notAvailable}
                    </td>
                    <td className="text-center">{money(item.unitPrice)}</td>
                    <td className="text-center">
                      {money(item.discountAmount)}
                    </td>
                    <td className="text-center">{money(item.taxAmount)}</td>
                    <td className="text-center font-bold">
                      {money(item.lineTotal)} {item.product?.currency}
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {canManageItems ? (
                          <>
                            <IconButton
                              label={uiText.opportunities.actions.edit}
                              onClick={() => setLineItem(item)}
                            >
                              <Pencil />
                            </IconButton>
                            <IconButton
                              label={text.actions.delete}
                              danger
                              onClick={() =>
                                setDeleteTarget({
                                  kind: "lineItem",
                                  id: item.id,
                                })
                              }
                            >
                              <Trash2 />
                            </IconButton>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CompactEmpty icon={PackageOpen} title={text.empty.lineItems} />
        )}
      </ResourceSection>

      <ResourceSection
        title={text.sections.documents}
        count={
          documents.data?.meta.total ?? opportunity._count?.commercialDocuments
        }
        action={
          canManageDocuments ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setDocument(null)
                  setUploadMode(true)
                }}
              >
                <Upload className="size-4" />
                {text.actions.uploadDocument}
              </Button>
              <Button
                size="sm"
                className="rounded-xl bg-[var(--app-primary)]"
                onClick={() => {
                  setDocument(null)
                  setUploadMode(false)
                }}
              >
                <Plus className="size-4" />
                {text.actions.addDocument}
              </Button>
            </div>
          ) : null
        }
      >
        {!canViewDocuments ? (
          <PermissionNotice />
        ) : documents.isLoading ? (
          <LoadingState rows={2} />
        ) : documents.isError ? (
          <SectionError onRetry={() => void documents.refetch()} />
        ) : documents.data?.data.length ? (
          <div className="grid gap-2 2xl:grid-cols-2">
            {documents.data.data.map((item) => (
              <div
                key={item.id}
                className="min-w-0 rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone="info">
                        {text.documentTypes[item.type]}
                      </StatusBadge>
                      <StatusBadge tone={documentTone(item.status)}>
                        {text.documentStatuses[item.status]}
                      </StatusBadge>
                    </div>
                    <h3 className="mt-3 text-xs font-bold break-words text-[var(--app-heading)]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                      {item.number || uiText.common.notAvailable} ·{" "}
                      {formatJalaliDate(item.createdAt)}
                    </p>
                  </div>
                  {canManageDocuments ? (
                    <div className="flex">
                      <IconButton
                        label={uiText.opportunities.actions.edit}
                        onClick={() => {
                          setDocument(item)
                          setUploadMode(false)
                        }}
                      >
                        <Pencil />
                      </IconButton>
                      <IconButton
                        label={text.actions.delete}
                        danger
                        onClick={() =>
                          setDeleteTarget({ kind: "document", id: item.id })
                        }
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[var(--app-text-secondary)]">
                    {text.fields.amount}
                  </span>
                  <span className="font-bold">
                    {money(item.amount)} {item.currency}
                  </span>
                </div>
                {Array.isArray(item.payments) && item.payments.length ? (
                  <p className="mt-2 text-xs text-[var(--app-text-secondary)]">
                    {text.fields.relatedPayments}:{" "}
                    {item.payments.length.toLocaleString("fa-IR")}
                  </p>
                ) : null}
                {canManageDocuments ? (
                  <select
                    className="mt-3 h-9 w-full rounded-xl border border-input bg-transparent px-2 text-xs"
                    value={item.status}
                    onChange={(event) =>
                      void statusDocument
                        .mutateAsync({
                          documentId: item.id,
                          status: event.target
                            .value as CommercialDocumentStatus,
                        })
                        .then(() => toast.success(text.feedback.saved))
                        .catch((error) =>
                          toast.error(
                            getApiErrorMessage(error, text.errors.mutation)
                          )
                        )
                    }
                  >
                    {Object.entries(text.documentStatuses).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <CompactEmpty icon={FileText} title={text.empty.documents} />
        )}
        {documents.data ? (
          <Pagination meta={documents.data.meta} setPage={setDocumentPage} />
        ) : null}
      </ResourceSection>

      <ResourceSection
        title={text.sections.payments}
        count={payments.data?.meta.total ?? opportunity._count?.payments}
        action={
          canManagePayments ? (
            <Button
              size="sm"
              className="rounded-xl bg-[var(--app-primary)]"
              onClick={() => setPayment(null)}
            >
              <Plus className="size-4" />
              {text.actions.addPayment}
            </Button>
          ) : null
        }
      >
        {!canViewPayments ? (
          <PermissionNotice />
        ) : payments.isLoading ? (
          <LoadingState rows={2} />
        ) : payments.isError ? (
          <SectionError onRetry={() => void payments.refetch()} />
        ) : payments.data?.data.length ? (
          <>
            {paymentSummary ? (
              <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <PaymentMetric
                  label={text.paymentSummary.total}
                  value={`${money(paymentSummary.total)} ${paymentSummary.currency}`}
                />
                <PaymentMetric
                  label={text.paymentSummary.paid}
                  value={`${money(paymentSummary.paid)} ${paymentSummary.currency}`}
                />
                <PaymentMetric
                  label={text.paymentSummary.unpaid}
                  value={`${money(paymentSummary.total - paymentSummary.paid)} ${paymentSummary.currency}`}
                />
                <PaymentMetric
                  label={text.paymentSummary.overdue}
                  value={paymentSummary.overdue.toLocaleString("fa-IR")}
                />
              </div>
            ) : null}
            <div className="grid gap-2 2xl:grid-cols-2">
              {payments.data.data.map((item) => (
                <div
                  key={item.id}
                  className="min-w-0 rounded-xl border border-[var(--app-divider)] p-3"
                >
                  <div className="flex items-start justify-between">
                    <StatusBadge tone={paymentTone(item.status)}>
                      {text.paymentStatuses[item.status]}
                    </StatusBadge>
                    {canManagePayments ? (
                      <div className="flex">
                        <IconButton
                          label={uiText.opportunities.actions.edit}
                          onClick={() => setPayment(item)}
                        >
                          <Pencil />
                        </IconButton>
                        <IconButton
                          label={text.actions.delete}
                          danger
                          onClick={() =>
                            setDeleteTarget({ kind: "payment", id: item.id })
                          }
                        >
                          <Trash2 />
                        </IconButton>
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-4 text-lg font-bold break-words text-[var(--app-heading)]">
                    {money(item.amount)}{" "}
                    <span className="text-xs font-normal">
                      {item.currency}
                    </span>
                  </p>
                  <div className="mt-2 grid gap-1 text-xs text-[var(--app-text-secondary)]">
                    <p>
                      {text.fields.dueDate}:{" "}
                      {formatJalaliDate(item.dueDate) ||
                        uiText.common.notAvailable}
                    </p>
                    {item.paidAt ? (
                      <p>
                        {text.fields.paidAt}: {formatJalaliDate(item.paidAt)}
                      </p>
                    ) : null}
                    {item.method ? (
                      <p>
                        {text.fields.method}: {text.paymentMethods[item.method]}
                      </p>
                    ) : null}
                    {item.referenceNumber ? (
                      <p>
                        {text.fields.reference}: {item.referenceNumber}
                      </p>
                    ) : null}
                    {item.commercialDocument ? (
                      <p className="truncate">
                        {text.fields.linkedDocument}:{" "}
                        {item.commercialDocument.title}
                      </p>
                    ) : null}
                  </div>
                  {canManagePayments &&
                  item.status !== "PAID" &&
                  item.status !== "CANCELLED" ? (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 rounded-lg text-xs"
                        onClick={() =>
                          setActionTarget({ kind: "paymentPaid", id: item.id })
                        }
                      >
                        {text.actions.markPaid}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs"
                        onClick={() =>
                          setActionTarget({
                            kind: "paymentCancel",
                            id: item.id,
                          })
                        }
                      >
                        {text.actions.cancelPayment}
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <CompactEmpty icon={CreditCard} title={text.empty.payments} />
        )}
        {payments.data ? (
          <Pagination meta={payments.data.meta} setPage={setPaymentPage} />
        ) : null}
      </ResourceSection>

      {lineItem !== undefined ? (
        <LineItemDialog
          open
          onOpenChange={(open) => {
            if (!open) setLineItem(undefined)
          }}
          item={lineItem}
          pending={createLine.isPending || updateLine.isPending}
          onSubmit={saveLine}
        />
      ) : null}
      {document !== undefined ? (
        <CommercialDocumentDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setDocument(undefined)
              setUploadMode(false)
            }
          }}
          document={document}
          uploadMode={uploadMode}
          pending={createDocument.isPending || updateDocument.isPending}
          onSubmit={saveDocument}
        />
      ) : null}
      {payment !== undefined ? (
        <PaymentDialog
          open
          onOpenChange={(open) => {
            if (!open) setPayment(undefined)
          }}
          payment={payment}
          documents={documents.data?.data ?? []}
          pending={createPayment.isPending || updatePayment.isPending}
          onSubmit={savePayment}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={text.dialogs.deleteTitle}
        description={text.dialogs.deleteDescription}
        confirmLabel={text.actions.delete}
        isPending={
          deleteLine.isPending ||
          deleteDocument.isPending ||
          deletePayment.isPending
        }
        onConfirm={removeTarget}
      />
      <ConfirmDialog
        open={Boolean(actionTarget)}
        onOpenChange={(open) => {
          if (!open) setActionTarget(null)
        }}
        title={
          actionTarget?.kind === "paymentPaid"
            ? text.actions.markPaid
            : text.dialogs.cancelTitle
        }
        confirmLabel={uiText.common.confirm}
        tone={actionTarget?.kind === "paymentPaid" ? "primary" : "danger"}
        isPending={paidPayment.isPending || cancelPayment.isPending}
        onConfirm={confirmAction}
      />
    </div>
  )
}

function ResourceSection({
  className = "",
  title,
  count,
  action,
  children,
}: {
  className?: string
  title: string
  count?: number
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <SurfaceCard
      className={`flex max-h-[440px] max-w-full min-w-0 flex-col overflow-hidden ${className}`}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--app-divider)] px-4 py-3">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold break-words text-[var(--app-heading)]">
          {title}
          {count !== undefined ? (
            <span className="rounded-full bg-[var(--app-primary-soft)] px-2 py-0.5 text-xs text-[var(--app-primary)]">
              {count.toLocaleString("fa-IR")}
            </span>
          ) : null}
        </h2>
        {action}
      </div>
      <div className="min-h-0 max-w-full min-w-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {children}
      </div>
    </SurfaceCard>
  )
}
function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={
        danger
          ? "size-8 rounded-lg text-[var(--destructive)] [&_svg]:size-3.5"
          : "size-8 rounded-lg [&_svg]:size-3.5"
      }
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
function SectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <ErrorState
      title={uiText.opportunities.detail.errors.section}
      description={uiText.opportunities.errors.listDescription}
      retryLabel={uiText.common.retry}
      onRetry={onRetry}
    />
  )
}
function PermissionNotice() {
  return (
    <ErrorState
      title={uiText.opportunities.detail.errors.resourcePermissionTitle}
      description={
        uiText.opportunities.detail.errors.resourcePermissionDescription
      }
    />
  )
}
function CompactEmpty({ icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="w-full max-w-full min-w-0 [&_h3]:mt-2 [&>div]:min-h-0 [&>div]:w-full [&>div]:max-w-full [&>div]:p-4">
      <EmptyState icon={icon} title={title} />
    </div>
  )
}
function PaymentMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-[var(--app-background)] p-3">
      <p className="text-xs text-[var(--app-text-secondary)]">{label}</p>
      <p className="mt-1 text-xs font-bold break-words text-[var(--app-heading)]">
        {value}
      </p>
    </div>
  )
}
function money(value?: number | string | null) {
  const number = Number(value)
  return Number.isFinite(number)
    ? number.toLocaleString("fa-IR")
    : uiText.common.notAvailable
}
function documentTone(
  status: CommercialDocumentStatus
): "neutral" | "success" | "warning" | "error" | "info" {
  if (status === "SIGNED" || status === "ACCEPTED") return "success"
  if (status === "REJECTED" || status === "CANCELLED") return "error"
  if (status === "SENT") return "info"
  if (status === "EXPIRED") return "warning"
  return "neutral"
}
function paymentTone(
  status: OpportunityPayment["status"]
): "neutral" | "success" | "warning" | "error" {
  if (status === "PAID") return "success"
  if (status === "OVERDUE") return "error"
  if (status === "PARTIAL") return "warning"
  return "neutral"
}
function Pagination({
  meta,
  setPage,
}: {
  meta: { hasPrevious?: boolean; hasNext?: boolean }
  setPage: Dispatch<SetStateAction<number>>
}) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl"
        disabled={!meta.hasPrevious}
        onClick={() => setPage((value) => Math.max(1, value - 1))}
      >
        {uiText.common.pagination.previous}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl"
        disabled={!meta.hasNext}
        onClick={() => setPage((value) => value + 1)}
      >
        {uiText.common.pagination.next}
      </Button>
    </div>
  )
}
