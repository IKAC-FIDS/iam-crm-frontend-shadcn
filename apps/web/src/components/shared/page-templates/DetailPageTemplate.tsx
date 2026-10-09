import type { ReactNode } from "react"
import { PageTemplate, type PageTemplateProps } from "./PageTemplate"

export type DetailPageTemplateProps = Omit<PageTemplateProps, "toolbar"> & {
  sectionsNavigation?: ReactNode
}

export function DetailPageTemplate({ sectionsNavigation, ...rest }: DetailPageTemplateProps) {
  return <PageTemplate {...rest} toolbar={sectionsNavigation} />
}
