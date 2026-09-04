import { useState, type ComponentType } from "react"
import { FileText, FolderOpen, PackageOpen, Plus, UploadCloud } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { EntityListPage } from "@/components/shared/EntityListPage"
import { PageHero } from "@/components/shared/PageHero"
import { ResponsiveModal } from "@/components/shared/ResponsiveModal"
import { SurfaceCard } from "@/components/shared/SurfaceCard"
import { useAuthStore } from "@/store/authStore"
import { useTechnicalList } from "../hooks"
import { faDate, relationName, resourceTypeLabels } from "../presentation"
import type { TechnicalDocument, TechnicalRelease, TechnicalResource } from "../types"

const definitions = [
  { kind: "releases" as const, title: "نسخه و انتشار محصول", description: "نسخه محصول و چرخه انتشار و پشتیبانی", path: "/technical/releases", permission: "technical-release:view", manage: "technical-release:manage", icon: PackageOpen },
  { kind: "documents" as const, title: "سند نسخه‌بندی‌شده", description: "سند رسمی با محرمانگی، نسخه و فرایند تأیید", path: "/technical/documents", permission: "technical-document:view", manage: "technical-document:manage", icon: FileText },
  { kind: "resources" as const, title: "فایل، ابزار یا لینک فنی", description: "SDK، درایور، Firmware، نمونه‌کد و منابع خارجی", path: "/technical/resources", permission: "technical-resource:view", manage: "technical-resource:manage", icon: FolderOpen },
]

export function TechnicalLibraryPage() {
  const navigate = useNavigate()
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const [createOpen, setCreateOpen] = useState(false)
  const releaseQuery = useTechnicalList("releases", { page: 1, limit: 4, sort: "updatedAt", sortDirection: "desc" }, permissions.includes("technical-release:view"))
  const documentQuery = useTechnicalList("documents", { page: 1, limit: 4, sort: "updatedAt", sortDirection: "desc" }, permissions.includes("technical-document:view"))
  const resourceQuery = useTechnicalList("resources", { page: 1, limit: 4, sort: "updatedAt", sortDirection: "desc" }, permissions.includes("technical-resource:view"))
  const queries = { releases: releaseQuery, documents: documentQuery, resources: resourceQuery }
  const canCreate = definitions.some((item) => permissions.includes(item.manage))

  return (
    <EntityListPage>
      <PageHero
        title="مستندات و منابع فنی"
        eyebrow="مرکز فنی"
        icon={FolderOpen}
        description="نسخه‌های محصول، اسناد کنترل‌شده، فایل‌ها و لینک‌های فنی را از یک فضای واحد مدیریت کنید."
        actions={canCreate ? <Button onClick={() => setCreateOpen(true)}><Plus className="size-4" />افزودن منابع</Button> : null}
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {definitions.filter((item) => permissions.includes(item.permission)).map((item) => {
          const query = queries[item.kind]
          const Icon = item.icon
          return (
            <SurfaceCard key={item.kind} className="min-w-0 overflow-hidden">
              <button type="button" onClick={() => navigate(item.path)} className="flex w-full items-start gap-3 border-b p-4 text-start hover:bg-muted/40 sm:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary)]"><Icon className="size-5" /></span>
                <span className="min-w-0 flex-1"><b className="block text-sm">{item.title}</b><span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span></span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{query.data?.meta.total?.toLocaleString("fa-IR") ?? "—"}</span>
              </button>
              <div className="min-h-44 p-3">
                {query.isLoading ? <p className="p-4 text-center text-xs text-muted-foreground">در حال دریافت...</p> : query.data?.data.length ? (
                  <div className="grid gap-1">
                    {query.data.data.map((row) => (
                      <button key={row.id} type="button" onClick={() => navigate(`${item.path}/${row.id}`)} className="flex min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start hover:bg-muted">
                        <span className="min-w-0"><b className="block truncate text-xs">{row.title}</b><span className="mt-1 block truncate text-xs text-muted-foreground">{rowSubtitle(item.kind, row)}</span></span>
                        <span className="shrink-0 text-xs text-muted-foreground">{faDate(row.updatedAt)}</span>
                      </button>
                    ))}
                  </div>
                ) : <p className="p-4 text-center text-xs text-muted-foreground">موردی ثبت نشده است.</p>}
              </div>
              <div className="border-t p-3"><Button variant="ghost" size="sm" className="w-full" onClick={() => navigate(item.path)}>مشاهده همه</Button></div>
            </SurfaceCard>
          )
        })}
      </section>
      <ResponsiveModal open={createOpen} onClose={() => setCreateOpen(false)} title="چه چیزی اضافه می‌کنید؟" description="نوع محتوای فنی را انتخاب کنید تا فرم مناسب باز شود." icon={UploadCloud}>
        <div className="grid gap-3 sm:grid-cols-3">
          {definitions.filter((item) => permissions.includes(item.manage)).map((item) => <CreateChoice key={item.kind} icon={item.icon} title={item.title} description={item.description} onClick={() => navigate(`${item.path}?create=1`)} />)}
        </div>
      </ResponsiveModal>
    </EntityListPage>
  )
}

function CreateChoice({ icon: Icon, title, description, onClick }: { icon: ComponentType<{ className?: string }>; title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="group min-h-44 rounded-2xl border p-4 text-start transition hover:border-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]"><span className="grid size-11 place-items-center rounded-xl bg-muted text-[var(--app-primary)] group-hover:bg-background"><Icon className="size-5" /></span><b className="mt-4 block text-sm">{title}</b><span className="mt-2 block text-xs leading-6 text-muted-foreground">{description}</span></button>
}

function rowSubtitle(kind: "releases" | "documents" | "resources", row: TechnicalRelease | TechnicalDocument | TechnicalResource) {
  if (kind === "releases") {
    const release = row as TechnicalRelease
    return `${relationName(release.product)} · ${release.version}`
  }
  if (kind === "documents") return (row as TechnicalDocument).documentType
  return resourceTypeLabels[(row as TechnicalResource).resourceType]
}
