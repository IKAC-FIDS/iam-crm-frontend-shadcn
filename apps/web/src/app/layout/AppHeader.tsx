import { Bell, ChevronLeft, LogOut, Settings } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/store/authStore"
import { getRoutePresentation } from "@/app/navigation/routeNavigation"

export function AppHeader() {
  const location = useLocation(); const navigate = useNavigate(); const user = useAuthStore((state) => state.user); const { logout, isLoggingOut } = useAuth(); const { title, breadcrumbs } = getRoutePresentation(location.pathname); const initial = user?.fullName?.trim().charAt(0) || "U"
  return (
    <header className="sticky top-0 z-20 border-b border-[#E4EAF3] bg-[#FCFCFF]/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger aria-label="باز و بسته کردن منوی اصلی" className="text-[#55677F]" />
        <div className="min-w-0 flex-1"><h1 className="truncate text-lg font-bold text-[#0F172A]">{title}</h1><nav className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-[#64748B]">{breadcrumbs.map((item, index) => <div key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">{index > 0 ? <ChevronLeft className="size-3 shrink-0" /> : null}{item.to ? <Link to={item.to} className="truncate hover:text-[#0053B2]">{item.label}</Link> : <span className="truncate">{item.label}</span>}</div>)}</nav></div>
        <Button type="button" variant="ghost" size="icon" className="text-[#55677F]" aria-label="اعلان‌ها" onClick={() => navigate("/notifications")}><Bell className="size-5" /></Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" variant="ghost" className="h-10 gap-2 rounded-xl px-2" />}>
            <div className="grid size-8 place-items-center rounded-full bg-[#D6E3FF] font-bold text-[#003F88]">{initial}</div>
            <div className="hidden min-w-0 text-start sm:grid"><span className="max-w-36 truncate text-sm font-medium text-[#0F172A]">{user?.fullName}</span><span className="max-w-36 truncate text-[11px] text-[#64748B]">{user?.roleName || user?.role}</span></div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" dir="rtl">
            <DropdownMenuItem onClick={() => navigate("/account/security")}><Settings className="size-4" />امنیت حساب</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={isLoggingOut} onClick={() => void logout()} className="text-[#BA1A1A]"><LogOut className="size-4" />خروج</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
