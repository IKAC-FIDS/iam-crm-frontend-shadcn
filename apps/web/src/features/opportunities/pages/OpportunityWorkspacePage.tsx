import { BriefcaseBusiness, LayoutList, Plus, Rows3 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { LoadingState } from "@/components/shared/LoadingState"
import { uiText } from "@/config/uiText"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"

import { ChangeOpportunityOwnerDialog } from "../components/ChangeOpportunityOwnerDialog"
import { ChangeOpportunityStageDialog } from "../components/ChangeOpportunityStageDialog"
import { OpportunityFilterBar } from "../components/OpportunityFilterBar"
import { OpportunityFormDialog } from "../components/OpportunityFormDialog"
import { OpportunityListView } from "../components/OpportunityListView"
import { OpportunityPipelineBoard } from "../components/OpportunityPipelineBoard"
import {
  useArchiveOpportunity,
  useChangeOpportunityOwner,
  useChangeOpportunityStage,
  useCreateOpportunity,
  useOpportunityOwners,
  useOpportunitySources,
  usePipelineStages,
  usePipelineTransitions,
  useRestoreOpportunity,
  useUpdateOpportunity,
} from "../hooks/useOpportunities"
import type { OpportunityActionPermissions } from "../components/OpportunityActionsMenu"
import type { Opportunity, OpportunityFilters, OpportunityPayload, OpportunityStage, OpportunityTransition, OpportunityUpdatePayload } from "../types/opportunity.types"

const baseFilters: OpportunityFilters = { ownershipScope: "all", archiveState: "active" }

function allowedTargets(opportunity: Opportunity, stages: OpportunityStage[], transitions: OpportunityTransition[], role?: string) {
  const relevant = transitions.filter((rule) => rule.fromStageId === opportunity.stageId)
  return stages.filter((stage) => {
    if (stage.id === opportunity.stageId) return false
    const specific = relevant.find((rule) => rule.toStageId === stage.id && rule.role === role)
    const general = relevant.find((rule) => rule.toStageId === stage.id && rule.role == null)
    const selected = specific ?? general
    return Boolean(selected && (selected.isAllowed ?? selected.allowed ?? false))
  })
}

export function OpportunityWorkspacePage() {
  const text = uiText.opportunities
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCompanyId = searchParams.get("companyId")?.trim() || undefined
  const [view, setView] = useState<"pipeline" | "list">(searchParams.get("view") === "list" ? "list" : "pipeline")
  const [filters, setFilters] = useState<OpportunityFilters>(() => ({ ...baseFilters, companyId: initialCompanyId }))
  const [queryFilters, setQueryFilters] = useState(filters)
  const [formOpportunity, setFormOpportunity] = useState<Opportunity | null | undefined>(undefined)
  const [ownerOpportunity, setOwnerOpportunity] = useState<Opportunity | null>(null)
  const [stageState, setStageState] = useState<{ opportunity: Opportunity; target?: OpportunityStage | null } | null>(null)
  const [archiveOpportunityState, setArchiveOpportunityState] = useState<Opportunity | null>(null)

  const canView = permissions.includes("opportunity:view")
  const canCreate = permissions.includes("opportunity:create")
  const actionPermissions: OpportunityActionPermissions = {
    update: permissions.includes("opportunity:update"),
    changeOwner: permissions.includes("opportunity:change-owner"),
    changeStage: permissions.includes("opportunity:change-stage"),
    archive: permissions.includes("opportunity:archive"),
    restore: permissions.includes("opportunity:restore"),
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setQueryFilters(filters), 300)
    return () => window.clearTimeout(timer)
  }, [filters])

  const stagesQuery = usePipelineStages(canView)
  const transitionsQuery = usePipelineTransitions(canView && actionPermissions.changeStage)
  const sourcesQuery = useOpportunitySources(canView)
  const ownersQuery = useOpportunityOwners(canView && permissions.includes("company:assign-owner"))
  const stages = useMemo(() => (Array.isArray(stagesQuery.data) ? stagesQuery.data : []).filter((stage) => stage.isActive !== false).sort((left, right) => left.sortOrder - right.sortOrder), [stagesQuery.data])
  const transitions = Array.isArray(transitionsQuery.data) ? transitionsQuery.data : []
  const boardStages = queryFilters.stageId ? stages.filter((stage) => stage.id === queryFilters.stageId) : stages
  const effectiveActionPermissions = {
    ...actionPermissions,
    changeStage:
      actionPermissions.changeStage &&
      !transitionsQuery.isError &&
      !transitionsQuery.isLoading,
  }
  const targets = stageState ? allowedTargets(stageState.opportunity, stages, transitions, user?.role) : []

  const createMutation = useCreateOpportunity()
  const updateMutation = useUpdateOpportunity()
  const stageMutation = useChangeOpportunityStage()
  const ownerMutation = useChangeOpportunityOwner()
  const archiveMutation = useArchiveOpportunity()
  const restoreMutation = useRestoreOpportunity()

  function switchView(next: "pipeline" | "list") {
    setView(next)
    const updated = new URLSearchParams(searchParams)
    if (next === "list") updated.set("view", "list")
    else updated.delete("view")
    setSearchParams(updated, { replace: true })
  }

  async function submitForm(payload: OpportunityPayload | OpportunityUpdatePayload) {
    try {
      if (formOpportunity) {
        await updateMutation.mutateAsync({ id: formOpportunity.id, payload: payload as OpportunityUpdatePayload })
        toast.success(text.feedback.updated)
      } else {
        await createMutation.mutateAsync(payload as OpportunityPayload)
        toast.success(text.feedback.created)
      }
      setFormOpportunity(undefined)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  async function submitStage(stageId: string, note?: string) {
    if (!stageState) return
    try {
      await stageMutation.mutateAsync({ opportunity: stageState.opportunity, stageId, note, optimistic: true })
      toast.success(text.feedback.stageChanged)
      setStageState(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.stageMutation))
    }
  }

  function dropStage(opportunity: Opportunity, target: OpportunityStage) {
    if (target.isTerminal) {
      setStageState({ opportunity, target })
      return
    }
    void stageMutation.mutateAsync({ opportunity, stageId: target.id, optimistic: true })
      .then(() => toast.success(text.feedback.stageChanged))
      .catch((error) => toast.error(getApiErrorMessage(error, text.errors.stageMutation)))
  }

  async function submitOwner(ownerId: string | null) {
    if (!ownerOpportunity) return
    try {
      await ownerMutation.mutateAsync({ id: ownerOpportunity.id, ownerId })
      toast.success(text.feedback.ownerChanged)
      setOwnerOpportunity(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.ownerMutation))
    }
  }

  async function toggleArchive() {
    if (!archiveOpportunityState) return
    try {
      if (archiveOpportunityState.archivedAt) {
        await restoreMutation.mutateAsync(archiveOpportunityState.id)
        toast.success(text.feedback.restored)
      } else {
        await archiveMutation.mutateAsync({ id: archiveOpportunityState.id })
        toast.success(text.feedback.archived)
      }
      setArchiveOpportunityState(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, text.errors.mutation))
    }
  }

  const onView = (item: Opportunity) => navigate(`/opportunities/${item.id}`, { state: { backTo: `${location.pathname}${location.search}` } })

  if (!canView) return <ErrorState title={text.errors.permissionTitle} description={text.errors.permissionDescription} />

  return (
    <div className="grid gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[30px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-5 py-6 shadow-[var(--app-shadow-card)] sm:px-7">
        <div className="pointer-events-none absolute -end-20 -top-28 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-[var(--app-background)]/70 px-3 py-1.5 text-[10px] font-bold text-[var(--app-primary)]"><BriefcaseBusiness className="size-3.5" />{text.hero.badge}</div>
            <h1 className="text-2xl font-bold text-[var(--app-heading)] sm:text-3xl">{text.hero.title}</h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-[var(--app-text-secondary)]">{text.hero.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1">
              <Button type="button" variant="ghost" size="sm" className={view === "pipeline" ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm" : "rounded-lg"} onClick={() => switchView("pipeline")}><Rows3 className="size-4" />{text.views.pipeline}</Button>
              <Button type="button" variant="ghost" size="sm" className={view === "list" ? "rounded-lg bg-[var(--app-surface)] text-[var(--app-primary)] shadow-sm" : "rounded-lg"} onClick={() => switchView("list")}><LayoutList className="size-4" />{text.views.list}</Button>
            </div>
            {canCreate ? <Button type="button" className="rounded-xl bg-[var(--app-primary)] text-[var(--app-on-primary)] hover:bg-[var(--app-primary-hover)]" onClick={() => setFormOpportunity(null)}><Plus className="size-4" />{text.actions.create}</Button> : null}
          </div>
        </div>
      </section>

      <OpportunityFilterBar
        filters={filters}
        stages={stages}
        owners={Array.isArray(ownersQuery.data) ? ownersQuery.data : []}
        sources={Array.isArray(sourcesQuery.data) ? sourcesQuery.data : []}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onClear={() => setFilters({ ...baseFilters, companyId: initialCompanyId })}
      />

      {transitionsQuery.isError && actionPermissions.changeStage ? <p className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning-light)] p-3 text-xs text-[var(--app-text-secondary)]">{text.errors.transitions}</p> : null}

      {view === "pipeline" ? (
        stagesQuery.isLoading ? <LoadingState /> : stagesQuery.isError ? <ErrorState title={text.errors.stagesTitle} description={text.errors.stagesDescription} retryLabel={uiText.common.retry} onRetry={() => void stagesQuery.refetch()} /> : !stages.length ? <EmptyState icon={Rows3} title={text.empty.stagesTitle} description={text.empty.stagesDescription} /> : (
          <>
            <OpportunityPipelineBoard stages={boardStages} transitions={effectiveActionPermissions.changeStage ? transitions : null} filters={queryFilters} role={user?.role} permissions={effectiveActionPermissions} onView={onView} onEdit={(item) => setFormOpportunity(item)} onChangeOwner={setOwnerOpportunity} onChangeStage={(item) => setStageState({ opportunity: item })} onArchiveToggle={setArchiveOpportunityState} onDropStage={dropStage} />
          </>
        )
      ) : <OpportunityListView filters={queryFilters} permissions={effectiveActionPermissions} onView={onView} onEdit={(item) => setFormOpportunity(item)} onChangeOwner={setOwnerOpportunity} onChangeStage={(item) => setStageState({ opportunity: item })} onArchiveToggle={setArchiveOpportunityState} />}

      {formOpportunity !== undefined ? <OpportunityFormDialog open onOpenChange={(open) => { if (!open) setFormOpportunity(undefined) }} opportunity={formOpportunity} initialCompanyId={filters.companyId} stages={stages} isPending={createMutation.isPending || updateMutation.isPending} onSubmit={submitForm} /> : null}
      {ownerOpportunity ? <ChangeOpportunityOwnerDialog opportunity={ownerOpportunity} open onOpenChange={(open) => { if (!open) setOwnerOpportunity(null) }} isPending={ownerMutation.isPending} onSubmit={submitOwner} /> : null}
      {stageState ? <ChangeOpportunityStageDialog targets={stageState.target ? [stageState.target] : targets} initialTarget={stageState.target} open onOpenChange={(open) => { if (!open) setStageState(null) }} isPending={stageMutation.isPending} onSubmit={submitStage} /> : null}
      {archiveOpportunityState ? <ConfirmDialog open onOpenChange={(open) => { if (!open) setArchiveOpportunityState(null) }} title={archiveOpportunityState.archivedAt ? text.dialogs.restoreTitle : text.dialogs.archiveTitle} description={archiveOpportunityState.archivedAt ? text.dialogs.restoreDescription : text.dialogs.archiveDescription} confirmLabel={archiveOpportunityState.archivedAt ? text.actions.restore : text.actions.archive} tone={archiveOpportunityState.archivedAt ? "primary" : "danger"} isPending={archiveMutation.isPending || restoreMutation.isPending} onConfirm={toggleArchive} /> : null}
    </div>
  )
}
