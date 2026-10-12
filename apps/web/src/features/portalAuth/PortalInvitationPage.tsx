import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { acceptPortalInvitation } from "./portalAuth.api"
export function PortalInvitationPage() {
 const {token=""}=useParams(), navigate=useNavigate(), [fullName,setFullName]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState<string|null>(null),[pending,setPending]=useState(false)
 async function submit(e:React.FormEvent){e.preventDefault();setPending(true);setError(null);try{await acceptPortalInvitation(token,password,fullName||undefined);navigate("/portal/home",{replace:true})}catch(err){setError(getApiErrorMessage(err,"فعال‌سازی حساب انجام نشد"))}finally{setPending(false)}}
 return <main className="grid min-h-svh place-items-center bg-background p-5" dir="rtl"><section className="w-full max-w-md rounded-3xl border bg-card p-6"><h1 className="text-2xl font-bold">فعال‌سازی حساب پرتال</h1><p className="mt-2 text-sm text-muted-foreground">برای حساب جدید نام و رمز عبور را وارد کنید؛ کاربران موجود رمز فعلی خود را وارد کنند.</p>{error&&<p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<form className="mt-6 grid gap-4" onSubmit={submit}><div className="grid gap-2"><Label>نام و نام خانوادگی (حساب جدید)</Label><Input value={fullName} onChange={e=>setFullName(e.target.value)}/></div><div className="grid gap-2"><Label>رمز عبور</Label><Input dir="ltr" type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></div><Button disabled={pending}>{pending?"در حال بررسی…":"فعال‌سازی امن"}</Button></form></section></main>
}
