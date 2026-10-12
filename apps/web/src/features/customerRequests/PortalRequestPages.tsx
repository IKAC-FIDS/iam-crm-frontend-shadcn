import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { DynamicRequestForm } from "./DynamicRequestForm"
import {
  requestStatusFa,
  validateDynamicAnswers,
} from "./customerRequests.presentation"
import { portalRequestApi } from "./customerRequests.api"
import type { CustomerRequest } from "./customerRequests.types"
const keys = {
  types: ["portal-request-types"] as const,
  list: (p: unknown) => ["portal-requests", p] as const,
  detail: (id: string) => ["portal-request", id] as const,
}
function Empty({ children }: { children: string }) {
  return (
    <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
      {children}
    </div>
  )
}
function RequestCard({ request: r }: { request: CustomerRequest }) {
  return (
    <Link
      to={`/portal/requests/${r.id}`}
      className="block rounded-2xl border bg-card p-4 transition hover:border-primary/50"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong>{r.title}</strong>
        <Badge variant="secondary">{requestStatusFa[r.status]}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>{r.requestType.displayName}</span>
        {r.trackingNumber && <span dir="ltr">{r.trackingNumber}</span>}
        <span>{new Date(r.updatedAt).toLocaleDateString("fa-IR")}</span>
      </div>
    </Link>
  )
}
function SharingControls({ requestId }: { requestId: string }) {
  const client = useQueryClient()
  const shares = useQuery({
    queryKey: ["portal-request-shares", requestId],
    queryFn: () => portalRequestApi.shares(requestId),
  })
  const members = useQuery({
    queryKey: ["portal-company-members"],
    queryFn: portalRequestApi.members,
  })
  const [membershipId, setMembershipId] = useState("")
  const add = useMutation({
    mutationFn: () => portalRequestApi.share(requestId, membershipId),
    onSuccess: () => {
      setMembershipId("")
      void client.invalidateQueries({
        queryKey: ["portal-request-shares", requestId],
      })
    },
  })
  const remove = useMutation({
    mutationFn: (shareId: string) =>
      portalRequestApi.revokeShare(requestId, shareId),
    onSuccess: () =>
      void client.invalidateQueries({
        queryKey: ["portal-request-shares", requestId],
      }),
  })
  const rows = shares.data as
    | Array<{
        id: string
        membershipId: string
        membership: { user: { fullName: string; email: string } }
      }>
    | undefined
  return (
    <Card>
      <CardHeader>
        <CardTitle>اشتراک با اعضای شرکت</CardTitle>
        <CardDescription>
          دسترسی فقط برای اعضای فعال همین شرکت ایجاد می‌شود.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="عضو شرکت"
            className="h-10 min-w-52 flex-1 rounded-md border bg-background px-3"
            value={membershipId}
            onChange={(e) => setMembershipId(e.target.value)}
          >
            <option value="">انتخاب عضو</option>
            {members.data?.memberships
              .filter(
                (m) =>
                  m.status === "ACTIVE" &&
                  !rows?.some((s) => s.membershipId === m.id)
              )
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.fullName} — {m.user.email}
                </option>
              ))}
          </select>
          <Button
            disabled={!membershipId || add.isPending}
            onClick={() => add.mutate()}
          >
            اشتراک
          </Button>
        </div>
        {rows?.map((share) => (
          <div
            key={share.id}
            className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
          >
            <span>
              {share.membership.user.fullName} — {share.membership.user.email}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => remove.mutate(share.id)}
            >
              لغو اشتراک
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
export function PortalRequestsHome() {
  const types = useQuery({
      queryKey: keys.types,
      queryFn: portalRequestApi.types,
    }),
    recent = useQuery({
      queryKey: keys.list({ limit: 5 }),
      queryFn: () => portalRequestApi.list({ limit: 5 }),
    })
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">خدمات مشتریان</h1>
            <p className="text-sm text-muted-foreground">
              درخواست جدید ثبت کنید یا وضعیت درخواست‌های قبلی را پیگیری کنید.
            </p>
          </div>
          <Button render={<Link to="/portal/requests/new" />}>
            ثبت درخواست جدید
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {types.data?.map((t) => (
            <Link key={t.id} to={`/portal/requests/new?type=${t.id}`}>
              <Card className="h-full transition hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-base">{t.displayName}</CardTitle>
                  <CardDescription>
                    {t.description || "ثبت درخواست خدمات"}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        {!types.isLoading && !types.data?.length && (
          <Empty>در حال حاضر نوع درخواست فعالی برای این شرکت وجود ندارد.</Empty>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">درخواست‌های اخیر</h2>
          <Button variant="outline" render={<Link to="/portal/requests" />}>
            مشاهده همه
          </Button>
        </div>
        <div className="space-y-3">
          {recent.data?.data.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
          {!recent.isLoading && !recent.data?.data.length && (
            <Empty>هنوز درخواستی ثبت نشده است.</Empty>
          )}
        </div>
      </section>
    </div>
  )
}
export function PortalRequestsListPage() {
  const [params, setParams] = useSearchParams(),
    status = params.get("status") || "",
    search = params.get("search") || ""
  const query = useQuery({
    queryKey: keys.list({ status, search }),
    queryFn: () =>
      portalRequestApi.list({
        ...(status && { status }),
        ...(search && { search }),
      }),
  })
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">درخواست‌های من</h1>
        <Button render={<Link to="/portal/requests/new" />}>
          درخواست جدید
        </Button>
      </div>
      <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2">
        <Input
          aria-label="جست‌وجوی درخواست"
          placeholder="شماره پیگیری یا عنوان"
          defaultValue={search}
          onChange={(e) => {
            const p = new URLSearchParams(params)
            if (e.target.value) p.set("search", e.target.value)
            else p.delete("search")
            setParams(p, { replace: true })
          }}
        />
        <select
          aria-label="وضعیت"
          className="h-10 rounded-md border bg-background px-3"
          value={status}
          onChange={(e) => {
            const p = new URLSearchParams(params)
            if (e.target.value) p.set("status", e.target.value)
            else p.delete("status")
            setParams(p)
          }}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(requestStatusFa).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {query.data?.data.map((r) => (
          <RequestCard key={r.id} request={r} />
        ))}
        {!query.isLoading && !query.data?.data.length && (
          <Empty>درخواستی مطابق فیلتر پیدا نشد.</Empty>
        )}
      </div>
    </section>
  )
}
export function PortalNewRequestPage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    client = useQueryClient(),
    types = useQuery({ queryKey: keys.types, queryFn: portalRequestApi.types }),
    [typeId, setTypeId] = useState(params.get("type") || ""),
    [title, setTitle] = useState(""),
    [answers, setAnswers] = useState<Record<string, unknown>>({}),
    [errors, setErrors] = useState<Record<string, string>>({})
  const selected = types.data?.find((t) => t.id === typeId)
  const create = useMutation({
    mutationFn: () =>
      portalRequestApi.create({ requestTypeId: typeId, title, answers }),
    onSuccess: (r) => {
      void client.invalidateQueries({ queryKey: ["portal-requests"] })
      navigate(`/portal/requests/${r.id}`)
    },
    onError: () => toast.error("ذخیره پیش‌نویس انجام نشد."),
  })
  const save = () => {
    if (!selected?.currentPublishedVersion || !title.trim())
      return toast.error("نوع درخواست و عنوان را تکمیل کنید.")
    const next = validateDynamicAnswers(
      selected.currentPublishedVersion.schema,
      answers
    )
    setErrors(next)
    if (!Object.keys(next).length) create.mutate()
  }
  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">ثبت درخواست جدید</h1>
        <p className="text-sm text-muted-foreground">
          اطلاعات ابتدا به صورت پیش‌نویس ذخیره می‌شود.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              نوع درخواست
            </label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3"
              value={typeId}
              onChange={(e) => {
                setTypeId(e.target.value)
                setAnswers({})
              }}
            >
              <option value="">انتخاب کنید</option>
              {types.data?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              عنوان کوتاه درخواست
            </label>
            <Input
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="برای نمونه: مشکل فعال‌سازی مجوز"
            />
          </div>
          {selected?.currentPublishedVersion && (
            <DynamicRequestForm
              schema={selected.currentPublishedVersion.schema}
              value={answers}
              onChange={setAnswers}
              errors={errors}
            />
          )}
          <div className="flex justify-end">
            <Button disabled={create.isPending} onClick={save}>
              ذخیره پیش‌نویس و بازبینی
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
export function PortalRequestDetailPage() {
  const { id = "" } = useParams(),
    client = useQueryClient(),
    query = useQuery({
      queryKey: keys.detail(id),
      queryFn: () => portalRequestApi.detail(id),
      enabled: !!id,
    }),
    [answers, setAnswers] = useState<Record<string, unknown> | null>(null),
    [title, setTitle] = useState<string | null>(null),
    [errors, setErrors] = useState<Record<string, string>>({})
  const refresh = () => client.invalidateQueries({ queryKey: keys.detail(id) }),
    save = useMutation({
      mutationFn: () =>
        portalRequestApi.save(id, {
          title: title ?? query.data!.title,
          answers: answers ?? query.data!.answers ?? {},
        }),
      onSuccess: () => {
        toast.success("پیش‌نویس ذخیره شد.")
        void refresh()
      },
    }),
    submit = useMutation({
      mutationFn: () => portalRequestApi.submit(id),
      onSuccess: () => {
        toast.success("درخواست ثبت شد.")
        void refresh()
      },
      onError: () => toast.error("ارسال درخواست انجام نشد."),
    }),
    cancel = useMutation({
      mutationFn: () => portalRequestApi.cancel(id),
      onSuccess: () => void refresh(),
    })
  if (query.isLoading) return <p>در حال دریافت درخواست...</p>
  if (!query.data) return <Empty>درخواست پیدا نشد یا دسترسی ندارید.</Empty>
  const r = query.data,
    current = answers ?? r.answers ?? {},
    schema = r.formVersion?.schema,
    doSubmit = () => {
      const next = schema ? validateDynamicAnswers(schema, current) : {}
      setErrors(next)
      if (!Object.keys(next).length) submit.mutate()
    }
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{r.title}</h1>
            <Badge>{requestStatusFa[r.status]}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {r.requestType.displayName}{" "}
            {r.trackingNumber && (
              <span className="ms-2" dir="ltr">
                {r.trackingNumber}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {r.allowedActions?.cancel && (
            <Button variant="outline" onClick={() => cancel.mutate()}>
              لغو درخواست
            </Button>
          )}
          {r.allowedActions?.submit && (
            <Button onClick={doSubmit}>ارسال نهایی</Button>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات درخواست</CardTitle>
          <CardDescription>نسخه فرم {r.formVersion?.version}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {r.allowedActions?.edit && (
            <Input
              value={title ?? r.title}
              onChange={(e) => setTitle(e.target.value)}
            />
          )}{" "}
          {schema && (
            <DynamicRequestForm
              schema={schema}
              value={current}
              onChange={setAnswers}
              errors={errors}
              disabled={!r.allowedActions?.edit}
            />
          )}{" "}
          {r.allowedActions?.edit && (
            <Button variant="outline" onClick={() => save.mutate()}>
              ذخیره تغییرات
            </Button>
          )}
        </CardContent>
      </Card>
      {r.allowedActions?.share && <SharingControls requestId={r.id} />}
      <Card>
        <CardHeader>
          <CardTitle>تاریخچه وضعیت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {r.histories?.map((h) => (
            <div key={h.id} className="border-s-2 border-primary ps-4">
              <strong className="text-sm">
                {requestStatusFa[h.newStatus]}
              </strong>
              <p className="text-sm text-muted-foreground">
                {h.customerVisibleExplanation || "به‌روزرسانی وضعیت درخواست"}
              </p>
              <time className="text-xs text-muted-foreground">
                {new Date(h.createdAt).toLocaleString("fa-IR")}
              </time>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
