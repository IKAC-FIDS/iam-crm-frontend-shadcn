import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuth } from "../hooks/useAuth"
const schema=z.object({ email:z.string().email("Ø§ÛŒÙ…ÛŒÙ„ Ù†Ø§Ù…Ø¹ØªØ¨Ø± Ø§Ø³Øª"), password:z.string().min(6,"Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø­Ø¯Ø§Ù‚Ù„ Û¶ Ú©Ø§Ø±Ø§Ú©ØªØ± Ø¨Ø§Ø´Ø¯") })
type FormData=z.infer<typeof schema>
export function LoginPage(){
  const {login,isLoading}=useAuth(); const [show,setShow]=useState(false); const [error,setError]=useState<string|null>(null)
  const {register,handleSubmit,formState:{errors}}=useForm<FormData>({resolver:zodResolver(schema)})
  const onSubmit=async(data:FormData)=>{ try{setError(null); await login(data)}catch(e){setError(getApiErrorMessage(e,"Ø®Ø·Ø§ Ø¯Ø± ÙˆØ±ÙˆØ¯ Ø¨Ù‡ Ø³ÛŒØ³ØªÙ…"))} }
  return <main className="flex min-h-svh items-center justify-center p-4 sm:p-6" style={{background:"radial-gradient(circle at center, #D6E3FF 0%, #003F88 100%)"}}>
    <Card className="w-full max-w-[440px] border-[#E4EAF3] bg-[#FCFCFF] shadow-2xl">
      <CardHeader className="gap-2"><CardTitle className="text-2xl font-bold text-[#0F172A]">ÙˆØ±ÙˆØ¯</CardTitle><CardDescription>Ø¨Ø±Ø§ÛŒ ÙˆØ±ÙˆØ¯ Ø¨Ù‡ Ø³Ø§Ù…Ø§Ù†Ù‡ CRM Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø­Ø³Ø§Ø¨ Ø®ÙˆØ¯ Ø±Ø§ ÙˆØ§Ø±Ø¯ Ú©Ù†ÛŒØ¯.</CardDescription></CardHeader>
      <CardContent>{error&&<div role="alert" className="mb-4 rounded-md border border-[#BA1A1A]/20 bg-[#FFDAD6] px-3 py-2 text-sm text-[#BA1A1A]">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <div className="grid gap-2"><Label htmlFor="email">Ø§ÛŒÙ…ÛŒÙ„</Label><div className="relative"><Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input id="email" type="email" autoComplete="email" placeholder="your_mail@rsa.ir" dir="ltr" className="ps-9 text-left" aria-invalid={Boolean(errors.email)} {...register("email")}/></div>{errors.email&&<p className="text-xs text-destructive">{errors.email.message}</p>}</div>
          <div className="grid gap-2"><Label htmlFor="password">Ø±Ù…Ø² Ø¹Ø¨ÙˆØ±</Label><div className="relative"><LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input id="password" type={show?"text":"password"} autoComplete="current-password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" dir="ltr" className="px-9 text-left" aria-invalid={Boolean(errors.password)} {...register("password")}/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute end-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label={show?"Ù…Ø®ÙÛŒ Ú©Ø±Ø¯Ù† Ø±Ù…Ø² Ø¹Ø¨ÙˆØ±":"Ù†Ù…Ø§ÛŒØ´ Ø±Ù…Ø² Ø¹Ø¨ÙˆØ±"}>{show?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button></div>{errors.password&&<p className="text-xs text-destructive">{errors.password.message}</p>}</div>
          <button type="button" className="w-fit text-xs font-medium text-[#55677F] hover:text-[#003F88] hover:underline">Ø±Ù…Ø² Ø¹Ø¨ÙˆØ± Ø±Ø§ ÙØ±Ø§Ù…ÙˆØ´ Ú©Ø±Ø¯Ù‡â€ŒØ§ÛŒØ¯ØŸ</button>
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>{isLoading?"Ø¯Ø± Ø­Ø§Ù„ ÙˆØ±ÙˆØ¯...":"ÙˆØ±ÙˆØ¯"}</Button>
          <div className="rounded-md bg-[#EFF5FA] px-3 py-2 text-center text-xs text-[#64748B]">Passkey Ùˆ SSO Ø¯Ø± Ù…Ø±Ø­Ù„Ù‡ Ø¨Ø¹Ø¯ØŒ Ø¨Ø¹Ø¯ Ø§Ø² ØªØ³Øª Ù†Ø³Ø®Ù‡ HTTPØŒ ÙØ¹Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆÙ†Ø¯.</div>
        </form>
      </CardContent>
    </Card>
  </main>
}