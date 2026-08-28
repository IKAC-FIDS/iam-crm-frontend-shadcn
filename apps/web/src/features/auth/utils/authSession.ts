import { queryClient } from "@/lib/queryClient"
import {
  normalizeAuthUser,
  removeLegacySessionStorage,
  useAuthStore,
  type AuthUser,
} from "@/store/authStore"
export interface AuthenticatedSession {
  accessToken: string
  user: AuthUser
}
function key(user: AuthUser | null) {
  return user ? `${user.id}:${user.organizationId ?? "platform-only"}` : null
}
export function applyAuthenticatedSession(
  session: AuthenticatedSession,
  replace = true
) {
  const user = normalizeAuthUser(session?.user)
  if (
    !user ||
    typeof session?.accessToken !== "string" ||
    !session.accessToken.trim()
  )
    throw new Error("Invalid session response")
  const previous = useAuthStore.getState().user
  if (
    replace ||
    key(previous) !== key(user) ||
    previous?.permissions.join() !== user.permissions.join()
  )
    queryClient.clear()
  removeLegacySessionStorage()
  useAuthStore
    .getState()
    .setSession(
      user,
      session.accessToken,
      replace || Boolean(previous && key(previous) !== key(user))
    )
}
