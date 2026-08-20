import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"

import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"

const dashboardText = uiText.dashboard

export function DashboardPlaceholderPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-[24px] border border-[#D6E3FF] bg-[#FCFCFF] shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -end-24 -top-24 size-80 rounded-full bg-[#D6E3FF]/55 blur-3xl" />
          <div className="absolute -bottom-40 start-24 size-72 rounded-full bg-[#D0E5FB]/40 blur-3xl" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0053B2]/10 bg-[#D6E3FF]/70 px-3 py-1.5 text-xs font-medium text-[#003F88]">
              <Sparkles className="size-3.5" />
              {dashboardText.welcomeBadge}
            </div>

            <h2 className="text-2xl font-bold leading-relaxed text-[#0F172A] sm:text-3xl">
              {dashboardText.welcomeTitlePrefix}
              <span className="text-[#0053B2]">
                {" "}
                {user?.fullName}
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748B]">
              {dashboardText.welcomeDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="rounded-xl bg-[#0053B2] hover:bg-[#004A9F]"
                onClick={() => navigate("/opportunities")}
              >
                {dashboardText.actions.opportunities}
                <ArrowLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                className="rounded-xl border-[#E4EAF3] bg-[#FCFCFF] text-[#55677F]"
                onClick={() => navigate("/activities")}
              >
                {dashboardText.actions.activities}
              </Button>
            </div>
          </div>

          <div className="hidden lg:grid lg:place-items-center">
            <div className="relative grid size-32 place-items-center rounded-[32px] bg-gradient-to-br from-[#0053B2] to-[#003F88] text-white shadow-[0_24px_60px_rgba(0,83,178,0.28)]">
              <BarChart3 className="size-14" />

              <div className="absolute -bottom-3 -start-3 grid size-11 place-items-center rounded-2xl border-4 border-[#FCFCFF] bg-[#D6E3FF] text-[#0053B2] shadow-md">
                <BriefcaseBusiness className="size-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="relative overflow-hidden rounded-[20px] border-[#E4EAF3] bg-[#FCFCFF] shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <CardContent className="relative flex min-h-48 items-center gap-5 p-6 sm:p-8">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#D6E3FF] text-[#0053B2]">
            <BarChart3 className="size-6" />
          </div>

          <div>
            <h3 className="font-bold text-[#0F172A]">
              {dashboardText.nextStep.title}
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#64748B]">
              {dashboardText.nextStep.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
