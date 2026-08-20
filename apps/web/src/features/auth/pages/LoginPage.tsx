import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuth } from "../hooks/useAuth"

const loginSchema = z.object({
  email: z.string().email("ایمیل واردشده معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
})

type LoginFormData = z.infer<typeof loginSchema>

const highlights = [
  "مدیریت متمرکز ارتباط با مشتری",
  "کنترل دسترسی مبتنی بر نقش و مجوز",
  "زیرساخت آماده برای ورود بدون گذرواژه",
]

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "ورود به سامانه انجام نشد"))
    }
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#EFF5FA]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -start-24 -top-24 size-80 rounded-full bg-[#D6E3FF] blur-3xl" />
        <div className="absolute -bottom-32 -end-20 size-96 rounded-full bg-[#1371D3]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-svh max-w-[1500px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden overflow-hidden p-8 lg:flex xl:p-12">
          <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[2rem] bg-[#003F88] p-10 text-white shadow-2xl xl:p-14">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -start-16 top-24 size-72 rounded-full bg-[#0053B2] blur-3xl" />
              <div className="absolute bottom-0 end-0 size-80 rounded-full bg-[#1371D3]/40 blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />
            </div>

            <div className="relative">
              <div className="mb-10 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="grid size-10 place-items-center rounded-xl bg-white text-[#0053B2]">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold">NESHANE CRM</div>
                  <div className="text-xs text-white/65">
                    فضای کاری امن و یکپارچه
                  </div>
                </div>
              </div>

              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80">
                  <Sparkles className="size-3.5" />
                  تجربه جدید مدیریت فروش
                </div>

                <h1 className="text-4xl font-bold leading-[1.35] xl:text-5xl">
                  ارتباط با مشتری،
                  <br />
                  منسجم‌تر و هوشمندتر
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-7 text-white/70 xl:text-base">
                  محیطی یکپارچه برای مدیریت فرصت‌ها، مشتریان، فعالیت‌ها و
                  تصمیم‌های فروش با کنترل دسترسی سازمانی.
                </p>
              </div>
            </div>

            <div className="relative grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-[#D6E3FF]" />
                  <span className="text-sm text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-16">
          <div className="w-full max-w-[460px]">
            <div className="mb-7 lg:hidden">
              <div className="inline-flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-[#0053B2] text-white shadow-lg shadow-[#0053B2]/20">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <div className="font-bold text-[#0F172A]">NESHANE CRM</div>
                  <div className="text-xs text-[#64748B]">
                    فضای کاری امن و یکپارچه
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-[#E4EAF3] bg-[#FCFCFF]/95 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur">
              <CardHeader className="gap-2 pb-2">
                <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-[#D6E3FF] text-[#0053B2]">
                  <LockKeyhole className="size-6" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-[#0F172A]">
                  خوش آمدید
                </CardTitle>
                <CardDescription className="leading-6 text-[#64748B]">
                  برای ورود به سامانه، اطلاعات حساب کاربری خود را وارد کنید.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-5">
                {error ? (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-[#BA1A1A]/15 bg-[#FFDAD6] px-4 py-3 text-sm leading-6 text-[#BA1A1A]"
                  >
                    {error}
                  </div>
                ) : null}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid gap-5"
                  noValidate
                >
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[#0F172A]">
                      ایمیل سازمانی
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="your_mail@rsa.ir"
                        dir="ltr"
                        className="h-11 rounded-xl border-[#E4EAF3] bg-white ps-10 text-left focus-visible:ring-[#0053B2]"
                        aria-invalid={Boolean(errors.email)}
                        {...register("email")}
                      />
                    </div>
                    {errors.email ? (
                      <p className="text-xs text-[#BA1A1A]">
                        {errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor="password" className="text-[#0F172A]">
                        رمز عبور
                      </Label>
                      <button
                        type="button"
                        className="text-xs font-medium text-[#55677F] transition hover:text-[#0053B2]"
                      >
                        رمز عبور را فراموش کرده‌اید؟
                      </button>
                    </div>

                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        dir="ltr"
                        className="h-11 rounded-xl border-[#E4EAF3] bg-white px-10 text-left focus-visible:ring-[#0053B2]"
                        aria-invalid={Boolean(errors.password)}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute end-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EFF5FA] hover:text-[#0F172A]"
                        aria-label={
                          showPassword
                            ? "مخفی کردن رمز عبور"
                            : "نمایش رمز عبور"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    {errors.password ? (
                      <p className="text-xs text-[#BA1A1A]">
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full rounded-xl bg-[#0053B2] font-semibold text-white shadow-lg shadow-[#0053B2]/20 transition hover:bg-[#004A9F] active:bg-[#003F88]"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? "در حال ورود..." : "ورود به سامانه"}</span>
                    {!isLoading ? <ArrowLeft className="size-4" /> : null}
                  </Button>

                  <div className="rounded-xl border border-[#E4EAF3] bg-[#EFF5FA]/70 px-4 py-3 text-center text-xs leading-5 text-[#64748B]">
                    ورود با Passkey و حساب سازمانی در مرحله بعدی فعال خواهد شد.
                  </div>
                </form>
              </CardContent>
            </Card>

            <p className="mt-5 text-center text-xs text-[#64748B]">
              دسترسی به سامانه مطابق سطح مجوز سازمانی شما کنترل می‌شود.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
