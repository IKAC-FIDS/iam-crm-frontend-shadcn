import {
  ArrowLeftRight,
  Ban,
  Check,
  GitBranch,
  GripVertical,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from "lucide-react"

import { useMemo, useState, type DragEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { ContentSection } from "@/components/shared/ContentSection"
import { DashboardToolbar } from "@/components/shared/DashboardToolbar"
import {
  EntityCardList,
  type EntityCardField,
} from "@/components/shared/EntityCardList"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { EntityRowActions } from "@/components/shared/EntityRowActions"
import { EmptyState } from "@/components/shared/EmptyState"
import { ErrorState } from "@/components/shared/ErrorState"
import { FormActions } from "@/components/shared/FormActions"
import { LoadingState } from "@/components/shared/LoadingState"
import { MetricCard } from "@/components/shared/MetricCard"
import { PageHero } from "@/components/shared/PageHero"
import { ResponsiveModal as Modal } from "@/components/shared/ResponsiveModal"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

// Stored stage colors and native color inputs require a concrete color value.
const DEFAULT_PIPELINE_COLOR = "#78716C"

import {
  createPipelineStage,
  createPipelineTransition,
  deactivatePipelineStage,
  deletePipelineTransition,
  getPipelineStages,
  getPipelineTransitions,
  reorderPipelineStages,
  updatePipelineStage,
  updatePipelineTransition,
  type PipelineRole,
  type PipelineStage,
  type PipelineTransition,
  type TerminalType,
} from "../api/adminPipelineApi"

const ROLE_LABELS: Record<PipelineRole, string> = {
  ADMIN: "ادمین",
  MANAGER: "مدیر",
  REP: "کارشناس",
  BOARDS: "برد / مشاهده‌گر",
}

const TERMINAL_LABELS: Record<TerminalType, string> = {
  NONE: "عادی",
  WON: "برنده",
  LOST: "از دست‌رفته",
  ON_HOLD: "متوقف",
}

function hasPermission(permissions: string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission))
}

