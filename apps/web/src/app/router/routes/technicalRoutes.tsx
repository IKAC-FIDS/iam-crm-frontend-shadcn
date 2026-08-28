import {
  TechnicalReleasesPage,
  TechnicalKnowledgeBasePage,
  TechnicalTendersPage,
  TechnicalDocumentsPage,
  TechnicalResourcesPage,
} from "@/features/technical/pages/TechnicalPages"
import { routeGroup } from "./routeGroup"
export const technicalRoutes = [
  routeGroup("technical-releases", <TechnicalReleasesPage />),
  routeGroup("technical-knowledge-base", <TechnicalKnowledgeBasePage />),
  routeGroup("technical-tenders", <TechnicalTendersPage />),
  routeGroup("technical-documents", <TechnicalDocumentsPage />),
  routeGroup("technical-resources", <TechnicalResourcesPage />),
]
