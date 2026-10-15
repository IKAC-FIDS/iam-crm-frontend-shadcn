import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Eye, Inbox } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/shared/DataTableShell"
import { DataTableToolbar } from "@/components/shared/DataTableToolbar"
import { EmptyState } from "@/components/shared/EmptyState"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { PageHero } from "@/components/shared/PageHero"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge"
import { Button } from "@workspace/ui/components/button"
import { NativeSelect } from "@workspace/ui/components/native-select"

import { internalRequestApi } from "./customerRequests.api"
import {
  requestPriorityFa,
  requestStatusFa,
} from "./customerRequests.presentation"
import type {
  CustomerRequest,
  RequestPriority,
  RequestStatus,
} from "./customerRequests.types"

const allowedSorts = [
  "submittedAt:asc",
  "submittedAt:desc",
  "updatedAt:desc",
] as const

function statusTone(status: RequestStatus): StatusTone {
  if (status === "RESOLVED" || status === "CLOSED") return "success"
  if (status === "CANCELLED") return "error"
  if (status === "WAITING_FOR_CUSTOMER") return "warning"
  if (status === "IN_PROGRESS" || status === "UNDER_REVIEW") return "info"
  return "neutral"
}

function priorityTone(priority: RequestPriority): StatusTone {
  if (priority === "URGENT") return "error"
  if (priority === "HIGH") return "warning"
  if (priority === "LOW") return "secondary"
  return "neutral"
}

function requestDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(
    new Date(value)
  )
}

