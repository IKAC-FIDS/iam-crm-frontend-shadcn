export {
  TechnicalReleasesPage,
  TechnicalKnowledgeBasePage,
  TechnicalDocumentsPage,
  TechnicalResourcesPage,
  TechnicalTendersPage,
} from "./TechnicalListPages"
export { TechnicalLibraryPage } from "./TechnicalLibraryPage"
export {
  TechnicalReleaseDetailPage,
  TechnicalKnowledgeDetailPage,
  TechnicalDocumentDetailPage,
  TechnicalResourceDetailPage,
  TechnicalTenderDetailPage,
} from "./TechnicalDetailPages"
import { Navigate } from "react-router-dom"

export const TechnicalReleaseEditorPage = () => (
  <Navigate to="/technical/releases?create=1" replace />
)
export const TechnicalKnowledgeEditorPage = () => (
  <Navigate to="/technical/knowledge-base?create=1" replace />
)
export const TechnicalDocumentEditorPage = () => (
  <Navigate to="/technical/documents?create=1" replace />
)
export const TechnicalResourceEditorPage = () => (
  <Navigate to="/technical/resources?create=1" replace />
)
export const TechnicalTenderEditorPage = () => (
  <Navigate to="/technical/tenders?create=1" replace />
)
