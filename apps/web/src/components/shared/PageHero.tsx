import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  ChevronLeft,
  Layers3,
  RefreshCcw,
} from "lucide-react"
import type { ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { getRoutePresentation } from "@/app/navigation/routeNavigation"
import { getRouteByPath } from "@/app/navigation/routeRegistry"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { SurfaceCard } from "./SurfaceCard"

export type PageBreadcrumbItem = {
  label: string
  href?: string
  onClick?: () => void
}

export type PageAccessBadge = {
  label: ReactNode
  icon: LucideIcon
}

export type PageAction = {
  id: string
  label: string
  icon?: LucideIcon
  onClick?: () => void
  href?: string
  variant?: "default" | "outline" | "ghost" | "destructive"
  disabled?: boolean
  loading?: boolean
  ariaLabel?: string
}

export type PageViewOption = {
  id: string
  label: string
  icon?: LucideIcon
}

export type PageHeroFact = {
  id: string
  label: ReactNode
  value: ReactNode
  icon?: LucideIcon
  href?: string
  onClick?: () => void
  tone?: "default" | "primary" | "success" | "warning" | "danger"
}

export type PageHeroProps = {
  // Mandatory identity/navigation contract
  title: ReactNode
  description: ReactNode
  breadcrumbs?: PageBreadcrumbItem[] | ReactNode
  accessBadge?: PageAccessBadge
  onBack?: () => void
  backFallback?: string
  onRefresh?: () => void | Promise<unknown>
  refreshing?: boolean

  // Optional page-specific capabilities
  metadata?: ReactNode
  facts?: PageHeroFact[]
  primaryAction?:
    | PageAction
    | {
        label: string
        onClick: () => void
        icon?: LucideIcon
        disabled?: boolean
      }
  secondaryActions?: PageAction[]
  viewOptions?: PageViewOption[]
  activeView?: string
  onViewChange?: (id: string) => void
  filters?: ReactNode
  tabs?: ReactNode
  extraActions?: ReactNode
  className?: string

  /** @deprecated Use accessBadge. */
  eyebrow?: ReactNode
  /** @deprecated Use accessBadge.icon. */
  icon?: LucideIcon
  /** @deprecated Use primaryAction, secondaryActions or viewOptions. */
  actions?: ReactNode
}

function safeParent(pathname: string, routePath?: string) {
  if (routePath && pathname !== routePath) return routePath

  const parts = pathname.split("/").filter(Boolean)

  if (parts.length > 2) {
    return `/${parts.slice(0, -1).join("/")}`
  }

  if (pathname.startsWith("/technical/")) {
    return "/technical/library"
  }

  return "/dashboard"
}

function actionMotionClass() {
  return [
    "rounded-xl",
    "transition-[transform,box-shadow,background-color,border-color,color] duration-200",
    "motion-safe:hover:-translate-y-px",
    "motion-safe:hover:shadow-sm",
    "motion-safe:active:translate-y-0",
    "motion-safe:active:scale-[.98]",
  ].join(" ")
}

function ActionButton({ action }: { action: PageAction }) {
  const Icon = action.icon

  const content = (
    <>
      {action.loading ? (
        <RefreshCcw className="size-4 motion-safe:animate-spin" />
      ) : Icon ? (
        <Icon className="size-4" />
      ) : null}
      {action.label}
    </>
  )

  if (action.href) {
    return (
      <Button
        variant={action.variant}
        disabled={action.disabled || action.loading}
        className={actionMotionClass()}
        render={
          <Link
            to={action.href}
            aria-label={action.ariaLabel || action.label}
          />
        }
      >
        {content}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={action.variant}
      disabled={action.disabled || action.loading}
      aria-label={action.ariaLabel || action.label}
      onClick={action.onClick}
      className={actionMotionClass()}
    >
      {content}
    </Button>
  )
}

function factToneClass(tone: PageHeroFact["tone"]) {
  switch (tone) {
    case "primary":
      return "border-[var(--app-primary)]/15 bg-[var(--app-primary-soft)]/45"
    case "success":
      return "border-[var(--success)]/15 bg-[var(--success-light)]/55"
    case "warning":
      return "border-[var(--warning)]/15 bg-[var(--warning-light)]/55"
    case "danger":
      return "border-[var(--destructive)]/15 bg-[var(--destructive-soft)]/55"
    default:
      return "border-[var(--app-divider)] bg-[var(--app-background)]/72"
  }
}

function FactItem({ fact }: { fact: PageHeroFact }) {
  const Icon = fact.icon
  const content = (
    <>
      {Icon ? (
        <Icon className="mt-0.5 size-4 shrink-0 text-[var(--app-primary)]" />
      ) : null}
      <span className="min-w-0">
        <span className="block text-[11px] leading-5 text-[var(--app-text-secondary)]">
          {fact.label}
        </span>
        <strong className="mt-0.5 block min-w-0 break-words text-xs font-bold text-[var(--app-heading)]">
          {fact.value}
        </strong>
      </span>
    </>
  )

  const className = cn(
    "flex min-w-0 items-start gap-2 rounded-xl border px-3 py-2.5",
    "transition-[transform,box-shadow,border-color] duration-200",
    "motion-safe:hover:-translate-y-px motion-safe:hover:shadow-sm",
    factToneClass(fact.tone),
  )

  if (fact.href) {
    return (
      <Link to={fact.href} className={className}>
        {content}
      </Link>
    )
  }

  if (fact.onClick) {
    return (
      <button type="button" onClick={fact.onClick} className={className}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

export function PageHero({
  title,
  description,
  eyebrow,
  icon,
  actions,
  primaryAction,
  secondaryActions = [],
  breadcrumbs,
  accessBadge,
  metadata,
  facts = [],
  onBack,
  backFallback,
  onRefresh,
  refreshing = false,
  viewOptions,
  activeView,
  onViewChange,
  filters,
  tabs,
  extraActions,
  className,
}: PageHeroProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const routePresentation = getRoutePresentation(location.pathname)
  const currentRoute = getRouteByPath(location.pathname)

  const BadgeIcon = accessBadge?.icon || icon || Layers3
  const badgeLabel =
    accessBadge?.label || eyebrow || routePresentation.title

  const inferredBreadcrumbs: PageBreadcrumbItem[] =
    routePresentation.breadcrumbs.map((item) => ({
      label: item.label,
      href: item.to,
    }))

  if (
    currentRoute &&
    location.pathname !== currentRoute.path &&
    typeof title === "string"
  ) {
    inferredBreadcrumbs.push({ label: title })
  }

  const breadcrumbItems = Array.isArray(breadcrumbs)
    ? breadcrumbs
    : inferredBreadcrumbs

  const mainAction: PageAction | undefined = primaryAction
    ? { id: "primary", variant: "default", ...primaryAction }
    : undefined

  const refresh = async () => {
    if (refreshing) return

    if (onRefresh) {
      await onRefresh()
    } else {
      window.location.reload()
    }
  }

  return (
    <SurfaceCard
      className={cn(
        "relative overflow-hidden rounded-[var(--app-radius-hero)] px-4 py-5 sm:px-7 sm:py-6",
        className,
      )}
    >
      <div
        data-testid="page-hero-accent"
        className="pointer-events-none absolute -end-20 -top-24 size-64 rounded-full bg-[var(--app-primary-soft)] blur-3xl"
      />
      <div className="pointer-events-none absolute -bottom-24 start-1/4 size-52 rounded-full bg-[var(--info-light)]/45 blur-3xl" />

      <div className="relative grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <nav
            aria-label="مسیر صفحه"
            className="mb-3 flex min-w-0 flex-wrap items-center gap-1 text-xs text-[var(--app-text-secondary)]"
          >
            {breadcrumbItems.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className="flex min-w-0 items-center gap-1"
              >
                {index ? (
                  <ChevronLeft
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  />
                ) : null}

                {item.href ? (
                  <Link
                    to={item.href}
                    className="truncate transition-colors hover:text-[var(--app-primary)]"
                  >
                    {item.label}
                  </Link>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="truncate transition-colors hover:text-[var(--app-primary)]"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="truncate">{item.label}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="ui-eyebrow mb-3 inline-flex max-w-full items-center gap-2">
            <BadgeIcon
              className="size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">{badgeLabel}</span>
          </div>

          <h1 className="ui-page-title break-words">{title}</h1>

          <div className="ui-body mt-2 line-clamp-2 max-w-3xl">
            {description ||
              "اطلاعات و عملیات این بخش را مشاهده و مدیریت کنید."}
          </div>

          {metadata ? (
            <div className="mt-3 flex flex-wrap gap-2">{metadata}</div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:items-end">
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="بازگشت"
              onClick={
                onBack ||
                (() =>
                  navigate(
                    backFallback ||
                      safeParent(location.pathname, currentRoute?.path),
                  ))
              }
              className={actionMotionClass()}
            >
              <ArrowRight className="size-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="به‌روزرسانی"
              disabled={refreshing}
              onClick={() => void refresh()}
              className={actionMotionClass()}
            >
              <RefreshCcw
                className={cn(
                  "size-4",
                  refreshing && "motion-safe:animate-spin",
                )}
              />
            </Button>

            {viewOptions?.length ? (
              <div
                role="group"
                aria-label="نوع نمایش"
                className="flex flex-wrap rounded-xl border border-[var(--app-divider)] bg-[var(--app-background)] p-1"
              >
                {viewOptions.map((option) => {
                  const ViewIcon = option.icon
                  const selected = option.id === activeView

                  return (
                    <Button
                      key={option.id}
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "ghost"}
                      aria-pressed={selected}
                      onClick={() => onViewChange?.(option.id)}
                      className={cn("rounded-lg", actionMotionClass())}
                    >
                      {ViewIcon ? (
                        <ViewIcon className="size-4" />
                      ) : null}
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            ) : null}
          </div>

          {extraActions}
        </div>

        {facts.length ? (
          <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3 xl:grid-cols-4">
            {facts.map((fact) => (
              <FactItem key={fact.id} fact={fact} />
            ))}
          </div>
        ) : null}

        {actions || secondaryActions.length || mainAction ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 lg:col-span-2">
            {mainAction ? <ActionButton action={mainAction} /> : null}

            {secondaryActions.map((action) => (
              <ActionButton key={action.id} action={action} />
            ))}

            {actions}
          </div>
        ) : null}

        {filters ? (
          <div className="min-w-0 lg:col-span-2">{filters}</div>
        ) : null}

        {tabs ? (
          <div className="min-w-0 lg:col-span-2">{tabs}</div>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
