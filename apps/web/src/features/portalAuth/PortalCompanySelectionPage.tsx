import { useNavigate } from "react-router-dom"
import { Building2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { usePortalAuthStore } from "./portalAuth.store"
import { selectPortalCompany } from "./portalAuth.api"
export function PortalCompanySelectionPage() {
  const companies = usePortalAuthStore(s=>s.companies), navigate=useNavigate()
  return <main className="grid min-h-svh place-items-center bg-background p-5" dir="rtl"><section className="w-full max-w-2xl rounded-3xl border bg-card p-6"><h1 className="text-2xl font-bold">انتخاب شرکت</h1><p className="mt-2 text-sm text-muted-foreground">شرکت فعال این نشست را انتخاب کنید.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{companies.map(c=><Button key={c.membershipId} variant="outline" className="h-auto justify-start gap-3 p-4 text-start" onClick={()=>void selectPortalCompany(c.companyId).then(()=>navigate("/portal/home",{replace:true}))}><Building2 className="size-5"/><span><span className="block font-semibold">{c.brandName||c.legalName}</span><span className="text-xs text-muted-foreground">{c.role==="CUSTOMER_ADMIN"?"مدیر پرتال":"کاربر پرتال"}</span></span></Button>)}</div></section></main>
}