export function CustomerRequestsInboxPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const status = params.get("status") || ""
  const search = params.get("search") || ""
  const priority = params.get("priority") || ""
  const triageStatus = params.get("triageStatus") || ""
  const assignedToId = params.get("assignedToId") || ""
  const requestTypeId = params.get("requestTypeId") || ""
  const requestedSort = params.get("sort") || "submittedAt:asc"
  const sort = allowedSorts.includes(
    requestedSort as (typeof allowedSorts)[number]
  )
    ? requestedSort
    : "submittedAt:asc"
  const [sortBy, sortOrder] = sort.split(":") as [
    "submittedAt" | "updatedAt",
    "asc" | "desc",
  ]
  const page = Math.max(1, Number(params.get("page")) || 1)
  const hasActiveFilters = Boolean(
    search ||
    status ||
    priority ||
    triageStatus ||
    assignedToId ||
    requestTypeId
  )

  const assignees = useQuery({
    queryKey: ["customer-request-assignees"],
    queryFn: internalRequestApi.assignees,
  })
  const options = useQuery({
    queryKey: ["customer-request-triage-options"],
    queryFn: internalRequestApi.triageOptions,
  })
  const query = useQuery({
    queryKey: [
      "customer-requests-inbox",
      status,
      search,
      priority,
      triageStatus,
      assignedToId,
      requestTypeId,
      sort,
      page,
    ],
    queryFn: () =>
      internalRequestApi.triageList({
        page,
        sortBy,
        sortOrder,
        ...(status && { status }),
        ...(search && { search }),
        ...(priority && { priority }),
        ...(triageStatus && { triageStatus }),
        ...(assignedToId && { assignedToId }),
        ...(requestTypeId && { requestTypeId }),
      }),
  })

  function updateParam(key: string, value: string, replace = false) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete("page")
    setParams(next, { replace })
  }

  function changePage(nextPage: number) {
    const next = new URLSearchParams(params)
    if (nextPage > 1) next.set("page", String(nextPage))
    else next.delete("page")
    setParams(next)
  }

  function clearFilters() {
    const next = new URLSearchParams()
    if (sort !== "submittedAt:asc") next.set("sort", sort)
    setParams(next)
  }

  useEffect(() => {
    if (!query.data) return
    const lastPage = Math.max(query.data.meta.totalPages, 1)
    if (page > lastPage) {
      const next = new URLSearchParams(params)
      if (lastPage > 1) next.set("page", String(lastPage))
      else next.delete("page")
      setParams(next, { replace: true })
    }
  }, [page, params, query.data, setParams])

  const columns: DataTableColumn<CustomerRequest>[] = [
    {
      id: "trackingNumber",
      header: "پیگیری",
      cell: (request) => (
        <Link
          className="font-semibold text-[var(--app-primary)] hover:underline"
          to={`/customer-requests/${request.id}`}
          dir="ltr"
        >
          {request.trackingNumber || "—"}
        </Link>
      ),
    },
    {
      id: "title",
      header: "عنوان",
      className: "max-w-72 whitespace-normal",
      cell: (request) => (
        <span className="line-clamp-2 font-semibold">{request.title}</span>
      ),
    },
    {
      id: "company",
      header: "شرکت",
      cell: (request) =>
        request.company?.brandName || request.company?.legalName || "—",
    },
    {
      id: "requestType",
      header: "نوع",
      cell: (request) => request.requestType.displayName,
    },
    {
      id: "status",
      header: "وضعیت",
      cell: (request) => (
        <StatusBadge tone={statusTone(request.status)}>
          {requestStatusFa[request.status]}
        </StatusBadge>
      ),
    },
    {
      id: "priority",
      header: "اولویت",
      cell: (request) => {
        const value = request.priority ?? "NORMAL"
        return (
          <StatusBadge tone={priorityTone(value)}>
            {requestPriorityFa[value]}
          </StatusBadge>
        )
      },
    },
    {
      id: "assignedTo",
      header: "مسئول",
      cell: (request) => request.assignedTo?.fullName || "بدون مسئول",
    },
  ]

  const rows = query.data?.data ?? []
  const meta = query.data?.meta
  const emptyState = hasActiveFilters ? (
    <EmptyState
      icon={Inbox}
      title="درخواستی با این فیلترها پیدا نشد"
      description="عبارت جست‌وجو یا فیلترها را تغییر دهید و دوباره تلاش کنید."
      action={
        <Button type="button" variant="outline" onClick={clearFilters}>
          پاک‌کردن فیلترها
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Inbox}
      title="هنوز درخواستی ثبت نشده است"
      description="پس از ثبت درخواست توسط مشتری، موارد اینجا برای بررسی نمایش داده می‌شوند."
    />
  )

  return (
    <section className="grid min-w-0 gap-5">
      <PageHero
        title="صندوق درخواست‌های مشتریان"
        description="درخواست‌های ثبت‌شده را بررسی و وضعیت آن‌ها را مدیریت کنید."
        accessBadge={{ label: "خدمات مشتریان", icon: Inbox }}
        onRefresh={() => query.refetch()}
        refreshing={query.isFetching}
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(value) => updateParam("search", value, true)}
        searchPlaceholder="عنوان یا شماره پیگیری"
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        filtersClassName="grid flex-none basis-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        filters={
          <>
            <NativeSelect
              aria-label="وضعیت درخواست"
              value={status}
              onChange={(event) => updateParam("status", event.target.value)}
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(requestStatusFa)
                .filter(([key]) => key !== "DRAFT")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </NativeSelect>
            <NativeSelect
              aria-label="اولویت درخواست"
              value={priority}
              onChange={(event) => updateParam("priority", event.target.value)}
            >
              <option value="">همه اولویت‌ها</option>
              {Object.entries(requestPriorityFa).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="وضعیت تریاژ"
              value={triageStatus}
              onChange={(event) =>
                updateParam("triageStatus", event.target.value)
              }
            >
              <option value="">همه وضعیت‌های تریاژ</option>
              <option value="UNTRIAGED">بررسی‌نشده</option>
              <option value="TRIAGED">تریاژشده</option>
            </NativeSelect>
            <NativeSelect
              aria-label="مسئول درخواست"
              value={assignedToId}
              disabled={assignees.isLoading || assignees.isError}
              onChange={(event) =>
                updateParam("assignedToId", event.target.value)
              }
            >
              <option value="">همه مسئولان</option>
              {assignees.data?.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.fullName || person.label || person.email}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="نوع درخواست"
              value={requestTypeId}
              disabled={options.isLoading || options.isError}
              onChange={(event) =>
                updateParam("requestTypeId", event.target.value)
              }
            >
              <option value="">همه انواع درخواست</option>
              {options.data?.requestTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.displayName}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="مرتب‌سازی درخواست‌ها"
              value={sort}
              onChange={(event) => updateParam("sort", event.target.value)}
            >
              <option value="submittedAt:asc">قدیمی‌ترین ارسال</option>
              <option value="submittedAt:desc">جدیدترین ارسال</option>
              <option value="updatedAt:desc">آخرین تغییر</option>
            </NativeSelect>
          </>
        }
      />

      <QueryContent query={query} errorTitle="دریافت درخواست‌ها انجام نشد">
        <DataTableShell
          rows={rows}
          columns={columns}
          getRowKey={(request) => request.id}
          caption="فهرست درخواست‌های مشتریان"
          emptyState={emptyState}
          onRowClick={(request) => navigate(`/customer-requests/${request.id}`)}
          renderRowActions={(request) => (
            <EntityRowActions
              label={`مشاهده درخواست ${request.title}`}
              actions={[
                {
                  id: "view",
                  label: "مشاهده",
                  accessibleLabel: `مشاهده درخواست ${request.title}`,
                  icon: Eye,
                  onClick: () => navigate(`/customer-requests/${request.id}`),
                },
              ]}
            />
          )}
          pagination={
            meta
              ? {
                  page: meta.page,
                  pageCount: Math.max(meta.totalPages, 1),
                  pageSize: meta.limit,
                  total: meta.total,
                  onPageChange: changePage,
                }
              : undefined
          }
          mobile={{
            title: (request) => request.title,
            subtitle: (request) =>
              request.trackingNumber || "بدون شماره پیگیری",
            status: (request) => (
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={statusTone(request.status)}>
                  {requestStatusFa[request.status]}
                </StatusBadge>
                <StatusBadge tone={priorityTone(request.priority ?? "NORMAL")}>
                  {requestPriorityFa[request.priority ?? "NORMAL"]}
                </StatusBadge>
              </div>
            ),
            fields: [
              {
                id: "company",
                label: "شرکت",
                render: (request) =>
                  request.company?.brandName ||
                  request.company?.legalName ||
                  "—",
              },
              {
                id: "requestType",
                label: "نوع",
                render: (request) => request.requestType.displayName,
              },
              {
                id: "submittedAt",
                label: "زمان ارسال",
                render: (request) => requestDate(request.submittedAt),
              },
              {
                id: "assignedTo",
                label: "مسئول",
                render: (request) =>
                  request.assignedTo?.fullName || "بدون مسئول",
              },
            ],
          }}
        />
      </QueryContent>
    </section>
  )
}
