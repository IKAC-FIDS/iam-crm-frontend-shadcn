import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"

import { authService, type LoginRequest } from "../services/auth.service"
import { applyAuthenticatedSession } from "../utils/authSession"

export function useAuth() {
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      applyAuthenticatedSession(response)
      toast.success("ورود با موفقیت انجام شد")
      navigate("/dashboard", { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "خطا در ورود به سامانه"))
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      useAuthStore.getState().clearUser()
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
