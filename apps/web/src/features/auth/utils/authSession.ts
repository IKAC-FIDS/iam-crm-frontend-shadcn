import { queryClient } from "@/lib/queryClient"
import { useAuthStore, type AuthUser } from "@/store/authStore"
export interface AuthenticatedSession { accessToken: string; user: AuthUser }
function key(user: AuthUser | null) { return user ? `${user.id}:${user.organizationId ?? "platform-only"}` : null }
export function applyAuthenticatedSession(session: AuthenticatedSession) {
  if (key(useAuthStore.getState().user) !== key(session.user)) queryClient.clear()
  localStorage.setItem("accessToken", session.accessToken)
  useAuthStore.getState().setUser(session.user)
}