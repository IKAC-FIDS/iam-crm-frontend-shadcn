import { lazy, Suspense, type ComponentType } from "react"

import { LoadingState } from "@/components/shared/LoadingState"

export function lazyRoute<
  Module extends Record<string, unknown>,
  Key extends keyof Module,
>(loader: () => Promise<Module>, exportName: Key) {
  const Page = lazy(async () => ({
    default: (await loader())[exportName] as ComponentType,
  }))

  return (
    <Suspense
      fallback={
        <div className="min-h-[50dvh] p-4 sm:p-6">
          <LoadingState />
        </div>
      }
    >
      <Page />
    </Suspense>
  )
}
