import {
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"

import { uiText } from "@/config/uiText"

export function RouteErrorPage() {
  const navigate = useNavigate()

  return (
    <main className="grid min-h-svh place-items-center bg-[var(--app-background)] p-6">
      <div className="w-full max-w-xl rounded-[var(--app-radius-feature)] border border-[var(--app-divider)] bg-[var(--app-surface)] p-8 text-center shadow-[var(--app-shadow-elevated)]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--destructive-soft)] text-[var(--destructive)]">
          <AlertTriangle className="size-6" />
        </div>

        <h1 className="mt-5 text-xl font-bold text-[var(--app-heading)]">
          {uiText.errors.route.title}
        </h1>

        <p className="mt-3 text-sm leading-7 text-[var(--app-text-secondary)]">
          {uiText.errors.route.description}
        </p>

        <Button
          className="mt-6 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)]"
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          <ArrowRight className="size-4" />
          {uiText.errors.route.backToDashboard}
        </Button>
      </div>
    </main>
  )
}
