import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useQueryScope } from "@/lib/queryScope"
import {
  getLibraryItems,
  getProducts,
  saveProduct,
  toggleProduct,
  type ProductPayload,
  type LibraryKind,
  type LookupGroup,
} from "../api/adminLibrariesApi"
export const productKeys = {
  all: ["admin-products"] as const,
  list: (params: Parameters<typeof getProducts>[0]) =>
    ["admin-products", params] as const,
}

export function useSaveProduct() {
  const client=useQueryClient()
  return useMutation({mutationFn:({payload,id}:{payload:ProductPayload;id?:string})=>saveProduct(payload,id),onSuccess:()=>client.invalidateQueries({queryKey:productKeys.all})})
}
export function useToggleProduct() {
  const client=useQueryClient()
  return useMutation({mutationFn:toggleProduct,onSuccess:()=>client.invalidateQueries({queryKey:productKeys.all})})
}
export const libraryKeys = {
  list: (kind: LibraryKind | undefined, group?: LookupGroup) =>
    ["admin-library", kind, group] as const,
}
export function useLibraryItems(
  kind: LibraryKind | undefined,
  group?: LookupGroup
) {
  const scope = useQueryScope()
  return useQuery({
    queryKey: [...libraryKeys.list(kind, group), scope],
    queryFn: () => getLibraryItems(kind!, group),
    enabled: Boolean(kind),
  })
}
export function useProducts(
  params: Parameters<typeof getProducts>[0],
  enabled: boolean
) {
  const scope = useQueryScope()
  return useQuery({
    queryKey: [...productKeys.list(params), scope],
    queryFn: () => getProducts(params),
    enabled,
  })
}
