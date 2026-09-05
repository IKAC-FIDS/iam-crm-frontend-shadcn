import { Building2 } from "lucide-react"
import { IdentityAvatar } from "@/components/shared/IdentityAvatar"

export function CompanyAvatar({ name, companyId, hasLogo }: { name: string; companyId?: string; hasLogo?: boolean }) {
  return <IdentityAvatar name={name} mediaPath={companyId ? `/companies/${companyId}/logo` : null} hasMedia={hasLogo} fallbackIcon={<Building2 className="size-5" />} className="size-11 text-sm" />
}