function fa(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 ${props.className ?? ""}`}
    />
  )
}

export function AdminPipelinePage() {
  const user = useAuthStore((state) => state.user)
  const permissions = user?.permissions ?? []
  const client = useQueryClient()

  const canViewStages =
    hasPermission(permissions, "pipeline:config:view") ||
    hasPermission(permissions, "pipeline:config:manage")
  const canManageStages = hasPermission(permissions, "pipeline:config:manage")
  const canViewTransitions =
    hasPermission(permissions, "pipeline:transition:view") ||
    hasPermission(permissions, "pipeline:transition:manage")
  const canManageTransitions = hasPermission(
    permissions,
    "pipeline:transition:manage"
  )

  const [tab, setTab] = useState<"stages" | "transitions">(
    canViewStages ? "stages" : "transitions"
  )
  const [stageEditor, setStageEditor] = useState<
    PipelineStage | "NEW" | null
  >(null)

  const stagesQuery = useQuery({
    queryKey: ["admin-pipeline-stages"],
    queryFn: getPipelineStages,
    enabled: canViewStages || canViewTransitions,
  })

  const transitionsQuery = useQuery({
    queryKey: ["admin-pipeline-transitions"],
    queryFn: getPipelineTransitions,
    enabled: canViewTransitions,
  })

  const stages = stagesQuery.data ?? []
  const activeStages = stages.filter((stage) => stage.isActive)
  const terminalStages = stages.filter((stage) => stage.isTerminal)
  const defaultStage = stages.find((stage) => stage.isDefault)

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["admin-pipeline-stages"] }),
      client.invalidateQueries({ queryKey: ["admin-pipeline-transitions"] }),
    ])
  }

  if (!canViewStages && !canViewTransitions) {
    return (
      <div className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-sm text-muted-foreground">
        شما دسترسی مشاهده تنظیمات پایپ‌لاین را ندارید.
      </div>
    )
  }

  return (
    <EntityListPage>
      <PageHero
        accessBadge={{ label: "مدیریت پایپ‌لاین", icon: Sparkles }}
        title="طراح پایپ‌لاین فروش"
        description="مراحل فروش، ترتیب نمایش، وضعیت‌های نهایی و قوانین مجاز انتقال بین مراحل را مدیریت کنید."
        onRefresh={refresh}
        refreshing={stagesQuery.isFetching || transitionsQuery.isFetching}
        primaryAction={
          canManageStages
            ? {
                label: "ایجاد مرحله",
                icon: Plus,
                onClick: () => {
                  setTab("stages")
                  setStageEditor("NEW")
                },
              }
            : undefined
        }
        tabs={
          <div
            role="tablist"
            aria-label="بخش تنظیمات پایپ‌لاین"
            className="flex flex-wrap gap-2"
          >
            {canViewStages ? (
              <Button
                role="tab"
                aria-selected={tab === "stages"}
                variant={tab === "stages" ? "default" : "outline"}
                onClick={() => setTab("stages")}
              >
                <GitBranch className="size-4" />
                مراحل پایپ‌لاین
              </Button>
            ) : null}
            {canViewTransitions ? (
              <Button
                role="tab"
                aria-selected={tab === "transitions"}
                variant={tab === "transitions" ? "default" : "outline"}
                onClick={() => setTab("transitions")}
              >
                <ArrowLeftRight className="size-4" />
                قوانین انتقال
              </Button>
            ) : null}
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          label="کل مراحل"
          value={fa(stages.length)}
          helper="شامل فعال و غیرفعال"
          icon={GitBranch}
        />
        <MetricCard
          label="مراحل فعال"
          value={fa(activeStages.length)}
          helper="قابل استفاده در فرصت‌ها"
          icon={ShieldCheck}
        />
        <MetricCard
          label="مراحل نهایی"
          value={fa(terminalStages.length)}
          helper="Won / Lost / On Hold"
          icon={Trophy}
        />
        <MetricCard
          label="مرحله پیش‌فرض"
          value={defaultStage?.label ?? "—"}
          helper={defaultStage?.code ?? "تعریف نشده"}
          icon={ShieldCheck}
        />
      </section>

      {tab === "stages" ? (
        <StagesDesigner
          stages={stages}
          loading={stagesQuery.isLoading}
          error={stagesQuery.isError}
          canManage={canManageStages}
          onRefresh={refresh}
          editor={stageEditor}
          onEditorChange={setStageEditor}
        />
      ) : (
        <TransitionDesigner
          stages={stages}
          transitions={transitionsQuery.data ?? []}
          loading={stagesQuery.isLoading || transitionsQuery.isLoading}
          error={stagesQuery.isError || transitionsQuery.isError}
          canManage={canManageTransitions}
          onRefresh={refresh}
        />
      )}
    </EntityListPage>
  )
}

function StagesDesigner({
  stages,
  loading,
  error,
  canManage,
  onRefresh,
  editor,
  onEditorChange,
}: {
  stages: PipelineStage[]
  loading: boolean
  error: boolean
  canManage: boolean
  onRefresh: () => Promise<void>
  editor: PipelineStage | "NEW" | null
  onEditorChange: (value: PipelineStage | "NEW" | null) => void
}) {
  const setEditor = onEditorChange
  const [deactivateTarget, setDeactivateTarget] =
    useState<PipelineStage | null>(null)
  const [replacementStageId, setReplacementStageId] = useState("")
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [ordered, setOrdered] = useState<PipelineStage[] | null>(null)

  const displayed = ordered ?? stages

  const reorderMutation = useMutation({
    mutationFn: (items: PipelineStage[]) =>
      reorderPipelineStages(
        items.map((item, index) => ({ id: item.id, sortOrder: index }))
      ),
    onSuccess: async () => {
      toast.success("ترتیب مراحل ذخیره شد.")
      setOrdered(null)
      await onRefresh()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "ذخیره ترتیب مراحل انجام نشد.")),
  })

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!deactivateTarget) return
      return deactivatePipelineStage(
        deactivateTarget.id,
        replacementStageId || undefined
      )
    },
    onSuccess: async () => {
      toast.success("مرحله غیرفعال شد.")
      setDeactivateTarget(null)
      setReplacementStageId("")
      await onRefresh()
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "غیرفعال‌سازی انجام نشد. اگر مرحله در فرصت‌های فعال استفاده می‌شود، مرحله جایگزین را انتخاب کنید."
        )
      ),
  })

  const startDrag = (event: DragEvent<HTMLElement>, id: string) => {
    if (!canManage) return
    setDraggedId(id)
    setDragOverId(id)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", id)
  }

  const moveStage = (sourceId: string, targetId: string) => {
    if (!sourceId || sourceId === targetId) return

    const copy = [...displayed]
    const from = copy.findIndex((item) => item.id === sourceId)
    const to = copy.findIndex((item) => item.id === targetId)
    if (from < 0 || to < 0) return

    const moved = copy[from]
    if (!moved) return
    copy.splice(from, 1)
    copy.splice(to, 0, moved)
    setOrdered(copy)
  }

  const dragOverStage = (event: DragEvent<HTMLElement>, targetId: string) => {
    if (!canManage) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"

    const sourceId = draggedId || event.dataTransfer.getData("text/plain")
    if (!sourceId || dragOverId === targetId) return

    setDragOverId(targetId)
    moveStage(sourceId, targetId)
  }

  const finishDrag = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  if (loading) {
    return <LoadingState rows={4} />
  }

  if (error) {
    return (
      <ErrorState
        title="دریافت مراحل پایپ‌لاین انجام نشد"
        description="در دریافت اطلاعات مراحل مشکلی رخ داد. دوباره تلاش کنید."
        retryLabel="تلاش دوباره"
        onRetry={() => void onRefresh()}
      />
    )
  }

  return (
    <>
      <ContentSection
        title="جریان مراحل"
        description="برای تغییر ترتیب، کارت‌ها را بکشید و در جای دلخواه رها کنید."
        icon={GitBranch}
        action={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {ordered ? (
              <>
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onClick={() => setOrdered(null)}
                >
                  انصراف
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => reorderMutation.mutate(ordered)}
                  disabled={reorderMutation.isPending}
                >
                  <Save className="ms-2 size-4" />
                  ذخیره ترتیب
                </Button>
              </>
            ) : null}
          </div>
        }
      >

        {displayed.length ? (
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {displayed.map((stage, index) => (
            <SurfaceCard
              key={stage.id}
              draggable={canManage}
              onDragStart={(event) => startDrag(event, stage.id)}
              onDragEnter={(event) => dragOverStage(event, stage.id)}
              onDragOver={(event) => dragOverStage(event, stage.id)}
              onDrop={(event) => {
                event.preventDefault()
                finishDrag()
              }}
              onDragEnd={finishDrag}
              className={`min-w-0 p-4 transition-[transform,opacity,border-color,box-shadow] duration-150 ${
                canManage ? "cursor-grab active:cursor-grabbing" : ""
              } ${
                draggedId === stage.id
                  ? "scale-[0.98] border-[var(--app-primary)] opacity-45"
                  : dragOverId === stage.id
                    ? "border-[var(--app-primary)] shadow-md ring-2 ring-[var(--app-primary)]/15"
                    : "border-[var(--app-divider)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  {canManage ? (
                    <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground" />
                  ) : null}
                  <div className="min-w-0">
                    <div className="truncate font-black">{stage.label}</div>
                    <code
                      className="mt-1 block truncate text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {stage.code}
                    </code>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  #{fa(index + 1)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {stage.isDefault ? (
                  <StatusBadge tone="primary">پیش‌فرض</StatusBadge>
                ) : null}

                <StatusBadge tone={stage.isActive ? "success" : "neutral"}>
                  {stage.isActive ? "فعال" : "غیرفعال"}
                </StatusBadge>

                <StatusBadge tone="neutral">
                  {TERMINAL_LABELS[stage.terminalType]}
                </StatusBadge>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className="size-4 rounded-full border"
                  style={{ backgroundColor: stage.color || "transparent" }}
                />
                <span className="text-xs text-muted-foreground">
                  ترتیب: {fa(stage.sortOrder)}
                </span>
              </div>

              {stage.description ? (
                <p className="mt-3 line-clamp-2 text-xs leading-6 text-muted-foreground">
                  {stage.description}
                </p>
              ) : null}

              {canManage ? (
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--app-divider)] pt-3 sm:flex">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditor(stage)}
                  >
                    <Pencil className="ms-2 size-4" />
                    ویرایش
                  </Button>
                  {stage.isActive ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setDeactivateTarget(stage)
                        setReplacementStageId("")
                      }}
                    >
                      <Ban className="ms-2 size-4" />
                      غیرفعال
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </SurfaceCard>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GitBranch}
            title="مرحله‌ای تعریف نشده است"
            description="برای شروع طراحی پایپ‌لاین، اولین مرحله را ایجاد کنید."
          />
        )}
      </ContentSection>

      <StageEditor
        key={editor === "NEW" ? "new-stage" : editor?.id ?? "closed-stage"}
        stage={editor}
        open={editor !== null}
        onClose={() => setEditor(null)}
        onSaved={async () => {
          setEditor(null)
          await onRefresh()
        }}
      />

      <Modal
        open={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        title={`غیرفعال‌سازی ${deactivateTarget?.label ?? ""}`}
        description="اگر فرصت فعالی در این مرحله وجود داشته باشد، مرحله جایگزین لازم است."
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-7 text-amber-900 dark:text-amber-200">
            این عملیات حذف فیزیکی نیست. اگر Stage در فرصت‌های فعال استفاده شود،
            Backend آن فرصت‌ها را به Stage جایگزین منتقل می‌کند.
          </div>

          <NativeSelect
            value={replacementStageId}
            onChange={(event) => setReplacementStageId(event.target.value)}
          >
            <option value="">بدون جایگزین</option>
            {stages
              .filter(
                (stage) => stage.isActive && stage.id !== deactivateTarget?.id
              )
              .map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
          </NativeSelect>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={() => setDeactivateTarget(null)}
            >
              انصراف
            </Button>
          <Button
            className="w-full sm:w-auto"
            variant="destructive"
            onClick={() => deactivateMutation.mutate()}
              disabled={deactivateMutation.isPending}
            >
              غیرفعال‌سازی
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

function StageEditor({
  stage,
  open,
  onClose,
  onSaved,
}: {
  stage: PipelineStage | "NEW" | null
  open: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const editing = stage !== null && stage !== "NEW"
  const item = editing ? stage : null

  const [code, setCode] = useState(item?.code ?? "")
  const [label, setLabel] = useState(item?.label ?? "")
  const [description, setDescription] = useState(item?.description ?? "")
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder ?? 0))
  const [color, setColor] = useState(item?.color ?? DEFAULT_PIPELINE_COLOR)
  const [isActive, setIsActive] = useState(item?.isActive ?? true)
  const [terminalType, setTerminalType] = useState<TerminalType>(
    item?.terminalType ?? "NONE"
  )
  const [isDefault, setIsDefault] = useState(item?.isDefault ?? false)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!label.trim()) throw new Error("عنوان مرحله الزامی است.")
      if (!editing && !code.trim()) throw new Error("کد مرحله الزامی است.")

      const common = {
        label: label.trim(),
        description: description.trim() || undefined,
        sortOrder: Number(sortOrder),
        color: color || undefined,
        isActive,
        isTerminal: terminalType !== "NONE",
        terminalType,
        isDefault,
      }

      if (!Number.isFinite(common.sortOrder)) {
        throw new Error("ترتیب نمایش نامعتبر است.")
      }

      if (item) return updatePipelineStage(item.id, common)

      return createPipelineStage({
        ...common,
        code: code.trim().toUpperCase().replace(/\s+/g, "_"),
      })
    },
    onSuccess: async () => {
      toast.success(item ? "مرحله ویرایش شد." : "مرحله ایجاد شد.")
      await onSaved()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "ذخیره مرحله انجام نشد.")),
  })

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? `ویرایش مرحله — ${item.label}` : "ایجاد مرحله جدید"}
      description="مرحله Default باید فعال و غیرنهایی باشد."
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="عنوان مرحله"
          />
          <Input
            value={code}
            disabled={Boolean(item)}
            dir="ltr"
            onChange={(event) => setCode(event.target.value)}
            placeholder="NEEDS_ASSESSMENT"
          />
          <Input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            placeholder="ترتیب"
          />
          <div className="flex gap-2">
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : DEFAULT_PIPELINE_COLOR}
              onChange={(event) => setColor(event.target.value.toUpperCase())}
              className="h-10 w-12 rounded-xl border border-input bg-background p-1"
            />
            <Input
              value={color}
              dir="ltr"
              onChange={(event) => setColor(event.target.value)}
              placeholder={DEFAULT_PIPELINE_COLOR}
            />
          </div>
        </div>

        <textarea
          value={description ?? ""}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-24 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          placeholder="توضیحات"
        />

        <NativeSelect
          value={terminalType}
          onChange={(event) =>
            setTerminalType(event.target.value as TerminalType)
          }
        >
          <option value="NONE">مرحله عادی</option>
          <option value="WON">برنده</option>
          <option value="LOST">از دست‌رفته</option>
          <option value="ON_HOLD">متوقف</option>
        </NativeSelect>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl bg-muted/35 p-4 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <span className="font-bold">فعال</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-muted/35 p-4 text-sm">
            <input
              type="checkbox"
              checked={isDefault}
              disabled={terminalType !== "NONE" || !isActive}
              onChange={(event) => setIsDefault(event.target.checked)}
            />
            <span className="font-bold">مرحله پیش‌فرض</span>
          </label>
        </div>

        <FormActions
          onCancel={onClose}
          pending={mutation.isPending}
          submitLabel="ذخیره مرحله"
        />
      </form>
    </Modal>
  )
}

