import { useEffect } from "react"
import { Building2, ClipboardList, LogOut, UserRound } from "lucide-react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import {
  listPortalCompanies,
  logoutPortal,
  switchPortalCompany,
} from "@/features/portalAuth/portalAuth.api"
import { usePortalAuthStore } from "@/features/portalAuth/portalAuth.store"
export function PortalShell() {
  const user = usePortalAuthStore((s) => s.user),
    company = usePortalAuthStore((s) => s.activeCompany),
    companies = usePortalAuthStore((s) => s.companies),
    navigate = useNavigate()
  useEffect(() => {
    void listPortalCompanies()
  }, [])
  return (
    <div className="min-h-svh bg-background" dir="rtl">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/portal/home" className="flex items-center gap-2 font-bold">
            <img
              src="/neshane-logo.png"
              alt="نشان"
              className="size-9 object-contain"
            />
            پرتال مشتریان
          </Link>
          <nav className="me-auto flex items-center gap-2">
            <Link
              to="/portal/home"
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              خانه
            </Link>
            <Link
              to="/portal/requests"
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <ClipboardList className="ms-1 inline size-4" />
              درخواست‌ها
            </Link>
            <Link
              to="/portal/account"
              className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
            >
              <UserRound className="ms-1 inline size-4" />
              حساب من
            </Link>
          </nav>
          {companies.length > 1 ? (
            <select
              aria-label="شرکت فعال"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
              value={company?.companyId}
              onChange={(e) => void switchPortalCompany(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.membershipId} value={c.companyId}>
                  {c.brandName || c.legalName}
                </option>
              ))}
            </select>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm">
              <Building2 className="size-4" />
              {company?.brandName || company?.legalName}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void logoutPortal().then(() => navigate("/portal/login"))
            }
          >
            <LogOut className="size-4" />
            خروج
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <Outlet context={{ user, company }} />
      </main>
    </div>
  )
}
