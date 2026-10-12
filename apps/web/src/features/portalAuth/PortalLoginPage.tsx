import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { loginPortal } from "./portalAuth.api"

export function PortalLoginPage() {
  const navigate = useNavigate(), [email, setEmail] = useState(""), [password, setPassword] = useState(""), [error, setError] = useState<string | null>(null), [pending, setPending] = useState(false)
  async function submit(e: React.FormEvent) { e.preventDefault(); setPending(true); setError(null); try { const result = await loginPortal(email, password); navigate("requiresCompanySelection" in result ? "/portal/select-company" : "/portal/home", { replace: true }) } catch (err) { setError(getApiErrorMessage(err, "ورود به پرتال انجام نشد")) } finally { setPending(false) } }
  return <main className="grid min-h-svh place-items-center bg-background p-5" dir="rtl"><section className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-[var(--app-shadow-card)] sm:p-8"><img src="/neshane-logo.png" alt="نشان" className="mb-6 size-14 object-contain"/><h1 className="text-2xl font-bold">ورود به پرتال مشتریان</h1><p className="mt-2 text-sm text-muted-foreground">برای دسترسی به شرکت‌ها و حساب پرتال خود وارد شوید.</p>{error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<form onSubmit={submit} className="mt-6 grid gap-4"><div className="grid gap-2"><Label htmlFor="portal-email">ایمیل</Label><Input id="portal-email" dir="ltr" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div><div className="grid gap-2"><Label htmlFor="portal-password">رمز عبور</Label><Input id="portal-password" dir="ltr" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8}/></div><Button disabled={pending} className="mt-2">{pending ? "در حال ورود…" : "ورود به پرتال"}</Button></form></section></main>
}
