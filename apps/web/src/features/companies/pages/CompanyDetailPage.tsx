import {
  Archive,
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
  Star,
  UserRoundCog,
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
import { Person360WorkspaceDialog } from "@/features/people/components/Person360WorkspaceDialog"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { ArchiveCompanyDialog } from "../components/ArchiveCompanyDialog"
import { ChangeCompanyOwnerDialog } from "../components/ChangeCompanyOwnerDialog"
import { Company360ActionSection } from "../components/Company360ActionSection"
import { CompanyAvatar } from "../components/CompanyAvatar"
import { CompanyFormDialog } from "../components/CompanyFormDialog"
import { CompanyInfoGrid } from "../components/CompanyInfoGrid"
import { CompanyMetricCard } from "../components/CompanyMetricCard"
import { CompanyPriorityBadge } from "../components/CompanyPriorityBadge"
import {
  EntityQuickViewDialog,
  type QuickViewField,
} from "../components/EntityQuickViewDialog"
import { useCompany } from "../hooks/useCompanies"
import { useCompany360Overview } from "../hooks/useCompany360"
import {
  type CompanyActivityItem,
  type CompanyBranch,
  type CompanyLegalDocument,
  type CompanyMeeting,
  type CompanyOpportunityItem,
  type CompanySocialChannel,
  type CompanyTask,
  useCompanyActivities,
  useCompanyBranches,
  useCompanyLegalDocuments,
  useCompanyMeetings,
  useCompanyOpportunities,
  useCompanyPeople,
  useCompanySocialChannels,
  useCompanyTasks,
} from "../hooks/useCompany360Sections"
import { useUpdateCompany } from "../hooks/useCompanyMutations"
import { getActivityTypeLabel } from "../utils/activityTypeLabels"
import {
  activityStatusLabel,
  companyDisplayName,
  formatCompanyDate,
  formatCompanyDateTime,
  formatCompanyNumber,
} from "../utils/companyFormatters"

const SECTION_PAGE_SIZE = 12

type QuickViewState =
  | { kind: "opportunity"; item: CompanyOpportunityItem }
  | { kind: "task"; item: CompanyTask }
  | { kind: "meeting"; item: CompanyMeeting }
  | { kind: "activity"; item: CompanyActivityItem }
  | { kind: "branch"; item: CompanyBranch }
  | { kind: "social"; item: CompanySocialChannel }
  | { kind: "document"; item: CompanyLegalDocument }
  | null

export function CompanyDetailPage() {
  const text = uiText.companies.detail
  const navigate = useNavigate()
  const { companyId = "" } = useParams<{ companyId: string }>()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])

  const [editOpen, setEditOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [quickView, setQuickView] = useState<QuickViewState>(null)

  const canViewPeople = permissions.includes("person:view")
  const canViewOpportunities = permissions.includes("opportunity:view")
  const canViewTasks = permissions.includes("task:view")
  const canViewMeetings = permissions.includes("meeting:view")
  const canViewActivities = permissions.includes("activity:view")

  const query = useCompany(companyId)
  const overviewQuery = useCompany360Overview(companyId)
  const updateMutation = useUpdateCompany(companyId)

  const peopleQuery = useCompanyPeople(companyId, 1, SECTION_PAGE_SIZE, canViewPeople)
  const opportunitiesQuery = useCompanyOpportunities(companyId, 1, SECTION_PAGE_SIZE, canViewOpportunities)
  const tasksQuery = useCompanyTasks(companyId, 1, SECTION_PAGE_SIZE, canViewTasks)
  const meetingsQuery = useCompanyMeetings(companyId, 1, SECTION_PAGE_SIZE, canViewMeetings)
  const activitiesQuery = useCompanyActivities(companyId, 1, SECTION_PAGE_SIZE, canViewActivities)
  const branchesQuery = useCompanyBranches(companyId, 1, SECTION_PAGE_SIZE)
  const socialQuery = useCompanySocialChannels(companyId, 1, SECTION_PAGE_SIZE)
  const documentsQuery = useCompanyLegalDocuments(companyId, 1, SECTION_PAGE_SIZE)

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
  const opportunityRows = opportunitiesQuery.data?.data ?? []
  const activeOpportunities = opportunityRows.filter((item) => !item.stage?.isTerminal)
  const pipelineValue = activeOpportunities.reduce((sum, item) => {
    const value = Number(item.estimatedValue ?? item.amount ?? 0)
    return Number.isFinite(value) ? sum + value : sum
  }, 0)

  const lastActivity =
    company.activities?.[0]?.occurredAt ||
    company.activities?.[0]?.activityDate ||
    company.activities?.[0]?.createdAt ||
    null

  const websiteHref = company.website
    ? /^https?:\/\//i.test(company.website)
      ? company.website
      : `https://${company.website}`
    : null

  const overview = overviewQuery.data?.summary
  const peopleCount = overview?.peopleCount ?? peopleQuery.data?.meta.total ?? 0
  const activeTaskCount = overview?.activeTaskCount ?? tasksQuery.data?.meta.total ?? 0
  const upcomingMeetingCount = overview?.upcomingMeetingCount ?? meetingsQuery.data?.meta.total ?? 0
  const openOpportunityCount =
    overview?.openOpportunityCount ?? opportunitiesQuery.data?.meta.total ?? activeOpportunities.length

  function goToModule(path: string) {
    navigate(`${path}?companyId=${encodeURIComponent(companyId)}`)
  }

  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        <div className="pointer-events-none absolute -start-16 -top-20 size-52 rounded-full bg-[var(--app-primary-soft)]/75 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-[var(--app-primary)] via-[var(--app-info)] to-[var(--app-primary-soft)]" />
        <div className="relative px-5 py-5 sm:px-6">
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
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[var(--app-text-secondary)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5" />
                    {company.industryRef?.name || company.industry || text.notSpecified}
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
              {permissions.includes("company:update") ? (
                <Button
                  type="button"
                  className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  {text.edit}
                </Button>
              ) : null}

              {permissions.includes("company:change-owner") ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setOwnerOpen(true)}
                >
                  <UserRoundCog className="size-4" />
                  {text.fields.owner}
                </Button>
              ) : null}

              {(!company.archivedAt && permissions.includes("company:archive")) ||
              (company.archivedAt && permissions.includes("company:restore")) ? (
                <Button
                  type="button"
                  variant="outline"
                  className={[
                    "rounded-xl",
                    company.archivedAt
                      ? ""
                      : "border-[var(--destructive)]/30 text-[var(--destructive)] hover:bg-[var(--destructive-soft)]",
                  ].join(" ")}
                  onClick={() => setArchiveOpen(true)}
                >
                  <Archive className="size-4" />
                  {company.archivedAt ? text.active : text.archived}
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
        <CompanyMetricCard icon={CircleDollarSign} label={text.metrics.pipelineValue} value={formatCompanyNumber(pipelineValue)} hint={text.metrics.pipelineHint} />
        <CompanyMetricCard icon={Building2} label={text.metrics.openOpportunities} value={formatCompanyNumber(openOpportunityCount)} />
        <CompanyMetricCard icon={UsersRound} label={text.metrics.people} value={formatCompanyNumber(peopleCount)} />
        <CompanyMetricCard icon={ListTodo} label={uiText.navigation.tasks} value={formatCompanyNumber(activeTaskCount)} />
        <CompanyMetricCard icon={CalendarClock} label={uiText.navigation.meetings} value={formatCompanyNumber(upcomingMeetingCount)} />
        <CompanyMetricCard icon={CalendarClock} label={text.metrics.lastInteraction} value={formatCompanyDate(lastActivity)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.65fr)]">
        <div className="grid content-start gap-5">
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
                { label: text.fields.brandName, value: company.brandName || text.notSpecified },
                { label: text.fields.industry, value: company.industryRef?.name || company.industry || text.notSpecified },
                { label: text.fields.owner, value: company.owner?.fullName || text.unassigned },
                { label: text.fields.city, value: company.headOfficeCity || text.notSpecified },
                {
                  label: text.fields.phone,
                  value: company.centralPhone ? (
                    <a href={`tel:${company.centralPhone}`} dir="ltr" className="inline-flex items-center gap-1.5 text-[var(--app-primary)]">
                      <Phone className="size-3.5" />
                      {company.centralPhone}
                    </a>
                  ) : text.notSpecified,
                },
                {
                  label: text.fields.website,
                  value: websiteHref ? (
                    <a href={websiteHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[var(--app-primary)]">
                      {company.website}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : text.notSpecified,
                },
                { label: text.fields.source, value: company.sourceRef?.name || company.source || text.notSpecified },
              ]}
            />
          </SurfaceCard>

          <SurfaceCard className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="ui-section-title">{text.sections.legal}</h2>
            </div>
            <CompanyInfoGrid
              items={[
                { label: text.fields.registrationNumber, value: company.registrationNumber || text.notSpecified },
                { label: text.fields.nationalId, value: company.nationalId || text.notSpecified },
                { label: text.fields.economicCode, value: company.economicCode || text.notSpecified },
                { label: text.fields.establishmentDate, value: formatCompanyDate(company.establishmentDate) },
                { label: text.fields.activityStatus, value: company.activityStatus ? activityStatusLabel[company.activityStatus] : text.notSpecified },
                { label: text.fields.employeeCount, value: formatCompanyNumber(company.employeeCount) },
                { label: text.fields.registeredCapital, value: formatCompanyNumber(company.registeredCapital) },
                { label: text.fields.updatedAt, value: formatCompanyDateTime(company.updatedAt) },
              ]}
            />
          </SurfaceCard>

          {canViewOpportunities ? (
            <Company360ActionSection
              title={text.sections.opportunities}
              description={text.sections.opportunitiesDescription}
              count={opportunitiesQuery.data?.meta.total ?? 0}
              icon={<CircleDollarSign className="size-5" />}
              onViewAll={() => goToModule("/opportunities")}
            >
              {opportunitiesQuery.isLoading ? <SectionLoading /> : opportunityRows.length ? (
                <div className="grid gap-2.5">
                  {opportunityRows.map((item) => (
                    <button key={item.id} type="button" className="w-full text-start" onClick={() => setQuickView({ kind: "opportunity", item })}>
                      <EntityRow
                        icon={<Building2 className="size-4" />}
                        title={item.title}
                        subtitle={item.owner?.fullName ?? undefined}
                        meta={formatCompanyNumber(item.estimatedValue ?? item.amount ?? null)}
                        badge={item.stage?.label || item.stage?.code}
                        badgeColor={item.stage?.color}
                      />
                    </button>
                  ))}
                </div>
              ) : <SectionEmpty />}
            </Company360ActionSection>
          ) : null}

          {canViewActivities ? (
            <Company360ActionSection
              title={uiText.navigation.activities}
              count={activitiesQuery.data?.meta.total ?? 0}
              icon={<CalendarClock className="size-5" />}
              contentClassName="max-h-[476px]"
              onViewAll={() => goToModule("/activities")}
            >
              {activitiesQuery.isLoading ? <SectionLoading count={6} /> : activitiesQuery.data?.data.length ? (
                <div className="grid gap-2.5">
                  {activitiesQuery.data.data.map((activity) => (
                    <button key={activity.id} type="button" className="w-full text-start" onClick={() => setQuickView({ kind: "activity", item: activity })}>
                      <EntityRow
                        icon={<CalendarClock className="size-4" />}
                        title={getActivityTypeLabel(activity.type)}
                        subtitle={activity.createdBy?.fullName || activity.person?.fullName || undefined}
                        meta={formatCompanyDateTime(activity.activityDate || activity.occurredAt || activity.createdAt)}
                      />
                    </button>
                  ))}
                </div>
              ) : <SectionEmpty />}
            </Company360ActionSection>
          ) : null}

          <Company360ActionSection
            title={text.ecosystem.legalDocuments}
            count={documentsQuery.data?.meta.total ?? 0}
            icon={<FileText className="size-5" />}
            onViewAll={() => goToModule(`/companies/${companyId}`)}
          >
            {documentsQuery.isLoading ? <SectionLoading /> : documentsQuery.data?.data.length ? (
              <div className="grid gap-2.5">
                {documentsQuery.data.data.map((document) => (
                  <button key={document.id} type="button" className="w-full text-start" onClick={() => setQuickView({ kind: "document", item: document })}>
                    <EntityRow
                      icon={<FileText className="size-4" />}
                      title={document.title || document.type || text.notSpecified}
                      subtitle={document.type || undefined}
                      meta={formatCompanyDate(document.documentDate || document.createdAt)}
                    />
                  </button>
                ))}
              </div>
            ) : <SectionEmpty />}
          </Company360ActionSection>
        </div>

        <div className="grid content-start gap-5">
          {canViewPeople ? (
            <Company360ActionSection
              title={text.sections.people}
              description={text.sections.peopleDescription}
              count={peopleQuery.data?.meta.total ?? 0}
              icon={<UsersRound className="size-5" />}
              onViewAll={() => goToModule("/people")}
            >
              {peopleQuery.isLoading ? <SectionLoading /> : peopleQuery.data?.data.length ? (
                <div className="grid gap-2.5">
                  {peopleQuery.data.data.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedPersonId(person.id)}
                      className="flex min-h-[58px] w-full items-center gap-3 rounded-2xl border border-transparent bg-[var(--app-background)]/60 p-3 text-start transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--app-divider)] hover:bg-[var(--app-surface)] hover:shadow-sm"
                    >
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary)]">
                        {person.fullName.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[var(--app-heading)]">{person.fullName}</p>
                        <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">
                          {person.jobTitle || person.title || person.department || text.notSpecified}
                        </p>
                      </div>
                      {person.isPrimaryContact ? (
                        <Star className="size-4 shrink-0 fill-[var(--app-primary)] text-[var(--app-primary)]" />
                      ) : person.isSecondaryContact ? (
                        <Star className="size-4 shrink-0 text-[var(--app-primary-alt)]" />
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState icon={UsersRound} title={text.empty.peopleTitle} description={text.empty.peopleDescription} />
              )}
            </Company360ActionSection>
          ) : null}

          {canViewTasks ? (
            <Company360ActionSection
              title={uiText.navigation.tasks}
              count={tasksQuery.data?.meta.total ?? 0}
              icon={<ListTodo className="size-5" />}
              onViewAll={() => goToModule("/tasks")}
            >
              {tasksQuery.isLoading ? <SectionLoading /> : tasksQuery.data?.data.length ? (
                <div className="grid gap-2.5">
                  {tasksQuery.data.data.map((task) => (
                    <button key={task.id} type="button" className="w-full text-start" onClick={() => setQuickView({ kind: "task", item: task })}>
                      <EntityRow
                        icon={<ListTodo className="size-4" />}
                        title={task.title}
                        subtitle={[task.assignedTo?.fullName, task.status, task.priority].filter(Boolean).join(" · ")}
                        meta={formatCompanyDateTime(task.dueAt)}
                      />
                    </button>
                  ))}
                </div>
              ) : <SectionEmpty />}
            </Company360ActionSection>
          ) : null}

          {canViewMeetings ? (
            <Company360ActionSection
              title={uiText.navigation.meetings}
              count={meetingsQuery.data?.meta.total ?? 0}
              icon={<CalendarClock className="size-5" />}
              onViewAll={() => goToModule("/meetings")}
            >
              {meetingsQuery.isLoading ? <SectionLoading /> : meetingsQuery.data?.data.length ? (
                <div className="grid gap-2.5">
                  {meetingsQuery.data.data.map((meeting) => (
                    <button key={meeting.id} type="button" className="w-full text-start" onClick={() => setQuickView({ kind: "meeting", item: meeting })}>
                      <EntityRow
                        icon={<CalendarClock className="size-4" />}
                        title={meeting.title}
                        subtitle={[meeting.mode, meeting.location, meeting.organizer?.fullName].filter(Boolean).join(" · ")}
                        meta={formatCompanyDateTime(meeting.startAt)}
                      />
                    </button>
                  ))}
                </div>
              ) : <SectionEmpty />}
            </Company360ActionSection>
          ) : null}

          <Company360ActionSection
            title={text.ecosystem.branches}
            count={branchesQuery.data?.meta.total ?? 0}
            icon={<MapPin className="size-5" />}
            onViewAll={() => goToModule(`/companies/${companyId}`)}
          >
            {branchesQuery.isLoading ? <SectionLoading /> : branchesQuery.data?.data.length ? (
              <div className="grid gap-2.5">
                {branchesQuery.data.data.map((branch) => (
                  <button key={branch.id} type="button" className="w-full text-start" onClick={() => setQuickView({ kind: "branch", item: branch })}>
                    <EntityRow icon={<MapPin className="size-4" />} title={branch.name || branch.city || text.notSpecified} subtitle={branch.address || branch.city || undefined} meta={branch.phone || undefined} />
                  </button>
                ))}
              </div>
            ) : <SectionEmpty />}
          </Company360ActionSection>

          <Company360ActionSection
            title={text.ecosystem.social}
            count={socialQuery.data?.meta.total ?? 0}
            icon={<Share2 className="size-5" />}
            onViewAll={() => goToModule(`/companies/${companyId}`)}
          >
            {socialQuery.isLoading ? <SectionLoading /> : socialQuery.data?.data.length ? (
              <div className="grid gap-2.5">
                {socialQuery.data.data.map((channel) => (
                  <button key={channel.id} type="button" className="w-full text-start" onClick={() => setQuickView({ kind: "social", item: channel })}>
                    <EntityRow icon={<Share2 className="size-4" />} title={channel.platform || text.notSpecified} subtitle={channel.handle || undefined} />
                  </button>
                ))}
              </div>
            ) : <SectionEmpty />}
          </Company360ActionSection>
        </div>
      </div>

      {selectedPersonId ? (
        <Person360WorkspaceDialog
          personId={selectedPersonId}
          open
          onOpenChange={(open) => {
            if (!open) setSelectedPersonId(null)
          }}
          onPersonChanged={() => peopleQuery.refetch()}
        />
      ) : null}

      <EntityQuickViewDialog
        open={Boolean(quickView)}
        onOpenChange={(open) => {
          if (!open) setQuickView(null)
        }}
        {...quickViewProps(quickView, text.notSpecified)}
      />

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

      <ChangeCompanyOwnerDialog company={company} open={ownerOpen} onOpenChange={setOwnerOpen} />
      <ArchiveCompanyDialog company={company} open={archiveOpen} onOpenChange={setArchiveOpen} />
    </div>
  )
}

