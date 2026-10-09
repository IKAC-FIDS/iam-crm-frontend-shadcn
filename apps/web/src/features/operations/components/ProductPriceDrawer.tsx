import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PackageSearch, Search, ShoppingBag, Store } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@workspace/ui/components/sheet"
import { EmptyState } from "@/components/shared/EmptyState"
import { QueryContent } from "@/components/shared/QueryContent"
import { StatusBadge } from "@/components/shared/StatusBadge"
import {
  getProducts,
  type Product,
} from "@/features/admin/libraries/api/adminLibrariesApi"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { canViewFinancials } from "@/lib/permissions"
import { useAuthStore } from "@/store/authStore"

const money = (value: Product["inPersonPriceIrr"]) =>
  value == null
    ? "ثبت نشده"
    : `${new Intl.NumberFormat("fa-IR").format(Number(value))} ریال`

export function ProductPriceDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [search, setSearch] = useState("")
  const debounced = useDebouncedValue(search, 250)
  const permissions = useAuthStore((state) => state.user?.permissions ?? [])
  const financialVisible = canViewFinancials(permissions)
  const query = useQuery({
    queryKey: ["operations", "product-prices", debounced],
    queryFn: () =>
      getProducts({ page: 1, limit: 50, search: debounced || undefined }),
    enabled: open && permissions.includes("product:view"),
  })
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        dir="rtl"
        className="w-[min(100%,44rem)] gap-0 border-[var(--app-divider)] bg-[var(--app-surface)] sm:max-w-[44rem]"
      >
        <SheetHeader className="border-b border-[var(--app-divider)] p-5 pe-14">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <PackageSearch className="size-5 text-[var(--app-primary)]" />
            قیمت محصولات
          </SheetTitle>
          <SheetDescription>
            مرجع سریع قیمت‌های فروش فعلی؛ اطلاعات مستقیماً از کاتالوگ محصولات
            دریافت می‌شود.
          </SheetDescription>
        </SheetHeader>
        <div className="relative m-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--app-icon-muted)]" />
          <Input
            aria-label="جست‌وجوی محصول"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="نام یا کد محصول..."
            className="h-11 rounded-xl ps-10"
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <QueryContent
            query={query}
            errorTitle="دریافت قیمت محصولات ناموفق بود"
          >
            {query.data?.data.length ? (
              <div className="grid gap-2.5">
                {query.data.data.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-[var(--app-divider)] bg-[var(--app-background)]/55 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-[var(--app-heading)]">
                          {product.name}
                        </h3>
                        <p
                          className="mt-1 text-xs text-[var(--app-text-secondary)]"
                          dir="ltr"
                        >
                          {product.code}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <StatusBadge
                          tone={product.isActive ? "success" : "neutral"}
                        >
                          {product.isActive ? "فعال" : "غیرفعال"}
                        </StatusBadge>
                        <StatusBadge tone="info">
                          {product.type === "SOFTWARE"
                            ? "نرم‌افزار"
                            : "سخت‌افزار"}
                        </StatusBadge>
                      </div>
                    </div>
                    {financialVisible ? (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-3">
                          <span className="flex items-center gap-1.5 text-xs text-[var(--app-text-secondary)]">
                            <Store className="size-3.5" />
                            قیمت حضوری
                          </span>
                          <strong className="mt-1 block text-sm">
                            {money(product.inPersonPriceIrr)}
                          </strong>
                        </div>
                        <div className="rounded-xl border border-[var(--app-divider)] bg-[var(--app-surface)] p-3">
                          <span className="flex items-center gap-1.5 text-xs text-[var(--app-text-secondary)]">
                            <ShoppingBag className="size-3.5" />
                            قیمت دیجی‌کالا
                          </span>
                          <strong className="mt-1 block text-sm">
                            {money(product.digikalaPriceIrr)}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-[var(--app-text-secondary)]">
                        دسترسی مشاهده اطلاعات مالی برای این حساب فعال نیست.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="محصولی پیدا نشد"
                description="عبارت جست‌وجو را تغییر دهید."
              />
            )}
          </QueryContent>
        </div>
      </SheetContent>
    </Sheet>
  )
}
