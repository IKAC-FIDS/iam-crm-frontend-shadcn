import { uiText } from "@/config/uiText"

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label={uiText.common.loading}
      className="grid animate-pulse gap-3"
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
