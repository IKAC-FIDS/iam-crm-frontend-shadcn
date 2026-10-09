import type { ReactNode } from "react"
import { PageTemplate, type PageTemplateProps } from "./PageTemplate"

export type ListPageTemplateProps = Omit<PageTemplateProps, "toolbar" | "footer"> & {
  filters?: ReactNode
  pagination?: ReactNode
}

export function ListPageTemplate({ filters, pagination, ...rest }: ListPageTemplateProps) {
  return <PageTemplate {...rest} toolbar={filters} footer={pagination} />
}
