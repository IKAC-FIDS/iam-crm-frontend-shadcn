import { BookOpen, FileText, FolderOpen, Gavel, Rocket } from "lucide-react"
import { uiText } from "@/config/uiText"
import { FeaturePlaceholderPage } from "@/features/shared/pages/FeaturePlaceholderPage"

const text = uiText.technicalCenter

export function TechnicalReleasesPage() {
  return <FeaturePlaceholderPage {...text.releases} icon={Rocket} message={text.comingSoon} />
}
export function TechnicalKnowledgeBasePage() {
  return <FeaturePlaceholderPage {...text.knowledgeBase} icon={BookOpen} message={text.comingSoon} />
}
export function TechnicalTendersPage() {
  return <FeaturePlaceholderPage {...text.tenders} icon={Gavel} message={text.comingSoon} />
}
export function TechnicalDocumentsPage() {
  return <FeaturePlaceholderPage {...text.documents} icon={FileText} message={text.comingSoon} />
}
export function TechnicalResourcesPage() {
  return <FeaturePlaceholderPage {...text.resources} icon={FolderOpen} message={text.comingSoon} />
}
