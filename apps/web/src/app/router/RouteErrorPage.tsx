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
    <main className="grid min-h-svh place-items-center bg-[#EFF5FA] p-6">
      <div className="w-full max-w-xl rounded-[24px] border border-[#E4EAF3] bg-[#FCFCFF] p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FFDAD6] text-[#BA1A1A]">
          <AlertTriangle className="size-6" />
        </div>

        <h1 className="mt-5 text-xl font-bold text-[#0F172A]">
          {uiText.errors.route.title}
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#64748B]">
          {uiText.errors.route.description}
        </p>

        <Button
          className="mt-6 rounded-xl bg-[#0053B2] hover:bg-[#004A9F]"
          onClick={() => navigate("/dashboard", { replace: true })}
        >
          <ArrowRight className="size-4" />
          {uiText.errors.route.backToDashboard}
        </Button>
      </div>
    </main>
  )
}
