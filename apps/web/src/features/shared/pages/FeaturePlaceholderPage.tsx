import {
  Construction,
  Sparkles,
} from "lucide-react"

import { useLocation } from "react-router-dom"

import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"

import {
  getRoutePresentation,
} from "@/app/navigation/routeNavigation"

export function FeaturePlaceholderPage() {
  const location = useLocation()

  const { title } =
    getRoutePresentation(location.pathname)

  return (
    <Card className="relative overflow-hidden rounded-[24px] border-[#E4EAF3] bg-[#FCFCFF] shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-[#D6E3FF]/60 blur-3xl" />

      <CardContent className="relative flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-[#D6E3FF] text-[#0053B2]">
          <Construction className="size-6" />
        </div>

        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#EFF5FA] px-3 py-1 text-[11px] font-medium text-[#64748B]">
          <Sparkles className="size-3" />
          در حال توسعه
        </div>

        <h2 className="text-xl font-bold text-[#0F172A]">
          {title}
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-[#64748B]">
          پوسته این بخش آماده شده است. قابلیت‌های عملیاتی و اتصال به API
          در مراحل بعدی به این صفحه اضافه خواهد شد.
        </p>
      </CardContent>
    </Card>
  )
}