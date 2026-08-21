import {
  Archive,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CircleDollarSign,
  FileClock,
  Layers3,
  ListChecks,
  Pencil,
  RotateCcw,
  UserRoundCog,
  Waypoints,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Person360WorkspaceDialog } from "@/features/people/components/Person360WorkspaceDialog"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { formatJalaliDate } from "@/lib/date/jalali"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { ChangeOpportunityOwnerDialog } from "../components/ChangeOpportunityOwnerDialog"
import { ChangeOpportunityStageDialog } from "../components/ChangeOpportunityStageDialog"
import { OpportunityCommercialSection } from "../components/OpportunityCommercialSection"
import { OpportunityExecutionSection } from "../components/OpportunityExecutionSection"
import { OpportunityFilesHistorySection } from "../components/OpportunityFilesHistorySection"
import { OpportunityFormDialog } from "../components/OpportunityFormDialog"
import {
  OpportunityExecutiveSummary,
  OpportunityOverview,
} from "../components/OpportunityOverview"
import { OpportunityProgressRail } from "../components/OpportunityProgressRail"
import {
  useArchiveOpportunity,
  useChangeOpportunityOwner,
  useChangeOpportunityStage,
  useOpportunity,
  usePipelineStages,
  usePipelineTransitions,
  useRestoreOpportunity,
  useUpdateOpportunity,
} from "../hooks/useOpportunities"
import type {
  Opportunity,
  OpportunityPayload,
  OpportunityStage,
  OpportunityTransition,
  OpportunityUpdatePayload,
} from "../types/opportunity.types"
import {
  formatOpportunityValue,
  opportunityCompanyName,
} from "../utils/opportunityFormatters"

type DetailTab = "overview" | "commercial" | "execution" | "files"

function allowedTargets(
  opportunity: Opportunity,
  stages: OpportunityStage[],
  transitions: OpportunityTransition[],
  role?: string
) {
  const relevant = transitions.filter(
    (rule) => rule.fromStageId === opportunity.stageId
  )
  return stages.filter((stage) => {
    if (stage.id === opportunity.stageId) return false
    const roleRule = relevant.find(
      (rule) => rule.toStageId === stage.id && rule.role === role
    )
    const generalRule = relevant.find(
      (rule) => rule.toStageId === stage.id && rule.role == null
    )
    const rule = roleRule ?? generalRule
    return Boolean(rule && (rule.isAllowed ?? rule.allowed ?? false))
  })
}

