import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "@/store/authStore"
import { uiText } from "@/config/uiText"
import { Button } from "@workspace/ui/components/button"
import { restoreSession, watchBrowserSession } from "../services/session.service"

export function SessionBoundary({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status)
  useEffect(() => {
    try {
      const stop = watchBrowserSession()
      void restoreSession()
      return stop
    } catch {
      useAuthStore.getState().setStatus("error")
    }
  }, [])
  if (status === "loading")
    return (
      <div role="status" className="grid min-h-svh place-items-center">
        {uiText.app.loading}
      </div>
    )
  if (status === "error")
    return (
      <main
        dir="rtl"
        className="grid min-h-svh place-content-center gap-4 p-6 text-center"
      >
        <p role="alert">{uiText.app.sessionUnavailable}</p>
        <Button onClick={() => void restoreSession()}>
          {uiText.common.retry}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            useAuthStore.getState().clearUser()
          }}
        >
          {uiText.app.login}
        </Button>
      </main>
    )
  return children
}
