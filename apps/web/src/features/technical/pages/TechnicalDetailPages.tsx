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
        <Requirements tender={item} canManage={manage} />
        <Deliverables tender={item} canManage={manage} />
      </DetailShell>
    )
  }
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
    [form, setForm] = useState<RequirementPayload>({
      title: "",
      mandatory: false,
      status: "OPEN",
    })
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
          <div className="grid gap-2">
            {q.data.map((r) => (
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
                    مهلت: {faDate(r.dueDate)} · دسته: {r.category || "—"}
                  </div>
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
                <b>{d.label || relationName(d.document)}</b>
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
