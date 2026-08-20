import { LogOut, ShieldCheck } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { useAuth } from "@/features/auth/hooks/useAuth"
import { useAuthStore } from "@/store/authStore"

export function DashboardPlaceholderPage() {
  const user = useAuthStore((state) => state.user)
  const { logout, isLoggingOut } = useAuth()

  return (
    <main className="min-h-svh bg-[#EFF5FA] p-4 sm:p-6">
      <div className="mx-auto grid max-w-5xl gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#0053B2] text-white">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">داشبورد</h1>
              <p className="mt-1 text-sm text-[#64748B]">
                ورود و مدیریت نشست با موفقیت فعال است.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isLoggingOut}
            onClick={() => void logout()}
          >
            <LogOut className="size-4" />
            {isLoggingOut ? "در حال خروج..." : "خروج"}
          </Button>
        </div>

        <Card className="border-[#E4EAF3] bg-[#FCFCFF]">
          <CardHeader>
            <CardTitle>اطلاعات کاربر جاری</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="grid gap-1 sm:grid-cols-[130px_1fr]">
              <span className="text-[#64748B]">نام</span>
              <span className="font-medium text-[#0F172A]">{user?.fullName}</span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[130px_1fr]">
              <span className="text-[#64748B]">ایمیل</span>
              <span dir="ltr" className="text-right font-medium text-[#0F172A]">
                {user?.email}
              </span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[130px_1fr]">
              <span className="text-[#64748B]">نقش</span>
              <span className="font-medium text-[#0F172A]">
                {user?.roleName || user?.role}
              </span>
            </div>
            <div className="grid gap-1 sm:grid-cols-[130px_1fr]">
              <span className="text-[#64748B]">تعداد مجوزها</span>
              <span className="font-medium text-[#0F172A]">
                {user?.permissions.length ?? 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
