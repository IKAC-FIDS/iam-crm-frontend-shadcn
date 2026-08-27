import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { authService } from "../services/auth.service"
import { applyAuthenticatedSession } from "../utils/authSession"

function passkeyMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return getApiErrorMessage(error, "ورود با Passkey انجام نشد.")
}

export function usePasskeyLogin() {
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: async () => {
      if (!window.isSecureContext) throw new Error("ورود با Passkey فقط روی HTTPS امکان‌پذیر است.")
      if (!browserSupportsWebAuthn()) throw new Error("مرورگر یا دستگاه شما از Passkey پشتیبانی نمی‌کند.")
      const payload = await authService.getPasskeyAuthenticationOptions()
      if (!payload?.challengeId || !payload.options?.challenge || !payload.options?.rpId) {
        throw new Error("اطلاعات ورود Passkey از سرور ناقص دریافت شد.")
      }
      try {
        const response = await startAuthentication({ optionsJSON: payload.options })
        return await authService.verifyPasskeyAuthentication(payload.challengeId, response)
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          throw new Error("Passkey انتخاب نشد یا زمان ورود به پایان رسید.", { cause: error })
        }
        throw error
      }
    },
    onSuccess: session => {
      applyAuthenticatedSession(session)
      toast.success("ورود با Passkey با موفقیت انجام شد")
      navigate("/dashboard", { replace: true })
    },
    onError: error => toast.error(passkeyMessage(error)),
  })
  return { loginWithPasskey: mutation.mutateAsync, isPasskeyLoading: mutation.isPending }
}
