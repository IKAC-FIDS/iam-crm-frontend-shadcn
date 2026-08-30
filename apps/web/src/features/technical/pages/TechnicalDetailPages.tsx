import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import {
  BookOpen,
  FileText,
  FolderOpen,
  Gavel,
  PackageOpen,
  Edit3,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { PageHero } from "@/components/shared/PageHero"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { QueryContent } from "@/components/shared/QueryContent"
import { FormSection } from "@/components/shared/FormSection"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { EmptyState } from "@/components/shared/EmptyState"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { PersianDatePicker } from "@/components/shared/PersianDatePicker"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { useAuthStore } from "@/store/authStore"
import { TechnicalFormDialog } from "../components/TechnicalFormDialog"
import { TechnicalAttachments } from "../components/TechnicalAttachments"
import {
  LifecycleActions,
  TechnicalStatusBadge,
} from "../components/TechnicalPrimitives"
import { technicalApi, technicalLookups } from "../api"
import {
  useRequirementMutations,
  useRequirements,
  useTechnicalDetail,
  useTechnicalTransition,
  useTenderWorkflow,
  useTenderWorkflowMutations,
  technicalKeys,
} from "../hooks"
import {
  documentPresentation,
  documentTransitions,
  faDate,
  knowledgePresentation,
  knowledgeTransitions,
  relationName,
  releasePresentation,
  releaseTransitions,
  requirementPresentation,
  resourcePresentation,
  resourceTypeLabels,
  tenderPresentation,
  tenderTransitions,
  tenderTypeLabels,
} from "../presentation"
import type {
  DocumentStatus,
  KnowledgeArticle,
  KnowledgeStatus,
  ReleaseStatus,
  RequirementPayload,
  TechnicalDocument,
  TechnicalKind,
  TechnicalRelease,
  Tender,
  TenderRequirement,
  TenderReviewType,
  TenderStatus,
} from "../types"

const metaClass = "grid gap-1 rounded-xl bg-[var(--app-background)] p-3"
function usePermissions() {
  return useAuthStore((s) => s.user?.permissions ?? [])
}
function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={metaClass}>
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold break-words">{value || "—"}</dd>
    </div>
  )
}
function DetailShell({
  kind,
  title,
  description,
  icon: Icon,
  entity,
  canManage,
  children,
  lifecycle,
}: {
  kind: TechnicalKind
  title: string
  description?: string | null
  icon: typeof PackageOpen
  entity: { id: string }
  canManage: boolean
  children: React.ReactNode
  lifecycle?: React.ReactNode
}) {
  const nav = useNavigate(),
    [editing, setEditing] = useState(false)
  return (
    <EntityListPage>
      <PageHero
        title={title}
        description={description || undefined}
        eyebrow="مرکز فنی"
        icon={Icon}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => nav(`/technical/${kind}`)}>
              بازگشت
            </Button>
            {canManage ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit3 className="size-4" />
                ویرایش
              </Button>
            ) : null}
          </div>
        }
        metadata={lifecycle}
      />
      {children}
      <TechnicalFormDialog
        open={editing}
        onOpenChange={setEditing}
        kind={kind}
        item={entity}
      />
    </EntityListPage>
  )
}

