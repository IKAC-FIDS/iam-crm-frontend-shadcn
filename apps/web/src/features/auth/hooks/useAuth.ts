import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { uiText } from "@/config/uiText"

import { authService, type LoginRequest } from "../services/auth.service"

export function useAuth() {
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      toast.success("ورود با موفقیت انجام شد")
      navigate("/dashboard", { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "خطا در ورود به سامانه"))
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onError: () => toast.error(uiText.app.logoutFailed),
    onSettled: () => {
      navigate("/login", { replace: true })
    },
  })

  return {
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
