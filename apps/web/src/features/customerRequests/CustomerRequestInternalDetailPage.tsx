import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  FileText,
  History,
  Link2,
  Route,
  UserRound,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  ContentList,
  ContentListItem,
  ContentSection,
} from "@/components/shared/ContentSection"
import { ErrorState } from "@/components/shared/ErrorState"
import { FormSection } from "@/components/shared/FormSection"
import { LoadingState } from "@/components/shared/LoadingState"
import { PageHero } from "@/components/shared/PageHero"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { uiText } from "@/config/uiText"
import { normalizeAppError } from "@/lib/appError"
import { formatJalaliDateTime } from "@/lib/date/jalali"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { FormField } from "@workspace/ui/components/form-field"
import { Input } from "@workspace/ui/components/input"
import { NativeSelect } from "@workspace/ui/components/native-select"
import { Textarea } from "@workspace/ui/components/textarea"

import { DynamicRequestForm } from "./DynamicRequestForm"
import { internalRequestApi } from "./customerRequests.api"
import {
  requestPriorityFa,
  requestPriorityTone,
  requestStatusFa,
  requestStatusTone,
} from "./customerRequests.presentation"
import type {
  CustomerRequest,
  RequestCrmLink,
  RequestPriority,
  RequestRoutingDestination,
  RequestStatus,
} from "./customerRequests.types"

const routingFa: Record<RequestRoutingDestination, string> = {
  MANUAL: "رسیدگی دستی",
  TASK: "کار داخلی",
  TECHNICAL_DOCUMENT: "مرکز فنی",
  OPPORTUNITY: "فرصت فروش",
}

const targetTypeFa = {
  TASK: "کار",
  OPPORTUNITY: "فرصت",
  TECHNICAL_DOCUMENT: "سند فنی",
} as const

function mutationError(error: unknown, fallback: string) {
  const normalized = normalizeAppError(error, fallback)
  toast.error(normalized.message)
}

