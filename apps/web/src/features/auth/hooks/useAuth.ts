import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/apiResponse"
import { useAuthStore } from "@/store/authStore"
import { authService, type LoginRequest } from "../services/auth.service"
import { applyAuthenticatedSession } from "../utils/authSession"
export function useAuth() {
  const navigate=useNavigate()
  const loginMutation=useMutation({ mutationFn:(data:LoginRequest)=>authService.login(data), onSuccess:(response)=>{ applyAuthenticatedSession(response); toast.success("ÙˆØ±ÙˆØ¯ Ù…ÙˆÙÙ‚!"); navigate("/dashboard",{replace:true}) }, onError:(e)=>toast.error(getApiErrorMessage(e,"Ø®Ø·Ø§ Ø¯Ø± ÙˆØ±ÙˆØ¯")) })
  const logoutMutation=useMutation({ mutationFn:authService.logout, onSettled:()=>{ useAuthStore.getState().clearUser(); navigate("/login",{replace:true}) } })
  return { login:loginMutation.mutateAsync, logout:logoutMutation.mutateAsync, isLoading:loginMutation.isPending, isLoggingOut:logoutMutation.isPending }
}