export function TechnicalReleaseDetailPage() {
  const { id } = useParams(),
    q = useTechnicalDetail("releases", id),
    p = usePermissions(),
    transition = useTechnicalTransition("releases")
  return (
    <QueryContent query={q} errorTitle="دریافت انتشار ناموفق بود">
      {q.data ? <ReleaseDetail item={q.data} /> : null}
    </QueryContent>
  )
  function ReleaseDetail({ item }: { item: TechnicalRelease }) {
    const canManage = p.includes("technical-release:manage"),
      canPublish = p.includes("technical-release:publish")
    return (
      <DetailShell
        kind="releases"
        title={item.title}
        description={item.summary}
        icon={PackageOpen}
        entity={item}
        canManage={canManage}
        lifecycle={
          <TechnicalStatusBadge
            status={item.status}
            presentation={releasePresentation}
          />
        }
      >
        <LifecycleActions
          targets={releaseTransitions[item.status]}
          presentation={releasePresentation}
          pending={transition.isPending}
          canTarget={(target: ReleaseStatus) =>
            ["RELEASED", "DEPRECATED", "END_OF_LIFE"].includes(target)
              ? canPublish
              : canManage
          }
          onTransition={async (status, reason) => {
            await transition.mutateAsync({
              id: item.id,
              status,
              revision: item.revision,
              reason,
            })
          }}
        />
        {transition.error ? <TenderTransitionError error={transition.error} /> : null}
        <FormSection title="هویت و چرخه انتشار">
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Meta label="محصول" value={relationName(item.product)} />
            <Meta label="نسخه" value={item.version} />
            <Meta label="تاریخ انتشار" value={faDate(item.releaseDate)} />
            <Meta label="شروع پشتیبانی" value={faDate(item.supportStartDate)} />
            <Meta label="پایان پشتیبانی" value={faDate(item.supportEndDate)} />
            <Meta label="پایان عمر" value={faDate(item.endOfLifeDate)} />
            <Meta label="آخرین تغییر" value={faDate(item.updatedAt)} />
          </dl>
        </FormSection>
        <FormSection title="یادداشت انتشار">
          <Readable value={item.releaseNotes} />
        </FormSection>
      </DetailShell>
    )
  }
}
export function TechnicalKnowledgeDetailPage() {
  const { id } = useParams(),
    q = useTechnicalDetail("knowledge-base", id),
    p = usePermissions(),
    transition = useTechnicalTransition("knowledge-base")
  return (
    <QueryContent query={q} errorTitle="دریافت مقاله ناموفق بود">
      {q.data ? <Knowledge item={q.data} /> : null}
    </QueryContent>
  )
  function Knowledge({ item }: { item: KnowledgeArticle }) {
    const manage = p.includes("technical-knowledge:manage"),
      publish = p.includes("technical-knowledge:publish")
    return (
      <DetailShell
        kind="knowledge-base"
        title={item.title}
        description={item.summary}
        icon={BookOpen}
        entity={item}
        canManage={manage}
        lifecycle={
          <TechnicalStatusBadge
            status={item.status}
            presentation={knowledgePresentation}
          />
        }
      >
        <LifecycleActions
          targets={knowledgeTransitions[item.status]}
          presentation={knowledgePresentation}
          pending={transition.isPending}
          canTarget={(t: KnowledgeStatus) =>
            t === "PUBLISHED" ? publish : manage
          }
          onTransition={async (status, reason) => {
            await transition.mutateAsync({ id: item.id, status, reason })
          }}
        />
        <FormSection title="فراداده مقاله">
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Meta label="دسته‌بندی" value={item.category} />
            <Meta
              label="دسترسی"
              value={item.visibility === "RESTRICTED" ? "محدود" : "داخلی"}
            />
            <Meta label="انتشار" value={faDate(item.publishedAt)} />
            <Meta label="بازبینی بعدی" value={faDate(item.nextReviewAt)} />
            <Meta label="محصول" value={item.productId} />
            <Meta label="انتشار فنی" value={item.releaseId} />
            <Meta label="نویسنده" value={item.authorId} />
            <Meta label="بازبین" value={item.reviewerId} />
          </dl>
        </FormSection>
        <FormSection title="محتوا">
          <Readable value={item.content} />
        </FormSection>
      </DetailShell>
    )
  }
}
export function TechnicalDocumentDetailPage() {
  const { id } = useParams(),
    q = useTechnicalDetail("documents", id),
    p = usePermissions(),
    transition = useTechnicalTransition("documents")
  return (
    <QueryContent query={q} errorTitle="دریافت سند ناموفق بود">
      {q.data ? <Document item={q.data} /> : null}
    </QueryContent>
  )
  function Document({ item }: { item: TechnicalDocument }) {
    const manage = p.includes("technical-document:manage"),
      approve = p.includes("technical-document:approve")
    return (
      <DetailShell
        kind="documents"
        title={item.title}
        description={item.description}
        icon={FileText}
        entity={item}
        canManage={manage}
        lifecycle={
          <TechnicalStatusBadge
            status={item.status}
            presentation={documentPresentation}
          />
        }
      >
        <LifecycleActions
          targets={documentTransitions[item.status]}
          presentation={documentPresentation}
          pending={transition.isPending}
          canTarget={(t: DocumentStatus) =>
            ["APPROVED", "ACTIVE", "SUPERSEDED"].includes(t) ? approve : manage
          }
          onTransition={async (status, reason) => {
            await transition.mutateAsync({
              id: item.id,
              status,
              revision: item.revision,
              reason,
            })
          }}
        />
        <FormSection title="حاکمیت و ارتباطات">
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Meta label="نوع سند" value={item.documentType} />
            <Meta label="محرمانگی" value={item.confidentiality} />
            <Meta label="محصول" value={relationName(item.product)} />
            <Meta label="انتشار" value={relationName(item.release)} />
            <Meta label="شرکت" value={relationName(item.company)} />
            <Meta label="فرصت" value={relationName(item.opportunity)} />
            <Meta label="تاریخ اثر" value={faDate(item.effectiveFrom)} />
            <Meta label="انقضا" value={faDate(item.expiresAt)} />
          </dl>
        </FormSection>
        <TechnicalAttachments
          entityId={item.id}
          entityType="TECHNICAL_DOCUMENT"
          canView={p.includes("attachment:view")}
          canManage={manage && p.includes("attachment:manage")}
        />
        <DocumentVersions item={item} canManage={manage} />
      </DetailShell>
    )
  }
}
function DocumentVersions({
  item,
  canManage,
}: {
  item: TechnicalDocument
  canManage: boolean
}) {
  const [open, setOpen] = useState(false),
    [version, setVersion] = useState(""),
    [attachmentId, setAttachmentId] = useState(""),
    queryClient = useQueryClient()
  return (
    <FormSection
      title="تاریخچه نسخه‌ها"
      actions={
        canManage ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            نسخه جدید
          </Button>
        ) : null
      }
    >
      {item.versions?.length ? (
        <div className="grid gap-2">
          {item.versions.map((v) => (
            <div
              key={v.id}
              className="grid gap-2 rounded-xl border p-3 sm:grid-cols-3"
            >
              <b dir="ltr">{v.version}</b>
              <span>{v.attachmentId ? "دارای پیوست" : "بدون پیوست"}</span>
              <span>{faDate(v.createdAt)}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="نسخه‌ای ثبت نشده"
          description="نسخه‌ها بدون بازنویسی تاریخچه سند ثبت می‌شوند."
        />
      )}
      <ResponsiveModal
        open={open}
        onClose={() => setOpen(false)}
        title="نسخه جدید"
      >
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            await technicalApi.documents.addVersion(item.id, {
              version,
              attachmentId: attachmentId || undefined,
            })
            await queryClient.invalidateQueries({
              queryKey: technicalKeys.detail("documents", item.id),
            })
            setVersion("")
            setAttachmentId("")
            setOpen(false)
          }}
        >
          <label>
            نسخه
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
            />
          </label>
          <label>
            شناسه پیوست موجود
            <Input
              value={attachmentId}
              onChange={(e) => setAttachmentId(e.target.value)}
              dir="ltr"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            پیوست باید قبلاً با زیرساخت پیوست و نوع TECHNICAL_DOCUMENT به همین
            سند متصل شده باشد.
          </p>
          <Button disabled={!version}>ثبت نسخه</Button>
        </form>
      </ResponsiveModal>
    </FormSection>
  )
}
export function TechnicalResourceDetailPage() {
  const { id } = useParams(),
    q = useTechnicalDetail("resources", id),
    p = usePermissions()
  return (
    <QueryContent query={q} errorTitle="دریافت منبع ناموفق بود">
      {q.data ? (
        <DetailShell
          kind="resources"
          title={q.data.title}
          description={q.data.description}
          icon={FolderOpen}
          entity={q.data}
          canManage={p.includes("technical-resource:manage")}
          lifecycle={
            <TechnicalStatusBadge
              status={q.data.status}
              presentation={resourcePresentation}
            />
          }
        >
          <FormSection title="مشخصات منبع">
            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Meta
                label="نوع"
                value={resourceTypeLabels[q.data.resourceType]}
              />
              <Meta label="نسخه" value={q.data.version} />
              <Meta
                label="Checksum"
                value={<span dir="ltr">{q.data.checksum || "—"}</span>}
              />
              <Meta label="محصول" value={q.data.productId} />
              <Meta label="انتشار" value={q.data.releaseId} />
              <Meta label="مالک" value={q.data.ownerId} />
              <Meta label="پیوست" value={q.data.attachmentId} />
              <Meta label="آخرین تغییر" value={faDate(q.data.updatedAt)} />
            </dl>
            {q.data.url ? (
              <a
                className="mt-4 inline-flex text-primary underline"
                href={q.data.url}
                target="_blank"
                rel="noreferrer"
              >
                باز کردن منبع خارجی
              </a>
            ) : null}
          </FormSection>
          <TechnicalAttachments
            entityId={q.data.id}
            entityType="TECHNICAL_RESOURCE"
            canView={p.includes("attachment:view")}
            canManage={
              p.includes("technical-resource:manage") &&
              p.includes("attachment:manage")
            }
          />
        </DetailShell>
      ) : null}
    </QueryContent>
  )
}
export function TechnicalTenderDetailPage() {
  const { id } = useParams(),
    q = useTechnicalDetail("tenders", id),
    p = usePermissions(),
    transition = useTechnicalTransition("tenders")
  return (
    <QueryContent query={q} errorTitle="دریافت مناقصه ناموفق بود">
      {q.data ? <TenderDetail item={q.data} /> : null}
    </QueryContent>
  )
  function TenderDetail({ item }: { item: Tender }) {
    const manage = p.includes("technical-tender:manage"),
      submit = p.includes("technical-tender:submit"),
      close = p.includes("technical-tender:close")
    return (
      <DetailShell
        kind="tenders"
        title={item.title}
        description={item.referenceNumber || item.description}
        icon={Gavel}
        entity={item}
        canManage={manage}
        lifecycle={
          <>
            <TechnicalStatusBadge
              status={item.status}
              presentation={tenderPresentation}
            />
            <span className="text-sm">{tenderTypeLabels[item.tenderType]}</span>
          </>
        }
      >
        <LifecycleActions
          targets={tenderTransitions[item.status]}
          presentation={tenderPresentation}
          pending={transition.isPending}
          canTarget={(t: TenderStatus) =>
            t === "SUBMITTED"
              ? submit
              : ["WON", "LOST", "CANCELLED", "ARCHIVED"].includes(t)
                ? close
                : manage
          }
          requiresReason={(target: TenderStatus) =>
            target === "LOST" ||
            target === "CANCELLED" ||
            (item.status === "TECHNICAL_REVIEW" && target === "PREPARING") ||
            (item.status === "COMMERCIAL_REVIEW" && target === "TECHNICAL_REVIEW") ||
            (item.status === "READY_FOR_SUBMISSION" && target === "COMMERCIAL_REVIEW")
          }
          onTransition={async (status, reason) => {
            await transition.mutateAsync({
              id: item.id,
              status,
              revision: item.revision,
              reason,
            })
          }}
        />
        <FormSection title="نمای کلی و روابط CRM">
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Meta label="شرکت" value={relationName(item.company)} />
            <Meta label="فرصت" value={relationName(item.opportunity)} />
            <Meta label="تیم" value={relationName(item.team)} />
            <Meta label="مالک" value={item.ownerId} />
            <Meta label="مسئول فنی" value={item.technicalLeadId} />
            <Meta label="مسئول تجاری" value={item.commercialLeadId} />
            <Meta
              label="ارزش"
              value={
                item.estimatedValue
                  ? `${Number(item.estimatedValue).toLocaleString("fa-IR")} ${item.currency || ""}`
                  : "—"
              }
            />
            <Meta
              label="احتمال"
              value={
                item.probability == null
                  ? "—"
                  : `${item.probability.toLocaleString("fa-IR")}٪`
              }
            />
          </dl>
          <Readable value={item.description} />
        </FormSection>
        <FormSection title="زمان‌بندی">
          <dl className="grid gap-3 sm:grid-cols-3">
            <Meta label="مهلت ارسال" value={faDate(item.submissionDeadline)} />
            <Meta label="مهلت فنی" value={faDate(item.technicalDeadline)} />
            <Meta
              label="تصمیم مورد انتظار"
              value={faDate(item.expectedDecisionDate)}
            />
          </dl>
        </FormSection>
        <TenderWorkflowPanels tender={item} permissions={p} />
        <Requirements tender={item} canManage={manage} />
        <Deliverables tender={item} canManage={manage} />
      </DetailShell>
    )
  }
}
function TenderTransitionError({ error }: { error: unknown }) {
  const payload = (error as { response?: { data?: { details?: { blockers?: Array<{ code: string; count?: number }> }; message?: string } } })?.response?.data
  const blockers = payload?.details?.blockers
  return <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
    <b>امکان انجام این تغییر وجود ندارد.</b>
    {blockers?.length ? <ul className="mt-2 grid gap-1">{blockers.map((issue) => <li key={issue.code}>• {readinessLabels[issue.code] ?? issue.code}{issue.count ? ` (${issue.count.toLocaleString("fa-IR")})` : ""}</li>)}</ul> : <p className="mt-2">{payload?.message || (error instanceof Error ? error.message : "خطای ناشناخته")}</p>}
  </div>
}
const readinessLabels: Record<string, string> = {
  MANDATORY_REQUIREMENTS_INCOMPLETE: "الزامات الزامی تکمیل نشده‌اند",
  MANDATORY_REQUIREMENTS_UNASSIGNED: "الزامات الزامی بدون مسئول هستند",
  REQUIRED_DELIVERABLES_INCOMPLETE: "اقلام تحویلی الزامی کامل نیستند",
  TECHNICAL_REVIEW_NOT_APPROVED: "بازبینی فنی تأیید نشده است",
  COMMERCIAL_REVIEW_NOT_APPROVED: "بازبینی تجاری تأیید نشده است",
  REQUIRED_TENDER_FIELDS_INCOMPLETE: "اطلاعات ضروری مناقصه ناقص است",
  TENDER_DEADLINE_PASSED: "مهلت ارسال گذشته است",
  REQUIREMENT_DUE_AFTER_SUBMISSION: "مهلت برخی الزامات بعد از مهلت ارسال است",
  REQUIREMENTS_OVERDUE: "برخی الزامات سررسید گذشته‌اند",
}
function tenderEventLabel(action: string) {
  const exact: Record<string, string> = {
    "technical-tender.created": "مناقصه ایجاد شد",
    "technical-tender.updated": "اطلاعات مناقصه ویرایش شد",
    "technical-tender.transitioned": "مرحله گردش کار تغییر کرد",
    "technical-tender.submitted": "مناقصه ارسال شد",
    "technical-tender.won": "مناقصه برنده شد",
    "technical-tender.lost": "مناقصه از دست رفت",
    "technical-tender.cancelled": "مناقصه لغو شد",
    "technical-tender.archived": "مناقصه بایگانی شد",
  }
  if (exact[action]) return exact[action]
  if (action.includes("review-technical-requested")) return "بازبینی فنی درخواست شد"
  if (action.includes("review-commercial-requested")) return "بازبینی تجاری درخواست شد"
  if (action.includes("review-technical-approved")) return "بازبینی فنی تأیید شد"
  if (action.includes("review-commercial-approved")) return "بازبینی تجاری تأیید شد"
  if (action.includes("review-technical-rejected")) return "بازبینی فنی رد شد"
  if (action.includes("review-commercial-rejected")) return "بازبینی تجاری رد شد"
  return action
}
function TenderWorkflowPanels({ tender, permissions }: { tender: Tender; permissions: string[] }) {
  const workflow = useTenderWorkflow(tender.id), mutations = useTenderWorkflowMutations(tender.id)
  const [dialog, setDialog] = useState<{ type: TenderReviewType; reviewId?: string; status?: "APPROVED" | "REJECTED" }>()
  const [comment, setComment] = useState(""), [reviewerId, setReviewerId] = useState(""), [reviewerSearch, setReviewerSearch] = useState("")
  const debouncedReviewerSearch = useDebouncedValue(reviewerSearch, 250)
  const reviewers = useQuery({ queryKey: ["technical-tender-reviewers", debouncedReviewerSearch], queryFn: () => technicalLookups("users", debouncedReviewerSearch), enabled: Boolean(dialog && !dialog.reviewId) })
  const readiness = workflow.readiness.data ?? tender.readiness
  const latest = (type: TenderReviewType) => workflow.reviews.data?.find((r) => r.type === type)
  const reviewLabel: Record<string, string> = { NOT_STARTED: "شروع نشده", PENDING: "در انتظار", APPROVED: "تأیید شده", REJECTED: "رد شده", CANCELLED: "لغو شده" }
  return <>
    <FormSection title="آمادگی ارسال">
      {readiness ? <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]">
        <div className={`rounded-2xl border p-4 ${readiness.overallReady ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20" : "border-amber-300 bg-amber-50/60 dark:bg-amber-950/20"}`}>
          <div className="flex items-center gap-2 font-black">{readiness.overallReady ? <CheckCircle2 className="size-5 text-emerald-600" /> : <AlertTriangle className="size-5 text-amber-600" />}{readiness.overallReady ? "آماده ارسال" : "آماده ارسال نیست"}</div>
          <ul className="mt-3 grid gap-2 text-sm" aria-label="موانع آمادگی ارسال">
            {[...readiness.blockers, ...readiness.warnings].map((issue) => <li key={issue.code} className="flex gap-2"><span aria-hidden>•</span><span>{readinessLabels[issue.code] ?? issue.code}{issue.count ? ` (${issue.count.toLocaleString("fa-IR")})` : ""}</span></li>)}
            {readiness.overallReady ? <li>تمام کنترل‌های الزامی با موفقیت عبور کرده‌اند.</li> : null}
          </ul>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Meta label="الزامات الزامی" value={`${readiness.checks.mandatoryRequirements.satisfied.toLocaleString("fa-IR")} از ${readiness.checks.mandatoryRequirements.total.toLocaleString("fa-IR")}`} />
          <Meta label="الزامات مسدود" value={readiness.checks.requirements.blocked.toLocaleString("fa-IR")} />
          <Meta label="تحویلی کامل" value={`${readiness.checks.deliverables.completedRequired.toLocaleString("fa-IR")} از ${readiness.checks.deliverables.required.toLocaleString("fa-IR")}`} />
          <Meta label="سررسید گذشته" value={readiness.checks.requirements.overdue.toLocaleString("fa-IR")} />
        </dl>
      </div> : <p className="text-sm text-muted-foreground">در حال محاسبه آمادگی…</p>}
    </FormSection>
    <FormSection title="بازبینی‌های فنی و تجاری">
      <div className="grid gap-3 md:grid-cols-2">{(["TECHNICAL", "COMMERCIAL"] as TenderReviewType[]).map((type) => {
        const review = latest(type), allowed = permissions.includes(type === "TECHNICAL" ? "technical-tender:review-technical" : "technical-tender:review-commercial"), inStage = tender.status === (type === "TECHNICAL" ? "TECHNICAL_REVIEW" : "COMMERCIAL_REVIEW")
        return <article key={type} className="rounded-2xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><b>{type === "TECHNICAL" ? "بازبینی فنی" : "بازبینی تجاری"}</b><span className="rounded-full border px-2 py-1 text-xs font-bold">{reviewLabel[review?.status ?? "NOT_STARTED"]}</span></div>
          <dl className="mt-3 grid gap-2 text-sm"><div>بازبین: {relationName(review?.reviewer)}</div><div>درخواست: {faDate(review?.requestedAt)}</div><div>تصمیم: {faDate(review?.reviewedAt)}</div>{review?.comment ? <div>توضیح: {review.comment}</div> : null}</dl>
          {allowed && inStage ? <div className="mt-4 flex flex-wrap gap-2">{!review || review.status !== "PENDING" ? <Button size="sm" variant="outline" onClick={() => { setDialog({ type }); setComment(""); setReviewerId("") }}>درخواست بازبینی</Button> : <><Button size="sm" onClick={() => { setDialog({ type, reviewId: review.id, status: "APPROVED" }); setComment("") }}>تأیید</Button><Button size="sm" variant="destructive" onClick={() => { setDialog({ type, reviewId: review.id, status: "REJECTED" }); setComment("") }}>رد</Button></>}</div> : null}
        </article>
      })}</div>
    </FormSection>
    <FormSection title="تاریخچه گردش کار">
      {workflow.history.data?.length ? <ol className="grid gap-2">{workflow.history.data.map((event) => <li key={event.id} className="flex flex-col gap-1 rounded-xl border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{tenderEventLabel(event.action)}</span><span className="text-muted-foreground">{faDate(event.createdAt)}</span></li>)}</ol> : <p className="text-sm text-muted-foreground">رویدادی ثبت نشده است.</p>}
    </FormSection>
    <ResponsiveModal open={Boolean(dialog)} onClose={() => setDialog(undefined)} title={dialog?.reviewId ? (dialog.status === "APPROVED" ? "تأیید بازبینی" : "رد بازبینی") : "درخواست بازبینی"}>
      <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); if (!dialog) return; if (dialog.reviewId && dialog.status) await mutations.decideReview.mutateAsync({ reviewId: dialog.reviewId, status: dialog.status, comment: comment || undefined, revision: tender.revision }); else await mutations.requestReview.mutateAsync({ type: dialog.type, reviewerId: reviewerId || undefined, comment: comment || undefined, revision: tender.revision }); setDialog(undefined) }}>
        {!dialog?.reviewId ? <label>بازبین<SearchableOptionSelect value={reviewerId} onChange={(value) => setReviewerId(value || "")} options={reviewers.data ?? []} search={reviewerSearch} onSearchChange={setReviewerSearch} loading={reviewers.isLoading || reviewers.isFetching} ariaLabel="بازبین" /></label> : null}
        <label>توضیح<textarea className="min-h-28 w-full rounded-xl border p-3" value={comment} onChange={(e) => setComment(e.target.value)} required={dialog?.status === "REJECTED"} /></label>
        <Button disabled={mutations.requestReview.isPending || mutations.decideReview.isPending || (dialog?.status === "REJECTED" && !comment.trim())}>ثبت تصمیم</Button>
      </form>
    </ResponsiveModal>
  </>
}
function Requirements({
  tender,
  canManage,
}: {
  tender: Tender
  canManage: boolean
}) {
  const q = useRequirements(tender.id),
    m = useRequirementMutations(tender.id),
    [editing, setEditing] = useState<TenderRequirement | null | undefined>(),
    [statusSearch, setStatusSearch] = useState(""),
    [ownerSearch, setOwnerSearch] = useState(""),
    [filterStatus, setFilterStatus] = useState(""),
    [filterStatusSearch, setFilterStatusSearch] = useState(""),
    [filterOwner, setFilterOwner] = useState(""),
    [filterOwnerSearch, setFilterOwnerSearch] = useState(""),
    [filterMandatory, setFilterMandatory] = useState(""),
    [filterMandatorySearch, setFilterMandatorySearch] = useState(""),
    [filterOverdue, setFilterOverdue] = useState(false),
    [filterCategory, setFilterCategory] = useState(""),
    [form, setForm] = useState<RequirementPayload>({
      title: "",
      mandatory: false,
      status: "OPEN",
    })
  const debouncedOwnerSearch = useDebouncedValue(ownerSearch, 250)
  const debouncedFilterOwnerSearch = useDebouncedValue(filterOwnerSearch, 250)
  const owners = useQuery({ queryKey: ["technical-requirement-owners", debouncedOwnerSearch], queryFn: () => technicalLookups("users", debouncedOwnerSearch), enabled: editing !== undefined })
  const filterOwners = useQuery({ queryKey: ["technical-requirement-filter-owners", debouncedFilterOwnerSearch], queryFn: () => technicalLookups("users", debouncedFilterOwnerSearch) })
  const [now] = useState(() => Date.now())
  const visibleRequirements = (q.data ?? []).filter((r) =>
    (!filterStatus || r.status === filterStatus) &&
    (!filterOwner || r.ownerId === filterOwner) &&
    (!filterMandatory || r.mandatory === (filterMandatory === "true")) &&
    (!filterOverdue || (r.status !== "VERIFIED" && Boolean(r.dueDate) && new Date(r.dueDate!).getTime() < now)) &&
    (!filterCategory.trim() || (r.category ?? "").toLocaleLowerCase("fa").includes(filterCategory.trim().toLocaleLowerCase("fa"))),
  )
  function open(item?: TenderRequirement) {
    setEditing(item || null)
    setForm(
      item
        ? {
            title: item.title,
            category: item.category || "",
            description: item.description || "",
            mandatory: item.mandatory,
            ownerId: item.ownerId || "",
            dueDate: item.dueDate?.slice(0, 10) || "",
            response: item.response || "",
            blockedReason: item.blockedReason || "",
            status: item.status,
          }
        : { title: "", mandatory: false, status: "OPEN" }
    )
  }
  return (
    <FormSection
      title="الزامات"
      actions={
        canManage ? (
          <Button size="sm" onClick={() => open()}>
            <Plus className="size-4" />
            الزام جدید
          </Button>
        ) : null
      }
    >
      <QueryContent query={q} errorTitle="دریافت الزامات ناموفق بود">
        {q.data?.length ? (
          <div className="grid gap-3">
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              <Meta label="کل" value={q.data.length.toLocaleString("fa-IR")} />
              <Meta label="الزامی" value={q.data.filter((r) => r.mandatory).length.toLocaleString("fa-IR")} />
              <Meta label="تأییدشده" value={q.data.filter((r) => r.status === "VERIFIED").length.toLocaleString("fa-IR")} />
              <Meta label="در جریان" value={q.data.filter((r) => r.status === "IN_PROGRESS").length.toLocaleString("fa-IR")} />
              <Meta label="مسدود" value={q.data.filter((r) => r.status === "BLOCKED").length.toLocaleString("fa-IR")} />
              <Meta label="بدون مسئول" value={q.data.filter((r) => !r.ownerId).length.toLocaleString("fa-IR")} />
              <Meta label="باز" value={q.data.filter((r) => r.status === "OPEN").length.toLocaleString("fa-IR")} />
              <Meta label="سررسید گذشته" value={q.data.filter((r) => r.status !== "VERIFIED" && r.dueDate && new Date(r.dueDate).getTime() < now).length.toLocaleString("fa-IR")} />
            </dl>
            <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2 xl:grid-cols-5">
              <SearchableOptionSelect value={filterStatus} onChange={(value) => setFilterStatus(value || "")} options={Object.entries(requirementPresentation.label).filter(([, label]) => label.includes(filterStatusSearch.trim())).map(([id, label]) => ({ id, label }))} search={filterStatusSearch} onSearchChange={setFilterStatusSearch} placeholder="همه وضعیت‌ها" ariaLabel="فیلتر وضعیت الزام" />
              <SearchableOptionSelect value={filterOwner} onChange={(value) => setFilterOwner(value || "")} options={filterOwners.data ?? []} search={filterOwnerSearch} onSearchChange={setFilterOwnerSearch} loading={filterOwners.isLoading || filterOwners.isFetching} placeholder="همه مسئولان" ariaLabel="فیلتر مسئول الزام" />
              <SearchableOptionSelect value={filterMandatory} onChange={(value) => setFilterMandatory(value || "")} options={[{ id: "true", label: "فقط الزامی" }, { id: "false", label: "فقط اختیاری" }].filter((option) => option.label.includes(filterMandatorySearch.trim()))} search={filterMandatorySearch} onSearchChange={setFilterMandatorySearch} placeholder="الزامی و اختیاری" ariaLabel="فیلتر الزامی بودن" />
              <Input value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} placeholder="فیلتر دسته‌بندی" aria-label="فیلتر دسته‌بندی الزام" />
              <label className="flex items-center gap-2 rounded-xl border px-3"><input type="checkbox" checked={filterOverdue} onChange={(e) => setFilterOverdue(e.target.checked)} />فقط سررسید گذشته</label>
            </div>
            {visibleRequirements.map((r) => (
              <article
                key={r.id}
                className="grid gap-3 rounded-xl border p-3 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <b>{r.title}</b>
                    {r.mandatory ? (
                      <span className="rounded-full border border-destructive px-2 py-0.5 text-xs font-bold text-destructive">
                        الزامی
                      </span>
                    ) : null}
                    <TechnicalStatusBadge
                      status={r.status}
                      presentation={requirementPresentation}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {r.description || "بدون توضیح"}
                  </p>
                  <div className="mt-2 text-xs">
                    مهلت: {faDate(r.dueDate)} · دسته: {r.category || "—"} · مسئول: {relationName(r.owner)}
                  </div>
                  {r.blockedReason ? <p className="mt-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive">دلیل مسدودی: {r.blockedReason}</p> : null}
                </div>
                {canManage ? (
                  <EntityRowActions
                    actions={[
                      {
                        id: "edit",
                        label: "ویرایش الزام",
                        icon: Plus,
                        onClick: () => open(r),
                      },
                      {
                        id: "delete",
                        label: "حذف الزام",
                        icon: Trash2,
                        tone: "danger",
                        confirmation: {
                          title: "حذف الزام",
                          description: "این الزام حذف شود؟",
                        },
                        onClick: () => m.remove.mutateAsync(r.id),
                      },
                    ]}
                  />
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="الزامی ثبت نشده"
            description="نبود الزام یک وضعیت معتبر است؛ در صورت نیاز اولین الزام را اضافه کنید."
          />
        )}
      </QueryContent>
      <ResponsiveModal
        open={editing !== undefined}
        onClose={() => setEditing(undefined)}
        title={editing ? "ویرایش الزام" : "الزام جدید"}
      >
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            await m.save.mutateAsync({
              payload: form,
              requirementId: editing?.id,
            })
            setEditing(undefined)
          }}
        >
          <label>
            عنوان
            <Input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label>
            دسته‌بندی
            <Input
              value={form.category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </label>
          <label>
            وضعیت
            <SearchableOptionSelect
              value={form.status}
              onChange={(value) =>
                setForm({ ...form, status: (value || "OPEN") as never })
              }
              options={Object.entries(requirementPresentation.label)
                .filter(([, label]) => label.includes(statusSearch.trim()))
                .map(([id, label]) => ({ id, label }))}
              search={statusSearch}
              onSearchChange={setStatusSearch}
              allowEmpty={false}
              ariaLabel="وضعیت الزام"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.mandatory}
              onChange={(e) =>
                setForm({ ...form, mandatory: e.target.checked })
              }
            />
            الزامی است
          </label>
          <label>
            مسئول
            <SearchableOptionSelect value={form.ownerId || ""} onChange={(value) => setForm({ ...form, ownerId: value || "" })} options={owners.data ?? []} search={ownerSearch} onSearchChange={setOwnerSearch} loading={owners.isLoading || owners.isFetching} placeholder="انتخاب مسئول" ariaLabel="مسئول الزام" />
          </label>
          <label>
            مهلت
            <PersianDatePicker
              value={
                form.dueDate
                  ? new Date(`${form.dueDate.slice(0, 10)}T12:00:00`)
                  : undefined
              }
              onChange={(date) =>
                setForm({
                  ...form,
                  dueDate: date
                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                    : "",
                })
              }
            />
          </label>
          <label>
            پاسخ
            <textarea
              className="min-h-28 rounded-xl border p-3"
              value={form.response || ""}
              onChange={(e) => setForm({ ...form, response: e.target.value })}
            />
          </label>
          {form.status === "BLOCKED" ? <label>دلیل مسدودی<textarea className="min-h-24 w-full rounded-xl border p-3" required value={form.blockedReason || ""} onChange={(e) => setForm({ ...form, blockedReason: e.target.value })} /></label> : null}
          <Button disabled={!form.title || m.save.isPending}>
            ذخیره الزام
          </Button>
        </form>
      </ResponsiveModal>
    </FormSection>
  )
}
function Deliverables({
  tender,
  canManage,
}: {
  tender: Tender
  canManage: boolean
}) {
  const m = useRequirementMutations(tender.id),
    [documentId, setDocumentId] = useState(""),
    [label, setLabel] = useState(""),
    [required, setRequired] = useState(true),
    [open, setOpen] = useState(false),
    [documentSearch, setDocumentSearch] = useState("")
  const debouncedDocumentSearch = useDebouncedValue(documentSearch, 250)
  const documents = useQuery({
    queryKey: ["technical-deliverable-documents", debouncedDocumentSearch],
    queryFn: () => technicalLookups("documents", debouncedDocumentSearch),
    enabled: open,
  })
  return (
    <FormSection
      title="اقلام تحویلی"
      actions={
        canManage ? (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            اتصال سند
          </Button>
        ) : null
      }
    >
      {tender.deliverables?.length ? (
        <div className="grid gap-2">
          {tender.deliverables.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <b>{d.label || relationName(d.document)}</b>
                  <span className="rounded-full border px-2 py-0.5 text-xs font-bold">{d.required ? "الزامی" : "اختیاری"}</span>
                  {(() => { const complete = ["APPROVED", "ACTIVE"].includes(d.document?.status || "") && Boolean(d.document?.versions?.some((version) => version.attachmentId)); return <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${complete ? "text-emerald-700" : "text-amber-700"}`}>{complete ? "کامل" : "ناقص"}</span> })()}
                </div>
                <div className="text-xs text-muted-foreground">
                  سند فنی: {relationName(d.document)}
                </div>
              </div>
              {canManage ? (
                <EntityRowActions
                  actions={[
                    {
                      id: "remove",
                      label: "حذف اتصال",
                      icon: Trash2,
                      tone: "danger",
                      confirmation: {
                        title: "حذف قلم تحویلی",
                        description: "اتصال این سند حذف شود؟",
                      },
                      onClick: () => m.removeDeliverable.mutateAsync(d.id),
                    },
                  ]}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="قلم تحویلی ثبت نشده"
          description="سندهای فنی موجود را به مناقصه متصل کنید؛ محتوا کپی نمی‌شود."
        />
      )}
      <ResponsiveModal
        open={open}
        onClose={() => setOpen(false)}
        title="اتصال سند فنی"
      >
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            await m.deliver.mutateAsync({
              documentId,
              label: label || undefined,
              required,
            })
            setOpen(false)
          }}
        >
          <label>
            سند
            <SearchableOptionSelect
              value={documentId}
              onChange={(value) => setDocumentId(value || "")}
              options={documents.data ?? []}
              search={documentSearch}
              onSearchChange={setDocumentSearch}
              loading={documents.isLoading || documents.isFetching}
              emptyText={
                documents.isError ? "دریافت اسناد انجام نشد." : undefined
              }
              allowEmpty={false}
              ariaLabel="سند فنی"
            />
          </label>
          <label>
            عنوان تحویل
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />قلم تحویلی الزامی است</label>
          <Button disabled={!documentId || m.deliver.isPending}>اتصال</Button>
        </form>
      </ResponsiveModal>
    </FormSection>
  )
}
function Readable({ value }: { value?: string | null }) {
  return value ? (
    <div className="mt-3 text-sm leading-8 whitespace-pre-wrap">{value}</div>
  ) : (
    <p className="text-sm text-muted-foreground">محتوایی ثبت نشده است.</p>
  )
}