export function OpportunityDetailPage() {
  const text = uiText.opportunities
  const detailText = text.detail
  const { id = "" } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []
  const canView = permissions.includes("opportunity:view")
  const canUpdate = permissions.includes("opportunity:update")
  const canChangeOwner = permissions.includes("opportunity:change-owner")
  const canChangeStage = permissions.includes("opportunity:change-stage")
  const canArchive = permissions.includes("opportunity:archive")
  const canRestore = permissions.includes("opportunity:restore")
  const [tab, setTab] = useState<DetailTab>("overview")
  const [editOpen, setEditOpen] = useState(false)
  const [ownerOpen, setOwnerOpen] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [personOpen, setPersonOpen] = useState(false)

  const opportunityQuery = useOpportunity(id, canView)
  const stagesQuery = usePipelineStages(canView)
  const transitionsQuery = usePipelineTransitions(canView && canChangeStage)
  const stages = useMemo(
    () =>
      (Array.isArray(stagesQuery.data) ? stagesQuery.data : [])
        .filter((stage) => stage.isActive !== false)
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [stagesQuery.data]
  )
  const transitions = Array.isArray(transitionsQuery.data)
    ? transitionsQuery.data
    : []
  const opportunity = opportunityQuery.data
  const targets = opportunity
    ? allowedTargets(opportunity, stages, transitions, user?.role)
    : []
  const updateMutation = useUpdateOpportunity()
  const ownerMutation = useChangeOpportunityOwner()
  const stageMutation = useChangeOpportunityStage()
  const archiveMutation = useArchiveOpportunity()
  const restoreMutation = useRestoreOpportunity()

  const stateBackTo = (location.state as { backTo?: unknown } | null)?.backTo
  const backTo =
    typeof stateBackTo === "string" &&
    stateBackTo.startsWith("/") &&
    !stateBackTo.startsWith("//")
      ? stateBackTo
      : "/opportunities"

  async function submitEdit(
    payload: OpportunityPayload | OpportunityUpdatePayload
  ) {
    if (!opportunity) return
    try {
      await updateMutation.mutateAsync({
        id: opportunity.id,
        payload: payload as OpportunityUpdatePayload,
      })
      toast.success(text.feedback.updated)
      setEditOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  async function submitOwner(ownerId: string | null) {
    if (!opportunity) return
    try {
      await ownerMutation.mutateAsync({ id: opportunity.id, ownerId })
      toast.success(text.feedback.ownerChanged)
      setOwnerOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.ownerMutation))
    }
  }

  async function submitStage(stageId: string, note?: string) {
    if (!opportunity) return
    try {
      await stageMutation.mutateAsync({
        opportunity,
        stageId,
        note,
        optimistic: false,
      })
      toast.success(text.feedback.stageChanged)
      setStageOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.stageMutation))
    }
  }

  async function toggleArchive() {
    if (!opportunity) return
    try {
      if (opportunity.archivedAt) {
        await restoreMutation.mutateAsync(opportunity.id)
        toast.success(text.feedback.restored)
      } else {
        await archiveMutation.mutateAsync({ id: opportunity.id })
        toast.success(text.feedback.archived)
      }
      setArchiveOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  if (!canView)
    return (
      <ErrorState
        title={text.errors.permissionTitle}
        description={text.errors.permissionDescription}
      />
    )
  if (opportunityQuery.isLoading) return <LoadingState />
  if (opportunityQuery.isError || !opportunity)
    return (
      <ErrorState
        title={detailText.errors.title}
        description={detailText.errors.description}
        retryLabel={uiText.common.retry}
        onRetry={() => void opportunityQuery.refetch()}
      />
    )

  const archived = Boolean(opportunity.archivedAt)
  const navItems: Array<{
    id: DetailTab
    label: string
    icon: typeof BriefcaseBusiness
  }> = [
    { id: "overview", label: detailText.nav.overview, icon: BriefcaseBusiness },
    {
      id: "commercial",
      label: detailText.nav.commercial,
      icon: CircleDollarSign,
    },
    { id: "execution", label: detailText.nav.execution, icon: ListChecks },
    { id: "files", label: detailText.nav.files, icon: FileClock },
  ]

  return (
    <div className="grid gap-5" dir="rtl">
      <Button
        type="button"
        variant="ghost"
        className="w-fit rounded-xl text-[var(--app-text-secondary)]"
        onClick={() => navigate(backTo)}
      >
        <ArrowRight className="size-4" />
        {detailText.back}
      </Button>

      <header
        className={
          archived
            ? "relative overflow-hidden rounded-[30px] border border-[var(--warning)]/35 bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-7"
            : "relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-5 shadow-[var(--app-shadow-card)] sm:p-7"
        }
      >
        <div className="pointer-events-none absolute -end-20 -top-24 size-60 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="primary">{detailText.cockpit}</StatusBadge>
              <StatusBadge tone={archived ? "warning" : "success"}>
                {archived ? text.status.archived : text.status.active}
              </StatusBadge>
              <StatusBadge tone="neutral">
                {text.priorities[opportunity.priority]}
              </StatusBadge>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[var(--app-heading)] sm:text-3xl">
              {opportunity.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[var(--app-text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                {opportunityCompanyName(opportunity)}
              </span>
              <span className="flex items-center gap-1.5">
                <Layers3 className="size-3.5" />
                {opportunity.stage?.label || uiText.common.notAvailable}
              </span>
              <span className="flex items-center gap-1.5">
                <UserRoundCog className="size-3.5" />
                {opportunity.owner?.fullName || text.fields.noOwner}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                {formatJalaliDate(opportunity.expectedCloseDate) ||
                  uiText.common.notAvailable}
              </span>
              <span className="flex items-center gap-1.5">
                <CircleDollarSign className="size-3.5" />
                {formatOpportunityValue(opportunity.estimatedValue)}
                {opportunity.estimatedValue == null
                  ? null
                  : ` ${text.fields.valueUnit}`}
              </span>
              <span>
                {text.fields.probability}:{" "}
                {opportunity.probability == null
                  ? uiText.common.notAvailable
                  : `${opportunity.probability.toLocaleString("fa-IR")}%`}
              </span>
            </div>
            {archived && opportunity.archiveReason ? (
              <p className="mt-4 rounded-xl bg-[var(--warning-light)] px-3 py-2 text-[10px] text-[var(--app-text-secondary)]">
                {opportunity.archiveReason}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {canUpdate && !archived ? (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
                {text.actions.edit}
              </Button>
            ) : null}
            {canChangeStage && !archived ? (
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={
                  transitionsQuery.isLoading ||
                  transitionsQuery.isError ||
                  !targets.length
                }
                onClick={() => setStageOpen(true)}
              >
                <Waypoints className="size-4" />
                {text.actions.changeStage}
              </Button>
            ) : null}
            {canChangeOwner && !archived ? (
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setOwnerOpen(true)}
              >
                <UserRoundCog className="size-4" />
                {text.actions.changeOwner}
              </Button>
            ) : null}
            {archived && canRestore ? (
              <Button
                className="rounded-xl bg-[var(--app-primary)]"
                onClick={() => setArchiveOpen(true)}
              >
                <RotateCcw className="size-4" />
                {text.actions.restore}
              </Button>
            ) : !archived && canArchive ? (
              <Button
                variant="outline"
                className="rounded-xl text-[var(--destructive)]"
                onClick={() => setArchiveOpen(true)}
              >
                <Archive className="size-4" />
                {text.actions.archive}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <OpportunityExecutiveSummary opportunity={opportunity} />
      <OpportunityProgressRail opportunity={opportunity} stages={stages} />
      {stagesQuery.isError ? (
        <ErrorState
          title={text.errors.stagesTitle}
          description={text.errors.stagesDescription}
          retryLabel={uiText.common.retry}
          onRetry={() => void stagesQuery.refetch()}
        />
      ) : null}
      {transitionsQuery.isError && canChangeStage && !archived ? (
        <p className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning-light)] p-3 text-xs text-[var(--app-text-secondary)]">
          {text.errors.transitions}
        </p>
      ) : null}

      <nav className="sticky top-2 z-10 flex gap-1 overflow-x-auto rounded-2xl border border-[var(--app-divider)] bg-[var(--app-surface)]/95 p-1.5 shadow-sm backdrop-blur">
        {navItems.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="ghost"
            className={
              tab === item.id
                ? "min-w-fit flex-1 rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"
                : "min-w-fit flex-1 rounded-xl text-[var(--app-text-secondary)]"
            }
            onClick={() => setTab(item.id)}
          >
            <item.icon className="size-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {tab === "overview" ? (
        <OpportunityOverview
          opportunity={opportunity}
          canViewCompany={permissions.includes("company:view")}
          canViewPerson={permissions.includes("person:view")}
          canEdit={canUpdate && !archived}
          onCompany={() => navigate(`/companies/${opportunity.companyId}`)}
          onPerson={() => setPersonOpen(true)}
          onEdit={() => setEditOpen(true)}
        />
      ) : null}
      {tab === "commercial" ? (
        <OpportunityCommercialSection
          opportunity={opportunity}
          permissions={permissions}
        />
      ) : null}
      {tab === "execution" ? (
        <OpportunityExecutionSection
          opportunity={opportunity}
          permissions={permissions}
        />
      ) : null}
      {tab === "files" ? (
        <OpportunityFilesHistorySection
          opportunity={opportunity}
          permissions={permissions}
        />
      ) : null}

      {editOpen ? (
        <OpportunityFormDialog
          open
          onOpenChange={setEditOpen}
          opportunity={opportunity}
          initialCompanyId={opportunity.companyId}
          lockCompany
          stages={stages}
          isPending={updateMutation.isPending}
          onSubmit={submitEdit}
        />
      ) : null}
      {ownerOpen ? (
        <ChangeOpportunityOwnerDialog
          opportunity={opportunity}
          open
          onOpenChange={setOwnerOpen}
          isPending={ownerMutation.isPending}
          onSubmit={submitOwner}
        />
      ) : null}
      {stageOpen ? (
        <ChangeOpportunityStageDialog
          targets={targets}
          open
          onOpenChange={setStageOpen}
          isPending={stageMutation.isPending}
          onSubmit={submitStage}
        />
      ) : null}
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={archived ? text.dialogs.restoreTitle : text.dialogs.archiveTitle}
        description={
          archived
            ? text.dialogs.restoreDescription
            : text.dialogs.archiveDescription
        }
        confirmLabel={archived ? text.actions.restore : text.actions.archive}
        tone={archived ? "primary" : "danger"}
        isPending={archiveMutation.isPending || restoreMutation.isPending}
        onConfirm={toggleArchive}
      />
      {opportunity.primaryContact?.id ? (
        <Person360WorkspaceDialog
          personId={opportunity.primaryContact.id}
          open={personOpen}
          onOpenChange={setPersonOpen}
          onPersonChanged={() => opportunityQuery.refetch()}
        />
      ) : null}
    </div>
  )
}