function CustomerRequestOperationsPanel({
  request,
}: {
  request: CustomerRequest
}) {
  const client = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []
  const [priority, setPriority] = useState<RequestPriority>(
    request.priority ?? "NORMAL"
  )
  const [assignee, setAssignee] = useState(request.assignedToId ?? "")
  const [team, setTeam] = useState(request.responsibleTeamId ?? "")
  const [routing, setRouting] = useState<RequestRoutingDestination>(
    request.routingDestination ??
      request.requestType.defaultRoutingDestination ??
      "MANUAL"
  )
  const [reason, setReason] = useState(request.triageReason ?? "")
  const [targetType, setTargetType] =
    useState<keyof typeof targetTypeFa>("TASK")
  const [targetId, setTargetId] = useState("")
  const [unlinkTarget, setUnlinkTarget] = useState<RequestCrmLink | null>(null)

  const assignees = useQuery({
    queryKey: ["customer-request-assignees"],
    queryFn: internalRequestApi.assignees,
  })
  const options = useQuery({
    queryKey: ["customer-request-triage-options"],
    queryFn: internalRequestApi.triageOptions,
  })
  const history = useQuery({
    queryKey: ["customer-request-triage-history", request.id],
    queryFn: () => internalRequestApi.triageHistory(request.id),
  })
  const links = useQuery({
    queryKey: ["customer-request-links", request.id],
    queryFn: () => internalRequestApi.links(request.id),
  })

  const refresh = () => {
    void client.invalidateQueries({
      queryKey: ["customer-request-internal", request.id],
    })
    void client.invalidateQueries({
      queryKey: ["customer-request-links", request.id],
    })
    void client.invalidateQueries({
      queryKey: ["customer-request-triage-history", request.id],
    })
    void client.invalidateQueries({ queryKey: ["customer-requests-inbox"] })
  }

  const triage = useMutation({
    mutationFn: () =>
      internalRequestApi.updateTriage(request.id, {
        expectedRevision: request.revision ?? 1,
        priority,
        ...(permissions.includes("customer-request:assign") && {
          assignedToId: assignee || null,
          responsibleTeamId: team || null,
        }),
        ...(permissions.includes("customer-request:route") && {
          routingDestination: routing,
        }),
        internalReason: reason,
        completeTriage: true,
      }),
    onSuccess: () => {
      toast.success("تریاژ ثبت شد.")
      refresh()
    },
    onError: (error) =>
      mutationError(error, "ثبت تریاژ انجام نشد؛ صفحه را تازه‌سازی کنید."),
  })
  const link = useMutation({
    mutationFn: () =>
      internalRequestApi.linkExisting(request.id, { targetType, targetId }),
    onSuccess: () => {
      setTargetId("")
      refresh()
    },
    onError: (error) => mutationError(error, "پیوند رکورد انجام نشد."),
  })
  const unlink = useMutation({
    mutationFn: (linkId: string) =>
      internalRequestApi.unlink(request.id, linkId, "حذف پیوند"),
    onSuccess: () => {
      setUnlinkTarget(null)
      refresh()
    },
    onError: (error) => mutationError(error, "حذف پیوند انجام نشد."),
  })
  const create = useMutation({
    mutationFn: (kind: keyof typeof targetTypeFa) => {
      if (!user?.id) throw new Error("Authenticated user is required")
      const idempotencyKey = crypto.randomUUID()
      if (kind === "TASK") {
        return internalRequestApi.createLinkedTask(request.id, {
          title: request.title,
          assignedToId: user.id,
          idempotencyKey,
        })
      }
      if (kind === "OPPORTUNITY") {
        return internalRequestApi.createLinkedOpportunity(request.id, {
          title: request.title,
          ownerId: user.id,
          idempotencyKey,
        })
      }
      return internalRequestApi.createLinkedTechnicalDocument(request.id, {
        title: request.title,
        ownerId: user.id,
        documentType: "CUSTOMER_REQUEST",
        idempotencyKey,
      })
    },
    onSuccess: refresh,
    onError: (error) => mutationError(error, "ایجاد رکورد مرتبط انجام نشد."),
  })

  const canAssign = permissions.includes("customer-request:assign")
  const canRoute = permissions.includes("customer-request:route")
  const canLink = permissions.includes("customer-request:link")

  return (
    <div className="grid min-w-0 gap-4">
      {permissions.includes("customer-request:triage") ? (
        <FormSection
          title="تریاژ و ارجاع داخلی"
          description="اولویت، مسئول رسیدگی و مسیر عملیاتی این درخواست را ثبت کنید."
          footer={
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={triage.isPending}
                aria-busy={triage.isPending || undefined}
                onClick={() => triage.mutate()}
              >
                {triage.isPending ? "در حال ثبت..." : "ثبت تریاژ"}
              </Button>
            </div>
          }
        >
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <FormField label="اولویت">
              {(fieldProps) => (
                <NativeSelect
                  {...fieldProps}
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as RequestPriority)
                  }
                >
                  {Object.entries(requestPriorityFa).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <FormField
              label="مسئول"
              disabled={!canAssign}
              description={
                canAssign ? undefined : "مجوز تغییر مسئول برای شما فعال نیست."
              }
            >
              {(fieldProps) => (
                <NativeSelect
                  {...fieldProps}
                  value={assignee}
                  onChange={(event) => setAssignee(event.target.value)}
                >
                  <option value="">بدون مسئول</option>
                  {assignees.data?.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.fullName || person.label || person.email}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <FormField
              label="تیم مسئول"
              disabled={!canAssign}
              description={
                canAssign
                  ? undefined
                  : "مجوز تغییر تیم مسئول برای شما فعال نیست."
              }
            >
              {(fieldProps) => (
                <NativeSelect
                  {...fieldProps}
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                >
                  <option value="">بدون تیم</option>
                  {options.data?.teams.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <FormField
              label="مقصد عملیاتی"
              disabled={!canRoute}
              description={
                canRoute
                  ? undefined
                  : "مجوز تغییر مقصد عملیاتی برای شما فعال نیست."
              }
            >
              {(fieldProps) => (
                <NativeSelect
                  {...fieldProps}
                  value={routing}
                  onChange={(event) =>
                    setRouting(event.target.value as RequestRoutingDestination)
                  }
                >
                  {Object.entries(routingFa).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              )}
            </FormField>
            <FormField
              label="دلیل داخلی تریاژ"
              optional
              className="sm:col-span-2"
            >
              {(fieldProps) => (
                <Textarea
                  {...fieldProps}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              )}
            </FormField>
          </div>
        </FormSection>
      ) : null}

      <ContentSection
        title="رکوردهای مرتبط CRM"
        description="کارها، فرصت‌ها و اسناد فنی متصل به این درخواست"
        icon={Link2}
      >
        <QueryContent
          query={links}
          errorTitle="دریافت رکوردهای مرتبط انجام نشد"
        >
          <ContentList>
            {links.data?.map((item) => {
              const entity =
                item.task || item.opportunity || item.technicalDocument
              const path = item.task
                ? `/tasks/${item.task.id}`
                : item.opportunity
                  ? `/opportunities/${item.opportunity.id}`
                  : `/technical/documents/${item.technicalDocument?.id}`
              return (
                <ContentListItem
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <Link
                    className="min-w-0 font-semibold break-words text-primary hover:underline"
                    to={path}
                  >
                    {entity?.title}
                  </Link>
                  {canLink ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUnlinkTarget(item)}
                    >
                      حذف پیوند
                    </Button>
                  ) : null}
                </ContentListItem>
              )
            })}
            {!links.data?.length ? (
              <p className="text-sm text-muted-foreground">
                رکورد مرتبطی ثبت نشده است.
              </p>
            ) : null}
          </ContentList>
        </QueryContent>

        {canLink ? (
          <div className="mt-4 grid gap-4 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {permissions.includes("task:create") ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={create.isPending}
                  onClick={() => create.mutate("TASK")}
                >
                  ایجاد کار
                </Button>
              ) : null}
              {permissions.includes("opportunity:create") ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={create.isPending}
                  onClick={() => create.mutate("OPPORTUNITY")}
                >
                  ایجاد فرصت
                </Button>
              ) : null}
              {permissions.includes("technical-document:manage") ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={create.isPending}
                  onClick={() => create.mutate("TECHNICAL_DOCUMENT")}
                >
                  ایجاد سند فنی
                </Button>
              ) : null}
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-end">
              <FormField label="نوع رکورد">
                {(fieldProps) => (
                  <NativeSelect
                    {...fieldProps}
                    value={targetType}
                    onChange={(event) =>
                      setTargetType(
                        event.target.value as keyof typeof targetTypeFa
                      )
                    }
                  >
                    {Object.entries(targetTypeFa).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </FormField>
              <FormField label="شناسه رکورد موجود">
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    dir="ltr"
                    value={targetId}
                    onChange={(event) => setTargetId(event.target.value)}
                  />
                )}
              </FormField>
              <Button
                type="button"
                variant="outline"
                disabled={!targetId || link.isPending}
                aria-busy={link.isPending || undefined}
                onClick={() => link.mutate()}
              >
                {link.isPending ? "در حال پیوند..." : "پیوند"}
              </Button>
            </div>
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        title="تاریخچه عملیاتی"
        description="آخرین تغییرات داخلی انجام‌شده روی درخواست"
        icon={History}
      >
        <QueryContent
          query={history}
          errorTitle="دریافت تاریخچه عملیاتی انجام نشد"
        >
          <ContentList>
            {history.data?.map((item) => (
              <ContentListItem key={item.id}>
                <strong className="text-sm">{item.action}</strong>
                <p className="mt-1 text-sm break-words text-muted-foreground">
                  {item.actor.fullName}
                  {item.internalReason ? ` · ${item.internalReason}` : ""}
                </p>
                <time className="mt-1 block text-xs text-muted-foreground">
                  {formatJalaliDateTime(item.createdAt)}
                </time>
              </ContentListItem>
            ))}
            {!history.data?.length ? (
              <p className="text-sm text-muted-foreground">
                رویدادی ثبت نشده است.
              </p>
            ) : null}
          </ContentList>
        </QueryContent>
      </ContentSection>

      <ConfirmDialog
        open={Boolean(unlinkTarget)}
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null)
        }}
        title="حذف پیوند رکورد"
        description={`پیوند «${
          unlinkTarget?.task?.title ||
          unlinkTarget?.opportunity?.title ||
          unlinkTarget?.technicalDocument?.title ||
          "رکورد انتخاب‌شده"
        }» از این درخواست حذف می‌شود.`}
        confirmLabel="حذف پیوند"
        isPending={unlink.isPending}
        onConfirm={() => {
          if (unlinkTarget) unlink.mutate(unlinkTarget.id)
        }}
      />
    </div>
  )
}

export function CustomerRequestInternalDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ["customer-request-internal", id],
    queryFn: () => internalRequestApi.detail(id),
    enabled: Boolean(id),
  })
  const [next, setNext] = useState<RequestStatus | "">("")
  const [customerNote, setCustomerNote] = useState("")
  const [reason, setReason] = useState("")

  const change = useMutation({
    mutationFn: () =>
      internalRequestApi.status(
        id,
        next as RequestStatus,
        customerNote,
        reason
      ),
    onSuccess: () => {
      toast.success("وضعیت به‌روزرسانی شد.")
      void client.invalidateQueries({
        queryKey: ["customer-request-internal", id],
      })
    },
    onError: (error) => mutationError(error, "ثبت وضعیت انجام نشد."),
  })

  if (query.isLoading) {
    return <LoadingState rows={7} />
  }
  if (query.isError) {
    const error = normalizeAppError(query.error)
    const missing = error.kind === "not-found"
    return (
      <ErrorState
        title={missing ? "درخواست در دسترس نیست" : "دریافت درخواست انجام نشد"}
        description={error.message}
        retryLabel={missing ? undefined : uiText.common.retry}
        onRetry={missing ? undefined : () => void query.refetch()}
      />
    )
  }
  if (!query.data) {
    return (
      <ErrorState
        title="درخواست در دسترس نیست"
        description="این درخواست پیدا نشد یا دیگر در محدوده دسترسی شما قرار ندارد."
      />
    )
  }

  const request = query.data
  const companyName =
    request.company?.brandName || request.company?.legalName || "شرکت ثبت نشده"

  return (
    <div className="mx-auto grid w-full max-w-[1500px] min-w-0 gap-4">
      <PageHero
        title={request.title}
        description="جزئیات درخواست مشتری و عملیات داخلی مرتبط با آن"
        accessBadge={{ label: "درخواست مشتری", icon: FileText }}
        onBack={() => navigate("/customer-requests")}
        onRefresh={() => query.refetch()}
        refreshing={query.isFetching}
        metadata={
          <>
            <StatusBadge tone={requestStatusTone[request.status]}>
              {requestStatusFa[request.status]}
            </StatusBadge>
            <StatusBadge
              tone={requestPriorityTone[request.priority ?? "NORMAL"]}
              dot={false}
            >
              {requestPriorityFa[request.priority ?? "NORMAL"]}
            </StatusBadge>
          </>
        }
        facts={[
          {
            id: "company",
            label: "شرکت",
            value: companyName,
            icon: Building2,
          },
          {
            id: "type",
            label: "نوع درخواست",
            value: request.requestType.displayName,
            icon: Route,
          },
          {
            id: "tracking",
            label: "شماره پیگیری",
            value: <span dir="ltr">{request.trackingNumber || "-"}</span>,
            icon: FileText,
          },
          {
            id: "creator",
            label: "ثبت‌کننده",
            value: request.creator?.fullName || "ثبت نشده",
            icon: UserRound,
          },
        ]}
      />

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,390px)]">
        <main className="grid min-w-0 gap-4">
          <ContentSection
            title="پاسخ‌های ثبت‌شده"
            description="اطلاعاتی که مشتری در فرم درخواست ثبت کرده است"
            icon={FileText}
          >
            {request.formVersion ? (
              <DynamicRequestForm
                schema={request.formVersion.schema}
                value={request.answers ?? {}}
                onChange={() => {}}
                disabled
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                پاسخی برای این درخواست ثبت نشده است.
              </p>
            )}
          </ContentSection>

          <ContentSection
            title="تاریخچه وضعیت"
            description="تغییرات وضعیت قابل مشاهده برای پیگیری درخواست"
            icon={History}
          >
            <ContentList>
              {request.histories?.map((item) => (
                <ContentListItem key={item.id}>
                  <StatusBadge tone={requestStatusTone[item.newStatus]}>
                    {requestStatusFa[item.newStatus]}
                  </StatusBadge>
                  <p className="mt-2 text-sm break-words text-muted-foreground">
                    {item.customerVisibleExplanation ||
                      item.internalReason ||
                      "بدون توضیح"}
                  </p>
                  <time className="mt-1 block text-xs text-muted-foreground">
                    {formatJalaliDateTime(item.createdAt)}
                  </time>
                </ContentListItem>
              ))}
              {!request.histories?.length ? (
                <p className="text-sm text-muted-foreground">
                  هنوز تغییری در وضعیت ثبت نشده است.
                </p>
              ) : null}
            </ContentList>
          </ContentSection>
        </main>

        <aside className="grid min-w-0 gap-4 xl:sticky xl:top-4">
          <CustomerRequestOperationsPanel
            key={`${request.id}-${request.revision ?? 1}`}
            request={request}
          />

          <FormSection
            title="تغییر وضعیت"
            description="فقط وضعیت‌های مجاز این مرحله قابل انتخاب هستند."
            footer={
              <div className="flex justify-end">
                <Button
                  type="button"
                  disabled={!next || change.isPending}
                  aria-busy={change.isPending || undefined}
                  onClick={() => change.mutate()}
                >
                  {change.isPending ? "در حال ثبت..." : "ثبت وضعیت"}
                </Button>
              </div>
            }
          >
            <div className="grid gap-4">
              <FormField label="وضعیت جدید" required>
                {(fieldProps) => (
                  <NativeSelect
                    {...fieldProps}
                    value={next}
                    onChange={(event) =>
                      setNext(event.target.value as RequestStatus | "")
                    }
                  >
                    <option value="">انتخاب وضعیت مجاز</option>
                    {request.allowedTransitions?.map((status) => (
                      <option key={status} value={status}>
                        {requestStatusFa[status]}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </FormField>
              <FormField
                label="توضیح برای مشتری"
                optional
                description="این متن برای مشتری قابل مشاهده است."
              >
                {(fieldProps) => (
                  <Textarea
                    {...fieldProps}
                    value={customerNote}
                    onChange={(event) => setCustomerNote(event.target.value)}
                  />
                )}
              </FormField>
              <FormField
                label="دلیل داخلی"
                optional
                description="این متن برای مشتری نمایش داده نمی‌شود."
              >
                {(fieldProps) => (
                  <Textarea
                    {...fieldProps}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                )}
              </FormField>
            </div>
          </FormSection>
        </aside>
      </div>
    </div>
  )
}
