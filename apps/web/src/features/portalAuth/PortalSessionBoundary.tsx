import { useEffect, type ReactNode } from "react"
import { refreshPortalSession } from "./portalAuth.api"
import { usePortalAuthStore } from "./portalAuth.store"
export function PortalSessionBoundary({ children }: { children: ReactNode }) {
  const status = usePortalAuthStore((s) => s.status)
  useEffect(() => { if (status === "loading") void refreshPortalSession().catch(() => usePortalAuthStore.getState().clear()) }, [status])
  if (status === "loading") return <div className="grid min-h-svh place-items-center">در حال بررسی نشست پرتال…</div>
  return children
}