function quickViewProps(
  state: QuickViewState,
  fallback: string,
): {
  title: string
  subtitle?: ReactNode
  icon?: ReactNode
  fields: QuickViewField[]
} {
  if (!state) return { title: fallback, fields: [] }

  switch (state.kind) {
    case "opportunity": {
      const item = state.item
      return {
        title: item.title,
        subtitle: item.stage?.label || item.stage?.code,
        icon: <CircleDollarSign className="size-5" />,
        fields: [
          { value: item.owner?.fullName },
          { value: formatCompanyNumber(item.estimatedValue ?? item.amount ?? null) },
          { value: item.primaryContact?.fullName },
          { value: formatCompanyDate(item.expectedCloseDate) },
          { value: item.probability != null ? `${formatCompanyNumber(item.probability)}%` : undefined },
          { value: item.competitor },
          { value: item.description, wide: true },
        ],
      }
    }
    case "task": {
      const item = state.item
      return {
        title: item.title,
        subtitle: item.status,
        icon: <ListTodo className="size-5" />,
        fields: [
          { value: item.assignedTo?.fullName },
          { value: item.priority },
          { value: formatCompanyDateTime(item.dueAt) },
          { value: item.person?.fullName },
          { value: item.opportunity?.title },
          { value: item.description, wide: true },
        ],
      }
    }
    case "meeting": {
      const item = state.item
      return {
        title: item.title,
        subtitle: item.status,
        icon: <CalendarClock className="size-5" />,
        fields: [
          { value: item.organizer?.fullName },
          { value: item.mode },
          { value: item.location },
          { value: formatCompanyDateTime(item.startAt) },
          { value: formatCompanyDateTime(item.endAt) },
          { value: item.opportunity?.title },
          { value: item.attendees?.map((entry) => entry.person?.fullName).filter(Boolean).join("، "), wide: true },
          { value: item.agenda, wide: true },
          { value: item.description, wide: true },
        ],
      }
    }
    case "activity": {
      const item = state.item
      return {
        title: getActivityTypeLabel(item.type),
        subtitle: item.createdBy?.fullName,
        icon: <CalendarClock className="size-5" />,
        fields: [
          { value: formatCompanyDateTime(item.activityDate || item.occurredAt || item.createdAt) },
          { value: item.person?.fullName },
          { value: item.status },
          { value: item.outcome, wide: true },
          { value: item.description || item.notes, wide: true },
        ],
      }
    }
    case "branch":
      return {
        title: state.item.name || state.item.city || fallback,
        icon: <MapPin className="size-5" />,
        fields: [
          { value: state.item.city },
          { value: state.item.phone },
          { value: state.item.address, wide: true },
        ],
      }
    case "social":
      return {
        title: state.item.platform || fallback,
        icon: <Share2 className="size-5" />,
        fields: [{ value: state.item.handle, wide: true }],
      }
    case "document":
      return {
        title: state.item.title || state.item.type || fallback,
        icon: <FileText className="size-5" />,
        fields: [
          { value: state.item.type },
          { value: formatCompanyDate(state.item.documentDate || state.item.createdAt) },
          { value: state.item.description, wide: true },
        ],
      }
  }
}

function EntityRow({
  icon,
  title,
  subtitle,
  meta,
  badge,
  badgeColor,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  meta?: string
  badge?: string | null
  badgeColor?: string | null
}) {
  const badgeStyle = badgeColor
    ? {
        color: badgeColor,
        borderColor: badgeColor,
        backgroundColor: /^#[0-9A-F]{6}$/i.test(badgeColor)
          ? `${badgeColor}14`
          : undefined,
      }
    : undefined

  return (
    <div className="flex min-h-[58px] items-center gap-3 rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/45 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--app-surface)] hover:shadow-sm">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-xs font-bold text-[var(--app-heading)]">{title}</p>
          {badge ? (
            <span
              style={badgeStyle}
              className="shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold"
            >
              {badge}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-1 truncate text-[10px] text-[var(--app-text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      {meta ? (
        <span dir="auto" className="max-w-36 shrink-0 truncate text-[10px] text-[var(--app-text-secondary)]">
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

function SectionLoading({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-2.5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[58px] animate-pulse rounded-2xl bg-[var(--app-background)]" />
      ))}
    </div>
  )
}
