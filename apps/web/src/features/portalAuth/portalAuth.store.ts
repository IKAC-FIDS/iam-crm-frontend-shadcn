import { create } from "zustand"
import { queryClient } from "@/lib/queryClient"

export type CustomerRole = "CUSTOMER_ADMIN" | "CUSTOMER_USER"
export interface PortalCompany { membershipId: string; companyId: string; legalName: string; brandName: string | null; role: CustomerRole }
export interface PortalUser { id: string; fullName: string; email: string; principalType: "CUSTOMER" }
type Status = "loading" | "authenticated" | "anonymous" | "selection" | "error"

interface PortalState {
  user: PortalUser | null
  activeCompany: PortalCompany | null
  companies: PortalCompany[]
  accessToken: string | null
  selectionToken: string | null
  status: Status
  revision: number
  setSession: (input: { user: PortalUser; activeCompany: PortalCompany; accessToken: string }) => void
  requireSelection: (companies: PortalCompany[], token: string) => void
  setCompanies: (companies: PortalCompany[]) => void
  setStatus: (status: Status) => void
  clear: () => void
}

function clearPortalQueries() {
  queryClient.removeQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === "string" &&
      query.queryKey[0].startsWith("portal"),
  })
}

export const usePortalAuthStore = create<PortalState>((set, get) => ({
  user: null, activeCompany: null, companies: [], accessToken: null, selectionToken: null, status: "loading", revision: 0,
  setSession: ({ user, activeCompany, accessToken }) => {
    const previous = get()
    if (
      previous.user?.id !== user.id ||
      (previous.activeCompany &&
        previous.activeCompany.membershipId !== activeCompany.membershipId)
    ) {
      clearPortalQueries()
    }
    set((state) => ({ user, activeCompany, accessToken, selectionToken: null, status: "authenticated", revision: state.revision + 1 }))
  },
  requireSelection: (companies, selectionToken) => set({ companies, selectionToken, status: "selection" }),
  setCompanies: (companies) => set({ companies }),
  setStatus: (status) => set({ status }),
  clear: () => { clearPortalQueries(); set((s) => ({ user: null, activeCompany: null, companies: [], accessToken: null, selectionToken: null, status: "anonymous", revision: s.revision + 1 })); },
}))
