import { MessageSquareText } from "lucide-react"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { EntityConversationPanel } from "@/features/conversations/components/EntityConversationPanel"

export function CompanyConversationDialog({
  company,
  onClose,
}: {
  company: { id: string; legalName: string } | null
  onClose: () => void
}) {
  return (
    <ResponsiveModal
      open={Boolean(company)}
      onClose={onClose}
      title={company ? `گفتگوی ${company.legalName}` : "گفتگوی شرکت"}
      description="یادداشت‌ها، پرسش‌ها و هماهنگی‌های داخلی شرکت"
      icon={MessageSquareText}
      width="max-w-5xl"
    >
      {company ? (
        <EntityConversationPanel
          entityType="COMPANY"
          entityId={company.id}
          enabled
        />
      ) : null}
    </ResponsiveModal>
  )
}
