export {
  TechnicalReleasesPage,
  TechnicalKnowledgeBasePage,
  TechnicalDocumentsPage,
  TechnicalResourcesPage,
  TechnicalTendersPage,
} from "./TechnicalListPages"
export {
  TechnicalReleaseDetailPage,
  TechnicalKnowledgeDetailPage,
  TechnicalDocumentDetailPage,
  TechnicalResourceDetailPage,
  TechnicalTenderDetailPage,
  TechnicalEntityEditorPage,
} from "./TechnicalDetailPages"
import { TechnicalEntityEditorPage } from "./TechnicalDetailPages"
export const TechnicalReleaseEditorPage = () => (
  <TechnicalEntityEditorPage kind="releases" />
)
export const TechnicalKnowledgeEditorPage = () => (
  <TechnicalEntityEditorPage kind="knowledge-base" />
)
export const TechnicalDocumentEditorPage = () => (
  <TechnicalEntityEditorPage kind="documents" />
)
export const TechnicalResourceEditorPage = () => (
  <TechnicalEntityEditorPage kind="resources" />
)
export const TechnicalTenderEditorPage = () => (
  <TechnicalEntityEditorPage kind="tenders" />
)
