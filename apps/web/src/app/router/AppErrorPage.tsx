import { AlertTriangle } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { uiText } from "@/config/uiText"

export function AppErrorPage({
  status,
  message,
  onRetry,
}: {
  status?: number
  message?: string
  onRetry?: () => void
}) {
  const title =
    status === 403
      ? uiText.app.forbiddenTitle
      : status === 404
        ? uiText.app.notFoundTitle
        : uiText.errors.route.title
  const description =
    message ??
    (status === 403
      ? uiText.app.forbidden
      : status === 404
        ? uiText.app.notFound
        : uiText.errors.route.description)
  return (
    <main
      dir="rtl"
      className="grid min-h-[60vh] place-items-center bg-[var(--app-background)] p-6"
    >
      <section
        role="alert"
        className="w-full max-w-xl rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center"
      >
        <AlertTriangle className="mx-auto size-10 text-[var(--destructive)]" />
        <h1 className="mt-5 text-xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--app-text-secondary)]">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {onRetry && <Button onClick={onRetry}>{uiText.common.retry}</Button>}
          <a
            href="/dashboard"
            className="self-center text-sm text-[var(--app-primary)]"
          >
            {uiText.errors.route.backToDashboard}
          </a>
        </div>
      </section>
    </main>
  )
}
