import { uiText } from "@/config/uiText"

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label={uiText.common.loading}
      aria-live="polite"
      className="grid auto-rows-max content-start animate-pulse gap-3 motion-reduce:animate-none"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-20 rounded-[var(--app-radius-card)] bg-[var(--secondary)]/70"
        />
      ))}
    </div>
  )
}
