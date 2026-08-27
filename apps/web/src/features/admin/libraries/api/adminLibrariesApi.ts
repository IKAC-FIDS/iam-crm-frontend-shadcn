import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"

export const lookupGroups = [
  ["teams", "تیم‌ها"], ["departments", "دپارتمان‌ها"], ["job-titles", "سمت‌ها"],
  ["seniority-levels", "سطح ارشدیت"], ["persona-roles", "نقش‌های فروش"],
  ["opportunity-sources", "منابع ایجاد فرصت"], ["activity-types", "انواع فعالیت"],
  ["person-social-platforms", "شبکه‌های اجتماعی"], ["company-sources", "منابع شرکت"],
  ["meeting-types", "انواع جلسه"],
] as const
export type LookupGroup = (typeof lookupGroups)[number][0]
export type LibraryKind = "industries" | "leadSources" | "painPoints" | "useCases" | "personas" | "universities" | "lookupOptions"
export type LibraryItem = {
  id: string; label: string; description: string | null; isActive: boolean; code: string | null
  category: string | null; sortOrder: number | null; defaultPainPoint: string | null; defaultUseCase: string | null
  raw: Record<string, unknown>
}
export type LibraryPayload = { primary: string; code?: string; description?: string; category?: string; sortOrder?: number; isActive?: boolean; defaultPainPoint?: string; defaultUseCase?: string }
export type Product = {
  id: string; code: string; digikalaCode?: string | null; digikalaUrl?: string | null; name: string; description?: string | null; category?: string | null; unit?: string | null
  pricingCurrency: "IRR" | "USD"; inPersonInputPrice: string | number; digikalaInputPrice: string | number
  inPersonProfitPercent?: string | number | null; digikalaProfitPercent?: string | number | null
  inPersonPriceIrr: string | number; digikalaPriceIrr: string | number; isActive: boolean; sortOrder: number
}
export type ProductPayload = { code: string; digikalaCode?: string | null; digikalaUrl?: string | null; name: string; description?: string; category?: string; unit?: string; pricingCurrency: "IRR" | "USD"; inPersonInputPrice: string; digikalaInputPrice: string; inPersonProfitPercent?: string; digikalaProfitPercent?: string; isActive: boolean; sortOrder: number }
export type ProductPriceHistory = { id: string; pricingCurrency: "IRR" | "USD"; inPersonPriceIrr: string | number; digikalaPriceIrr: string | number; reason: string; validFrom: string; changedBy?: { fullName: string } | null }
export type PageMeta = { total: number; page: number; limit: number; totalPages: number }

const endpoints: Record<LibraryKind, string> = { industries: "/industries", leadSources: "/lead-sources", painPoints: "/pain-points", useCases: "/use-cases", personas: "/persona-library", universities: "/universities", lookupOptions: "/lookups" }
const endpoint = (kind: LibraryKind, group?: LookupGroup) => kind === "lookupOptions" ? `${endpoints[kind]}/${group}` : endpoints[kind]
const list = (value: unknown): unknown[] => {
  const data = unwrapApiResponse<unknown>(value)
  if (Array.isArray(data)) return data
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as { items: unknown[] }).items)) return (data as { items: unknown[] }).items
  return []
}
const normalize = (input: unknown): LibraryItem => {
  const raw = input as Record<string, unknown>
  return { id: String(raw.id), label: String(raw.name ?? raw.title ?? raw.titlePattern ?? raw.label ?? raw.code ?? ""), description: raw.description == null ? raw.notes == null ? null : String(raw.notes) : String(raw.description), isActive: typeof raw.isActive === "boolean" ? raw.isActive : true, code: raw.code == null ? null : String(raw.code), category: raw.category == null ? null : String(raw.category), sortOrder: raw.sortOrder == null ? null : Number(raw.sortOrder), defaultPainPoint: raw.defaultPainPoint == null ? null : String(raw.defaultPainPoint), defaultUseCase: raw.defaultUseCase == null ? null : String(raw.defaultUseCase), raw }
}
const body = (kind: LibraryKind, value: LibraryPayload) => {
  if (kind === "industries") return { name: value.primary, description: value.description || undefined }
  if (kind === "universities") return { name: value.primary, code: value.code || undefined, description: value.description || undefined, isActive: value.isActive }
  if (kind === "leadSources") return { name: value.primary, code: value.code, description: value.description || undefined, isActive: value.isActive, sortOrder: value.sortOrder }
  if (kind === "painPoints" || kind === "useCases") return { title: value.primary, description: value.description || undefined, category: value.category || undefined }
  if (kind === "personas") return { titlePattern: value.primary, defaultPainPoint: value.defaultPainPoint || undefined, defaultUseCase: value.defaultUseCase || undefined, notes: value.description || undefined }
  return { label: value.primary, code: value.code, description: value.description || undefined, isActive: value.isActive, sortOrder: value.sortOrder }
}
async function fetchState(kind: LibraryKind, group: LookupGroup | undefined, active?: boolean) {
  const params = kind === "universities" ? { includeInactive: active === undefined } : active === undefined ? undefined : { active }
  const response = await api.get(endpoint(kind, group), { params })
  return list(response.data).map(normalize)
}
export async function getLibraryItems(kind: LibraryKind, group?: LookupGroup) {
  if (kind === "leadSources" || kind === "lookupOptions") {
    const [active, inactive] = await Promise.all([fetchState(kind, group, true), fetchState(kind, group, false)])
    return [...active, ...inactive].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.label.localeCompare(b.label, "fa"))
  }
  return fetchState(kind, group)
}
export async function saveLibraryItem(kind: LibraryKind, payload: LibraryPayload, group?: LookupGroup, id?: string) {
  const response = id ? await api.patch(`${endpoint(kind, group)}/${id}`, body(kind, payload)) : await api.post(endpoint(kind, group), body(kind, payload))
  return normalize(unwrapApiResponse(response.data))
}
export async function removeLibraryItem(kind: LibraryKind, id: string, group?: LookupGroup) { await api.delete(`${endpoint(kind, group)}/${id}`) }
export async function getProducts(params: { page: number; limit: number; search?: string; category?: string; active?: string }) {
  const response = await api.get("/product-catalog", { params })
  const value = response.data as unknown
  if (value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data) && (value as { meta?: unknown }).meta) {
    return { data: (value as { data: Product[] }).data, meta: (value as { meta: PageMeta }).meta }
  }
  return unwrapApiResponse<{ data: Product[]; meta: PageMeta }>(value)
}
export async function saveProduct(payload: ProductPayload, id?: string) { const body = { ...payload, digikalaCode: payload.digikalaCode?.trim() || null, digikalaUrl: payload.digikalaUrl?.trim() || null }; const response = id ? await api.patch(`/product-catalog/${id}`, body) : await api.post("/product-catalog", body); return unwrapApiResponse<Product>(response.data) }
export async function toggleProduct(item: Product) { const response = await api.patch(`/product-catalog/${item.id}/${item.isActive ? "deactivate" : "activate"}`); return unwrapApiResponse<Product>(response.data) }
export async function getProductPriceHistory(id: string) { const response = await api.get(`/product-catalog/${id}/price-history`, { params: { page: 1, limit: 50 } }); return unwrapApiResponse<{ data: ProductPriceHistory[]; meta: PageMeta }>(response.data) }
