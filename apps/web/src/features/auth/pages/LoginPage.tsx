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
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuth } from "../hooks/useAuth"
import { uiText } from "@/config/uiText"

const loginText = uiText.auth.login

const loginSchema = z.object({
  email: z.string().email(loginText.validation.invalidEmail),
  password: z.string().min(6, loginText.validation.shortPassword),
})

type LoginFormData = z.infer<typeof loginSchema>


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
      setError(getApiErrorMessage(err, loginText.errors.loginFailed))
    }
  }

  return (
    <main className="grid min-h-svh w-full bg-[#FCFCFF] lg:grid-cols-2">
      <section className="flex min-h-svh flex-col px-6 py-6 sm:px-10 md:px-14 lg:px-16 xl:px-24">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#0053B2] text-white shadow-lg shadow-[#0053B2]/20">
            <ShieldCheck className="size-5" />
          </div>

          <div>
            <div className="font-bold text-[#0F172A]">{uiText.app.name}</div>
            <div className="text-xs text-[#64748B]">
              {uiText.app.tagline}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[430px]">
            <div className="mb-8">
              <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[#D6E3FF] text-[#0053B2]">
                <LockKeyhole className="size-6" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
                {loginText.title}
              </h1>

              <p className="mt-2 text-sm leading-7 text-[#64748B]">
                {loginText.description}
              </p>
            </div>

            {error ? (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-[#BA1A1A]/15 bg-[#FFDAD6] px-4 py-3 text-sm leading-6 text-[#BA1A1A]"
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
                  {loginText.emailLabel}
                </Label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="your_mail@rsa.ir"
                    dir="ltr"
                    className="h-12 rounded-xl border-[#E4EAF3] bg-white ps-10 text-left focus-visible:ring-[#0053B2]"
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
                    {loginText.passwordLabel}
                  </Label>

                  <button
                    type="button"
                    className="text-xs font-medium text-[#55677F] transition hover:text-[#0053B2]"
                  >
                    {loginText.forgotPassword}
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
                    className="h-12 rounded-xl border-[#E4EAF3] bg-white px-10 text-left focus-visible:ring-[#0053B2]"
                    aria-invalid={Boolean(errors.password)}
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute end-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#EFF5FA] hover:text-[#0F172A]"
                    aria-label={
                      showPassword
                        ? loginText.passwordVisibility.hide
                        : loginText.passwordVisibility.show
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
                className="h-12 w-full rounded-xl bg-[#0053B2] font-semibold text-white shadow-lg shadow-[#0053B2]/20 transition hover:bg-[#004A9F] active:bg-[#003F88]"
                disabled={isLoading}
              >
                <span>
                  {isLoading ? loginText.submitting : loginText.submit}
                </span>

                {!isLoading ? <ArrowLeft className="size-4" /> : null}
              </Button>

              <div className="rounded-xl border border-[#E4EAF3] bg-[#EFF5FA]/70 px-4 py-3 text-center text-xs leading-5 text-[#64748B]">
                {loginText.passkeyNotice}
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-[#64748B]">
          {loginText.accessNotice}
        </p>
      </section>

      <section className="relative hidden min-h-svh overflow-hidden bg-[#003F88] p-12 text-white lg:flex xl:p-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -start-24 top-24 size-80 rounded-full bg-[#0053B2] blur-3xl" />

          <div className="absolute -bottom-20 end-0 size-96 rounded-full bg-[#1371D3]/40 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
        </div>

        <div className="relative flex w-full flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              <Sparkles className="size-3.5" />
              {loginText.hero.badge}
            </div>

            <div className="mt-12 max-w-xl">
              <h2 className="text-4xl font-bold leading-[1.35] xl:whitespace-nowrap xl:text-5xl">
                {loginText.hero.headline}
              </h2>

            </div>
          </div>

          <div className="grid gap-3">
            {loginText.hero.highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur"
              >
                <CheckCircle2 className="size-5 shrink-0 text-[#D6E3FF]" />
                <span className="text-sm text-white/85">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}