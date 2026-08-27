import {
  ArrowLeftRight,
  Ban,
  Check,
  GitBranch,
  GripVertical,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  X,
} from "lucide-react"
import { useMemo, useState, type DragEvent, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

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

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  width = "max-w-2xl",
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  width?: string
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-end bg-black/25 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-4"
      dir="rtl"
    >
      <button
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="بستن"
      />
      <section
        className={`relative z-10 max-h-[calc(100dvh-1rem)] w-full ${width} overflow-y-auto overscroll-contain rounded-t-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[92vh] sm:rounded-[28px] sm:p-5`}
      >
        <h2 className="text-xl font-black">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
        <div className="mt-5">{children}</div>
      </section>
    </div>
  )
}

function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20 ${props.className ?? ""}`}
    />
  )
}

function Stat({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string
  value: string
  helper: string
  icon: typeof GitBranch
}) {
  return (
    <article className="rounded-[20px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-[var(--app-shadow-card)] sm:rounded-[24px] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {helper}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--app-primary-soft)] p-3 text-[var(--app-primary)]">
          <Icon className="size-5" />
        </div>
      </div>
    </article>
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
    <div className="grid min-w-0 gap-4 sm:gap-5" dir="rtl">
      <section className="relative overflow-hidden rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] px-4 py-5 shadow-[var(--app-shadow-card)] sm:rounded-[30px] sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute -end-20 -top-24 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--app-divider)] bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-4" />
              Pipeline Administration
            </div>
            <h1 className="text-xl font-black sm:text-3xl">
              طراح پایپ‌لاین فروش
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              مراحل فروش، ترتیب نمایش، وضعیت‌های نهایی و قوانین مجاز انتقال بین
              مراحل را مدیریت کنید.
            </p>
          </div>

          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={() => void refresh()}
          >
            <RefreshCcw className="ms-2 size-4" />
            به‌روزرسانی
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <Stat
          title="کل مراحل"
          value={fa(stages.length)}
          helper="شامل فعال و غیرفعال"
          icon={GitBranch}
        />
        <Stat
          title="مراحل فعال"
          value={fa(activeStages.length)}
          helper="قابل استفاده در فرصت‌ها"
          icon={ShieldCheck}
        />
        <Stat
          title="مراحل نهایی"
          value={fa(terminalStages.length)}
          helper="Won / Lost / On Hold"
          icon={Trophy}
        />
        <Stat
          title="مرحله پیش‌فرض"
          value={defaultStage?.label ?? "—"}
          helper={defaultStage?.code ?? "تعریف نشده"}
          icon={ShieldCheck}
        />
      </section>

      <section className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-2 shadow-[var(--app-shadow-card)]">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {canViewStages ? (
            <Button
              className="min-w-0 px-2 sm:px-4"
              variant={tab === "stages" ? "default" : "ghost"}
              onClick={() => setTab("stages")}
            >
              <GitBranch className="ms-2 size-4" />
              مراحل پایپ‌لاین
            </Button>
          ) : null}

          {canViewTransitions ? (
            <Button
              className="min-w-0 px-2 sm:px-4"
              variant={tab === "transitions" ? "default" : "ghost"}
              onClick={() => setTab("transitions")}
            >
              <ArrowLeftRight className="ms-2 size-4" />
              قوانین انتقال
            </Button>
          ) : null}
        </div>
      </section>

      {tab === "stages" ? (
        <StagesDesigner
          stages={stages}
          loading={stagesQuery.isLoading}
          error={stagesQuery.isError}
          canManage={canManageStages}
          onRefresh={refresh}
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
    </div>
  )
}

function StagesDesigner({
  stages,
  loading,
  error,
  canManage,
  onRefresh,
}: {
  stages: PipelineStage[]
  loading: boolean
  error: boolean
  canManage: boolean
  onRefresh: () => Promise<void>
}) {
  const [editor, setEditor] = useState<PipelineStage | "NEW" | null>(null)
  const [deactivateTarget, setDeactivateTarget] =
    useState<PipelineStage | null>(null)
  const [replacementStageId, setReplacementStageId] = useState("")
  const [draggedId, setDraggedId] = useState<string | null>(null)
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
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", id)
  }

  const dropOn = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = draggedId || event.dataTransfer.getData("text/plain")
    setDraggedId(null)
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

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        در حال دریافت مراحل...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-red-600">
        دریافت مراحل پایپ‌لاین با خطا مواجه شد.
      </div>
    )
  }

  return (
    <>
      <section className="min-w-0 rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)] sm:rounded-[26px] sm:p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-black">جریان مراحل</h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              برای تغییر ترتیب، کارت‌ها را Drag & Drop کنید.
            </p>
          </div>

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

            {canManage ? (
              <Button
                className="col-span-2 w-full sm:w-auto"
                onClick={() => setEditor("NEW")}
              >
                <Plus className="ms-2 size-4" />
                ایجاد مرحله
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {displayed.map((stage, index) => (
            <article
              key={stage.id}
              draggable={canManage}
              onDragStart={(event) => startDrag(event, stage.id)}
              onDragOver={(event) => canManage && event.preventDefault()}
              onDrop={(event) => dropOn(event, stage.id)}
              className={`min-w-0 rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-4 shadow-sm ${
                draggedId === stage.id ? "opacity-50" : ""
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
                      className="mt-1 block truncate text-[11px] text-muted-foreground"
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
                  <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-bold text-violet-700">
                    پیش‌فرض
                  </span>
                ) : null}

                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                    stage.isActive
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stage.isActive ? "فعال" : "غیرفعال"}
                </span>

                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground">
                  {TERMINAL_LABELS[stage.terminalType]}
                </span>
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
            </article>
          ))}
        </div>
      </section>

      <StageEditor
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
  const [color, setColor] = useState(item?.color ?? "#64748B")
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
      <div className="grid gap-4">
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
              value={/^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#64748B"}
              onChange={(event) => setColor(event.target.value.toUpperCase())}
              className="h-10 w-12 rounded-xl border border-input bg-background p-1"
            />
            <Input
              value={color}
              dir="ltr"
              onChange={(event) => setColor(event.target.value)}
              placeholder="#64748B"
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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={onClose}
          >
            انصراف
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            ذخیره
          </Button>
        </div>
      </div>
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

  if (loading) {
    return (
      <div className="grid min-h-64 place-items-center text-sm text-muted-foreground">
        در حال دریافت قوانین انتقال...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center text-red-600">
        دریافت قوانین انتقال با خطا مواجه شد.
      </div>
    )
  }

  return (
    <>
      <section className="min-w-0 rounded-[22px] border border-[var(--app-divider)] bg-[var(--app-surface)] p-3 shadow-[var(--app-shadow-card)] sm:rounded-[26px] sm:p-4">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="font-black">قوانین انتقال</h2>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              Rule مخصوص Role بر Rule عمومی اولویت دارد.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <NativeSelect
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
              onClick={() => setView("matrix")}
            >
              ماتریس
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant={view === "list" ? "default" : "outline"}
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
          </div>
        </div>

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
          <div className="grid gap-3">
            {filteredRules.length ? (
              filteredRules.map((rule) => (
                <article
                  key={rule.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[var(--app-divider)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-bold">
                      <span>{rule.fromStage?.label ?? "هر مرحله / شروع"}</span>
                      <ArrowLeftRight className="size-4 text-muted-foreground" />
                      <span>{rule.toStage?.label ?? rule.toStageId}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {rule.role ? ROLE_LABELS[rule.role] : "همه نقش‌ها"} •{" "}
                      {rule.isAllowed ? "مجاز" : "مسدود"}
                    </div>
                  </div>

                  {canManage ? (
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditor(rule)}
                      >
                        <Pencil className="ms-2 size-4" />
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(rule)}
                      >
                        <Trash2 className="ms-2 size-4 text-red-600" />
                        حذف
                      </Button>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="grid min-h-40 place-items-center text-sm text-muted-foreground">
                قانونی برای این نقش ثبت نشده است.
              </div>
            )}
          </div>
        )}
      </section>

      <TransitionEditor
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
      <div className="grid gap-4">
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

        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onClick={onClose}
          >
            انصراف
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            ذخیره قانون
          </Button>
        </div>
      </div>
    </Modal>
  )
}
