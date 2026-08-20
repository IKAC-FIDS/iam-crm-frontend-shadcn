import { Construction } from "lucide-react"
import { useLocation } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { getRoutePresentation } from "@/app/navigation/routeNavigation"

export function FeaturePlaceholderPage() {
  const location = useLocation(); const { title } = getRoutePresentation(location.pathname)
  return <Card className="border-[#E4EAF3] bg-[#FCFCFF] shadow-none"><CardHeader><div className="mb-2 grid size-11 place-items-center rounded-xl bg-[#D6E3FF] text-[#0053B2]"><Construction className="size-5" /></div><CardTitle className="text-xl text-[#0F172A]">{title}</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-[#64748B]">پوسته اصلی این بخش آماده شده است. محتوای عملیاتی این صفحه در مرحله بعد با API و منطق نسخه فعلی CRM یکپارچه خواهد شد.</p></CardContent></Card>
}