function TransitionDesigner({
  stages,
  transitions,
  loading,
  error,
  canManage,
  onRefresh,
}: {
  stages: PipelineStage[]
  transitions: PipelineTransition[]
  loading: boolean
  error: boolean
  canManage: boolean
  onRefresh: () => Promise<void>
}) {
  const [view, setView] = useState<"matrix" | "list">("matrix")
  const [roleFilter, setRoleFilter] = useState<PipelineRole | "GENERAL">(
    "GENERAL"
  )
  const [editor, setEditor] = useState<PipelineTransition | "NEW" | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PipelineTransition | null>(
    null
  )

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePipelineTransition(id),
    onSuccess: async () => {
      toast.success("قانون انتقال حذف شد.")
      setDeleteTarget(null)
      await onRefresh()
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "حذف قانون انتقال انجام نشد.")),
  })

  const filteredRules = useMemo(
    () =>
      roleFilter === "GENERAL"
        ? transitions.filter((rule) => rule.role == null)
        : transitions.filter((rule) => rule.role === roleFilter),
    [transitions, roleFilter]
  )

  const activeStages = stages.filter((stage) => stage.isActive)

  const ruleMap = useMemo(() => {
    const map = new Map<string, PipelineTransition>()
    for (const rule of filteredRules) {
      map.set(`${rule.fromStageId ?? "START"}:${rule.toStageId}`, rule)
    }
    return map
  }, [filteredRules])

  const transitionFields = useMemo<EntityCardField<PipelineTransition>[]>(
    () => [
      {
        id: "from",
        label: "مرحله مبدأ",
        icon: GitBranch,
        render: (rule) => rule.fromStage?.label ?? "هر مرحله / شروع",
      },
      {
        id: "to",
        label: "مرحله مقصد",
        icon: GitBranch,
        render: (rule) => rule.toStage?.label ?? rule.toStageId,
      },
      {
        id: "role",
        label: "نقش مجاز",
        icon: ShieldCheck,
        render: (rule) => (rule.role ? ROLE_LABELS[rule.role] : "همه نقش‌ها"),
      },
    ],
    []
  )

  if (loading) {
    return <LoadingState rows={4} />
  }

  if (error) {
    return (
      <ErrorState
        title="دریافت قوانین انتقال انجام نشد"
        description="در دریافت قوانین پایپ‌لاین مشکلی رخ داد. دوباره تلاش کنید."
        retryLabel="تلاش دوباره"
        onRetry={() => void onRefresh()}
      />
    )
  }

  return (
    <>
      <DashboardToolbar
        title="نمایش و فیلتر قوانین"
        description="قانون ویژه هر نقش بر قانون عمومی اولویت دارد."
        icon={ArrowLeftRight}
      >
            <NativeSelect
              aria-label="فیلتر نقش"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as PipelineRole | "GENERAL")
              }
              className="col-span-2 min-w-0 sm:w-auto sm:min-w-[180px]"
            >
              <option value="GENERAL">قانون عمومی</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>

            <Button
              className="w-full sm:w-auto"
              variant={view === "matrix" ? "default" : "outline"}
              aria-pressed={view === "matrix"}
              onClick={() => setView("matrix")}
            >
              ماتریس
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant={view === "list" ? "default" : "outline"}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              لیست
            </Button>

            {canManage ? (
              <Button
                className="col-span-2 w-full sm:w-auto"
                onClick={() => setEditor("NEW")}
              >
                <Plus className="ms-2 size-4" />
                ایجاد قانون
              </Button>
            ) : null}
      </DashboardToolbar>

      <ContentSection
        title="قوانین انتقال"
        description={view === "matrix" ? "مقایسه مسیرهای مجاز و مسدود بین مراحل" : "فهرست عملیاتی قوانین انتقال"}
        icon={ArrowLeftRight}
      >

        {view === "matrix" ? (
          <div className="-mx-3 overflow-x-auto rounded-none border-y border-[var(--app-divider)] sm:mx-0 sm:rounded-2xl sm:border">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-muted/30">
                  <th className="sticky right-0 z-20 min-w-[140px] border-b border-l border-[var(--app-divider)] bg-muted p-3 text-right sm:min-w-[170px]">
                    از \ به
                  </th>
                  {activeStages.map((stage) => (
                    <th
                      key={stage.id}
                      className="min-w-[130px] border-b border-l border-[var(--app-divider)] p-3 text-center"
                    >
                      {stage.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeStages.map((from) => (
                  <tr key={from.id}>
                    <td className="sticky right-0 z-10 border-b border-l border-[var(--app-divider)] bg-[var(--app-surface)] p-3 font-bold">
                      {from.label}
                    </td>
                    {activeStages.map((to) => {
                      const rule = ruleMap.get(`${from.id}:${to.id}`)
                      const same = from.id === to.id

                      return (
                        <td
                          key={to.id}
                          className="border-b border-l border-[var(--app-divider)] p-2 text-center"
                        >
                          {same ? (
                            <span className="text-muted-foreground">—</span>
                          ) : rule ? (
                            <button
                              className={`inline-flex min-w-20 items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-bold ${
                                rule.isAllowed
                                  ? "bg-emerald-500/10 text-emerald-700"
                                  : "bg-red-500/10 text-red-700"
                              }`}
                              onClick={() => canManage && setEditor(rule)}
                            >
                              {rule.isAllowed ? (
                                <Check className="size-4" />
                              ) : (
                                <X className="size-4" />
                              )}
                              {rule.isAllowed ? "مجاز" : "مسدود"}
                            </button>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EntityCardList
            rows={filteredRules}
            fields={transitionFields}
            getRowKey={(rule) => rule.id}
            layout="row"
            density="compact"
            fieldsClassName="md:grid-cols-3"
            title={(rule) => `${rule.fromStage?.label ?? "هر مرحله / شروع"} ← ${rule.toStage?.label ?? rule.toStageId}`}
            subtitle={(rule) => rule.role ? ROLE_LABELS[rule.role] : "قانون عمومی برای همه نقش‌ها"}
            media={() => (
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]">
                <ArrowLeftRight className="size-5" />
              </span>
            )}
            badges={(rule) => (
              <StatusBadge tone={rule.isAllowed ? "success" : "error"}>
                {rule.isAllowed ? "مجاز" : "مسدود"}
              </StatusBadge>
            )}
            actions={(rule) => (
              <EntityRowActions
                presentation="buttons"
                actions={[
                  {
                    id: "edit",
                    label: "ویرایش",
                    icon: Pencil,
                    enabled: canManage,
                    onClick: () => setEditor(rule),
                  },
                  {
                    id: "delete",
                    label: "حذف",
                    icon: Trash2,
                    enabled: canManage,
                    tone: "danger",
                    onClick: () => setDeleteTarget(rule),
                  },
                ]}
              />
            )}
            emptyState={
              <EmptyState
                icon={ArrowLeftRight}
                title="قانونی برای این نقش ثبت نشده است"
                description="یک قانون جدید بسازید یا فیلتر نقش را تغییر دهید."
              />
            }
          />
        )}
      </ContentSection>

      <TransitionEditor
        key={editor === "NEW" ? `new-transition-${roleFilter}` : editor?.id ?? "closed-transition"}
        item={editor}
        stages={activeStages}
        open={editor !== null}
        initialRole={roleFilter === "GENERAL" ? null : roleFilter}
        onClose={() => setEditor(null)}
        onSaved={async () => {
          setEditor(null)
          await onRefresh()
        }}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="حذف قانون انتقال"
      >
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => setDeleteTarget(null)}
          >
            انصراف
          </Button>
          <Button
            className="w-full sm:w-auto"
            variant="destructive"
            onClick={() =>
              deleteTarget && deleteMutation.mutate(deleteTarget.id)
            }
            disabled={deleteMutation.isPending}
          >
            حذف قانون
          </Button>
        </div>
      </Modal>
    </>
  )
}

function TransitionEditor({
  item,
  stages,
  open,
  initialRole,
  onClose,
  onSaved,
}: {
  item: PipelineTransition | "NEW" | null
  stages: PipelineStage[]
  open: boolean
  initialRole: PipelineRole | null
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const editing = item !== null && item !== "NEW"
  const rule = editing ? item : null

  const [fromStageId, setFromStageId] = useState(rule?.fromStageId ?? "")
  const [toStageId, setToStageId] = useState(rule?.toStageId ?? "")
  const [role, setRole] = useState<PipelineRole | "">(
    rule?.role ?? initialRole ?? ""
  )
  const [isAllowed, setIsAllowed] = useState(rule?.isAllowed ?? true)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!toStageId) throw new Error("مرحله مقصد الزامی است.")
      if (fromStageId && fromStageId === toStageId) {
        throw new Error("مرحله مبدا و مقصد نمی‌تواند یکسان باشد.")
      }

      const payload = {
        fromStageId: fromStageId || null,
        toStageId,
        role: role || null,
        isAllowed,
      }

      if (rule) return updatePipelineTransition(rule.id, payload)
      return createPipelineTransition(payload)
    },
    onSuccess: async () => {
      toast.success(rule ? "قانون انتقال ویرایش شد." : "قانون انتقال ایجاد شد.")
      await onSaved()
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(
          error,
          "ذخیره قانون انجام نشد. ممکن است Rule مشابه از قبل وجود داشته باشد."
        )
      ),
  })

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={rule ? "ویرایش قانون انتقال" : "ایجاد قانون انتقال"}
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <NativeSelect
          value={fromStageId ?? ""}
          onChange={(event) => setFromStageId(event.target.value)}
        >
          <option value="">هر مرحله / شروع</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={toStageId}
          onChange={(event) => setToStageId(event.target.value)}
        >
          <option value="">انتخاب مرحله مقصد</option>
          {stages.map((stage) => (
            <option
              key={stage.id}
              value={stage.id}
              disabled={stage.id === fromStageId}
            >
              {stage.label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={role}
          onChange={(event) => setRole(event.target.value as PipelineRole | "")}
        >
          <option value="">همه نقش‌ها</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={isAllowed ? "yes" : "no"}
          onChange={(event) => setIsAllowed(event.target.value === "yes")}
        >
          <option value="yes">مجاز</option>
          <option value="no">مسدود</option>
        </NativeSelect>

        <div className="rounded-2xl bg-muted/35 p-4 text-xs leading-6 text-muted-foreground">
          Backend فعلی برای Transition فقط Base Roleهای ADMIN / MANAGER / REP /
          BOARDS را می‌پذیرد.
        </div>

        <FormActions
          onCancel={onClose}
          pending={mutation.isPending}
          submitLabel="ذخیره قانون"
        />
      </form>
    </Modal>
  )
}
