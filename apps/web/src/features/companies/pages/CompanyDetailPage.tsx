import {
  ArrowRight,
  Building2,
  CalendarClock,
  CircleDollarSign,
  ExternalLink,
  FileText,
  ListTodo,
  MapPin,
  Pencil,
  Phone,
  Share2,
  UsersRound,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { Company360PaginatedSection } from "../components/Company360PaginatedSection"
import { CompanyAvatar } from "../components/CompanyAvatar"
import { CompanyFormDialog } from "../components/CompanyFormDialog"
import { CompanyInfoGrid } from "../components/CompanyInfoGrid"
import { CompanyMetricCard } from "../components/CompanyMetricCard"
import { CompanyPriorityBadge } from "../components/CompanyPriorityBadge"
import { CompanyTimeline } from "../components/CompanyTimeline"
import { useCompany } from "../hooks/useCompanies"
import { useCompany360Overview } from "../hooks/useCompany360"
import {
  useCompanyActivities,
  useCompanyBranches,
  useCompanyLegalDocuments,
  useCompanyMeetings,
  useCompanySocialChannels,
  useCompanyTasks,
} from "../hooks/useCompany360Sections"
import { useUpdateCompany } from "../hooks/useCompanyMutations"
import {
  activityStatusLabel,
  companyDisplayName,
  formatCompanyDate,
  formatCompanyDateTime,
  formatCompanyNumber,
  opportunityTitle,
  personName,
} from "../utils/companyFormatters"

const SECTION_PAGE_SIZE = 5

export function CompanyDetailPage() {
  const text = uiText.companies.detail
  const navigate = useNavigate()
  const { companyId = "" } = useParams<{ companyId: string }>()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const [editOpen, setEditOpen] = useState(false)

  const [taskPage, setTaskPage] = useState(1)
  const [meetingPage, setMeetingPage] = useState(1)
  const [activityPage, setActivityPage] = useState(1)
  const [branchPage, setBranchPage] = useState(1)
  const [socialPage, setSocialPage] = useState(1)
  const [documentPage, setDocumentPage] = useState(1)

  const canViewTasks = permissions.includes("task:view")
  const canViewMeetings = permissions.includes("meeting:view")
  const canViewActivities = permissions.includes("activity:view")

  const query = useCompany(companyId)
  const overviewQuery = useCompany360Overview(companyId)
  const updateMutation = useUpdateCompany(companyId)

  const tasksQuery = useCompanyTasks(
    companyId,
    taskPage,
    SECTION_PAGE_SIZE,
    canViewTasks,
  )
  const meetingsQuery = useCompanyMeetings(
    companyId,
    meetingPage,
    SECTION_PAGE_SIZE,
    canViewMeetings,
  )
  const activitiesQuery = useCompanyActivities(
    companyId,
    activityPage,
    SECTION_PAGE_SIZE,
    canViewActivities,
  )
  const branchesQuery = useCompanyBranches(
    companyId,
    branchPage,
    SECTION_PAGE_SIZE,
  )
  const socialQuery = useCompanySocialChannels(
    companyId,
    socialPage,
    SECTION_PAGE_SIZE,
  )
  const documentsQuery = useCompanyLegalDocuments(
    companyId,
    documentPage,
    SECTION_PAGE_SIZE,
  )

  if (query.isLoading) return <LoadingState />

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title={text.errorTitle}
        description={text.errorDescription}
        retryLabel={uiText.common.retry}
        onRetry={() => void query.refetch()}
      />
    )
  }

  const company = query.data
  const displayName = companyDisplayName(company.legalName, company.brandName)
  const opportunities = company.opportunities ?? []
  const people = company.people ?? []
  const embeddedActivities = company.activities ?? []

  const activeOpportunities = opportunities.filter(
    (item) => !item.stage?.isTerminal,
  )

  const lastActivity =
    embeddedActivities[0]?.occurredAt ||
    embeddedActivities[0]?.activityDate ||
    embeddedActivities[0]?.createdAt ||
    null

  const pipelineValue = activeOpportunities.reduce((sum, item) => {
    const value = Number(item.amount ?? item.estimatedValue ?? 0)
    return Number.isFinite(value) ? sum + value : sum
  }, 0)

  const websiteHref = company.website
    ? /^https?:\/\//i.test(company.website)
      ? company.website
      : `https://${company.website}`
    : null

  const overview = overviewQuery.data?.summary
  const openOpportunityCount =
    overview?.openOpportunityCount ?? activeOpportunities.length
  const peopleCount = overview?.peopleCount ?? people.length
  const activeTaskCount = overview?.activeTaskCount ?? 0
  const upcomingMeetingCount = overview?.upcomingMeetingCount ?? 0

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <div className="relative overflow-hidden px-5 py-5 sm:px-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--app-primary)]" />
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <CompanyAvatar name={displayName} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-bold text-[var(--app-heading)] sm:text-2xl">
                    {displayName}
                  </h1>
                  {company.archivedAt ? (
                    <StatusBadge tone="warning">{text.archived}</StatusBadge>
                  ) : (
                    <StatusBadge tone="success">{text.active}</StatusBadge>
                  )}
                  <CompanyPriorityBadge priority={company.priority} />
                </div>

                {company.brandName && company.brandName !== company.legalName ? (
                  <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                    {company.legalName}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[var(--app-text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {company.industryRef?.name ||
                      company.industry ||
                      text.notSpecified}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UsersRound className="size-3.5" />
                    {company.owner?.fullName || text.unassigned}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {company.headOfficeCity || text.notSpecified}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {permissions.includes("company:update") && !company.archivedAt ? (
                <Button
                  type="button"
                  className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  {text.edit}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate("/companies")}
              >
                <ArrowRight className="size-4" />
                {text.back}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <CompanyMetricCard
          icon={CircleDollarSign}
          label={text.metrics.pipelineValue}
          value={formatCompanyNumber(pipelineValue)}
          hint={text.metrics.pipelineHint}
        />
        <CompanyMetricCard
          icon={Building2}
          label={text.metrics.openOpportunities}
          value={formatCompanyNumber(openOpportunityCount)}
        />
        <CompanyMetricCard
          icon={UsersRound}
          label={text.metrics.people}
          value={formatCompanyNumber(peopleCount)}
        />
        <CompanyMetricCard
          icon={ListTodo}
          label={uiText.navigation.tasks}
          value={formatCompanyNumber(activeTaskCount)}
        />
        <CompanyMetricCard
          icon={CalendarClock}
          label={uiText.navigation.meetings}
          value={formatCompanyNumber(upcomingMeetingCount)}
        />
        <CompanyMetricCard
          icon={CalendarClock}
          label={text.metrics.lastInteraction}
          value={formatCompanyDate(lastActivity)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="grid gap-5">
          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.overview}</h2>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.sections.overviewDescription}
              </p>
            </div>

            <CompanyInfoGrid
              items={[
                { label: text.fields.legalName, value: company.legalName },
                {
                  label: text.fields.brandName,
                  value: company.brandName || text.notSpecified,
                },
                {
                  label: text.fields.industry,
                  value:
                    company.industryRef?.name ||
                    company.industry ||
                    text.notSpecified,
                },
                {
                  label: text.fields.owner,
                  value: company.owner?.fullName || text.unassigned,
                },
                {
                  label: text.fields.team,
                  value: company.owner?.team || text.notSpecified,
                },
                {
                  label: text.fields.city,
                  value: company.headOfficeCity || text.notSpecified,
                },
                {
                  label: text.fields.phone,
                  value: company.centralPhone ? (
                    <a
                      href={`tel:${company.centralPhone}`}
                      dir="ltr"
                      className="inline-flex items-center gap-1.5 text-[var(--app-primary)]"
                    >
                      <Phone className="size-3.5" />
                      {company.centralPhone}
                    </a>
                  ) : (
                    text.notSpecified
                  ),
                },
                {
                  label: text.fields.website,
                  value: websiteHref ? (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[var(--app-primary)]"
                    >
                      {company.website}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : (
                    text.notSpecified
                  ),
                },
                {
                  label: text.fields.source,
                  value:
                    company.sourceRef?.name ||
                    company.source ||
                    text.notSpecified,
                },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.opportunities}</h2>
              <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                {text.sections.opportunitiesDescription}
              </p>
            </div>

            {opportunities.length ? (
              <div className="grid gap-2.5">
                {opportunities.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--app-heading)]">
                        {opportunityTitle(item)}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
                        {item.stage?.label ||
                          item.stage?.name ||
                          item.stage?.code ||
                          text.notSpecified}
                      </p>
                    </div>
                    <div className="text-start sm:text-end">
                      <p className="text-sm font-bold text-[var(--app-heading)]">
                        {formatCompanyNumber(
                          item.amount ?? item.estimatedValue ?? null,
                        )}
                      </p>
                      <p className="mt-1 text-[10px] text-[var(--app-text-secondary)]">
                        {item.owner?.fullName || text.unassigned}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title={text.empty.opportunitiesTitle}
                description={text.empty.opportunitiesDescription}
              />
            )}
          </SurfaceCard>

          {canViewTasks ? (
            <Company360PaginatedSection
              title={uiText.navigation.tasks}
              total={tasksQuery.data?.meta.total}
              page={tasksQuery.data?.meta.page ?? taskPage}
              totalPages={tasksQuery.data?.meta.totalPages}
              isLoading={tasksQuery.isLoading}
              isError={tasksQuery.isError}
              onPrevious={() => setTaskPage((value) => Math.max(1, value - 1))}
              onNext={() => setTaskPage((value) => value + 1)}
            >
              <div className="grid gap-2.5">
                {tasksQuery.data?.data.length ? (
                  tasksQuery.data.data.map((task) => (
                    <EntityRow
                      key={task.id}
                      icon={<ListTodo className="size-4" />}
                      title={task.title}
                      subtitle={
                        task.assignedTo?.fullName ||
                        task.status ||
                        text.notSpecified
                      }
                      meta={formatCompanyDateTime(task.dueAt)}
                    />
                  ))
                ) : (
                  <SectionEmpty />
                )}
              </div>
            </Company360PaginatedSection>
          ) : null}

          {canViewMeetings ? (
            <Company360PaginatedSection
              title={uiText.navigation.meetings}
              total={meetingsQuery.data?.meta.total}
              page={meetingsQuery.data?.meta.page ?? meetingPage}
              totalPages={meetingsQuery.data?.meta.totalPages}
              isLoading={meetingsQuery.isLoading}
              isError={meetingsQuery.isError}
              onPrevious={() =>
                setMeetingPage((value) => Math.max(1, value - 1))
              }
              onNext={() => setMeetingPage((value) => value + 1)}
            >
              <div className="grid gap-2.5">
                {meetingsQuery.data?.data.length ? (
                  meetingsQuery.data.data.map((meeting) => (
                    <EntityRow
                      key={meeting.id}
                      icon={<CalendarClock className="size-4" />}
                      title={meeting.title}
                      subtitle={
                        meeting.organizer?.fullName ||
                        meeting.mode ||
                        text.notSpecified
                      }
                      meta={formatCompanyDateTime(meeting.startAt)}
                    />
                  ))
                ) : (
                  <SectionEmpty />
                )}
              </div>
            </Company360PaginatedSection>
          ) : null}

          {canViewActivities ? (
            <Company360PaginatedSection
              title={uiText.navigation.activities}
              total={activitiesQuery.data?.meta.total}
              page={activitiesQuery.data?.meta.page ?? activityPage}
              totalPages={activitiesQuery.data?.meta.totalPages}
              isLoading={activitiesQuery.isLoading}
              isError={activitiesQuery.isError}
              onPrevious={() =>
                setActivityPage((value) => Math.max(1, value - 1))
              }
              onNext={() => setActivityPage((value) => value + 1)}
            >
              {activitiesQuery.data?.data.length ? (
                <CompanyTimeline activities={activitiesQuery.data.data} />
              ) : (
                <SectionEmpty />
              )}
            </Company360PaginatedSection>
          ) : null}

          <Company360PaginatedSection
            title={text.ecosystem.legalDocuments}
            total={documentsQuery.data?.meta.total}
            page={documentsQuery.data?.meta.page ?? documentPage}
            totalPages={documentsQuery.data?.meta.totalPages}
            isLoading={documentsQuery.isLoading}
            isError={documentsQuery.isError}
            onPrevious={() =>
              setDocumentPage((value) => Math.max(1, value - 1))
            }
            onNext={() => setDocumentPage((value) => value + 1)}
          >
            <div className="grid gap-2.5">
              {documentsQuery.data?.data.length ? (
                documentsQuery.data.data.map((document) => (
                  <EntityRow
                    key={document.id}
                    icon={<FileText className="size-4" />}
                    title={document.title || document.type || text.notSpecified}
                    subtitle={document.type || text.notSpecified}
                    meta={formatCompanyDate(
                      document.documentDate || document.createdAt,
                    )}
                  />
                ))
              ) : (
                <SectionEmpty />
              )}
            </div>
          </Company360PaginatedSection>
        </div>

        <div className="grid content-start gap-5">
          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="ui-section-title">{text.sections.people}</h2>
                <p className="mt-1 text-xs text-[var(--app-text-secondary)]">
                  {text.sections.peopleDescription}
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--app-primary)]">
                {formatCompanyNumber(peopleCount)}
              </span>
            </div>

            {people.length ? (
              <div className="grid gap-2.5">
                {people.slice(0, 6).map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 rounded-2xl bg-[var(--app-background)]/55 p-3"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">
                      {personName(person).slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[var(--app-heading)]">
                        {personName(person)}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">
                        {person.jobTitle ||
                          person.title ||
                          person.department ||
                          text.notSpecified}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={UsersRound}
                title={text.empty.peopleTitle}
                description={text.empty.peopleDescription}
              />
            )}
          </SurfaceCard>

          <Company360PaginatedSection
            title={text.ecosystem.branches}
            total={branchesQuery.data?.meta.total}
            page={branchesQuery.data?.meta.page ?? branchPage}
            totalPages={branchesQuery.data?.meta.totalPages}
            isLoading={branchesQuery.isLoading}
            isError={branchesQuery.isError}
            onPrevious={() =>
              setBranchPage((value) => Math.max(1, value - 1))
            }
            onNext={() => setBranchPage((value) => value + 1)}
          >
            <div className="grid gap-2.5">
              {branchesQuery.data?.data.length ? (
                branchesQuery.data.data.map((branch) => (
                  <EntityRow
                    key={branch.id}
                    icon={<MapPin className="size-4" />}
                    title={branch.name || branch.city || text.notSpecified}
                    subtitle={branch.address || branch.city || text.notSpecified}
                    meta={branch.phone || undefined}
                  />
                ))
              ) : (
                <SectionEmpty />
              )}
            </div>
          </Company360PaginatedSection>

          <Company360PaginatedSection
            title={text.ecosystem.social}
            total={socialQuery.data?.meta.total}
            page={socialQuery.data?.meta.page ?? socialPage}
            totalPages={socialQuery.data?.meta.totalPages}
            isLoading={socialQuery.isLoading}
            isError={socialQuery.isError}
            onPrevious={() =>
              setSocialPage((value) => Math.max(1, value - 1))
            }
            onNext={() => setSocialPage((value) => value + 1)}
          >
            <div className="grid gap-2.5">
              {socialQuery.data?.data.length ? (
                socialQuery.data.data.map((channel) => (
                  <EntityRow
                    key={channel.id}
                    icon={<Share2 className="size-4" />}
                    title={channel.platform || text.notSpecified}
                    subtitle={channel.handle || text.notSpecified}
                  />
                ))
              ) : (
                <SectionEmpty />
              )}
            </div>
          </Company360PaginatedSection>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.legal}</h2>
            </div>
            <CompanyInfoGrid
              items={[
                {
                  label: text.fields.registrationNumber,
                  value: company.registrationNumber || text.notSpecified,
                },
                {
                  label: text.fields.nationalId,
                  value: company.nationalId || text.notSpecified,
                },
                {
                  label: text.fields.economicCode,
                  value: company.economicCode || text.notSpecified,
                },
                {
                  label: text.fields.establishmentDate,
                  value: formatCompanyDate(company.establishmentDate),
                },
                {
                  label: text.fields.activityStatus,
                  value: company.activityStatus
                    ? activityStatusLabel[company.activityStatus]
                    : text.notSpecified,
                },
                {
                  label: text.fields.employeeCount,
                  value: formatCompanyNumber(company.employeeCount),
                },
                {
                  label: text.fields.registeredCapital,
                  value: formatCompanyNumber(company.registeredCapital),
                },
                {
                  label: text.fields.createdAt,
                  value: formatCompanyDateTime(company.createdAt),
                },
                {
                  label: text.fields.updatedAt,
                  value: formatCompanyDateTime(company.updatedAt),
                },
              ]}
            />
          </SurfaceCard>
        </div>
      </div>

      <CompanyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        company={company}
        isPending={updateMutation.isPending}
        submitError={updateMutation.error}
        onSubmit={async (payload) => {
          await updateMutation.mutateAsync(payload)
          setEditOpen(false)
        }}
      />
    </div>
  )
}

function EntityRow({
  icon,
  title,
  subtitle,
  meta,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  meta?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3.5">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[var(--app-heading)]">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {meta ? (
        <span
          dir="auto"
          className="shrink-0 text-[10px] text-[var(--app-text-secondary)]"
        >
          {meta}
        </span>
      ) : null}
    </div>
  )
}

function SectionEmpty() {
  return (
    <p className="rounded-2xl bg-[var(--app-background)]/55 p-4 text-center text-xs text-[var(--app-text-secondary)]">
      {uiText.companies.detail.notSpecified}
    </p>
  )
}
