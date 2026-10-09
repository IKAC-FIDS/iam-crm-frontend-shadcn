import { useAuthStore } from "@/store/authStore"

/** Scope keys for permission-filtered lists. Auth lifecycle still clears the whole cache. */
export function useQueryScope() {
  return useAuthStore((state) =>
    JSON.stringify([state.user?.organizationId ?? null, state.user?.id ?? null])
  )
}
