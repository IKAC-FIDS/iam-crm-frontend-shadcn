/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import {
  appFontOptions,
  defaultAppFontId,
  getAppFont,
} from "@/theme/fontCatalog"

type FontPreferenceContextValue = {
  fontId: string
  setFontId: (fontId: string) => void
}

const FontPreferenceContext = React.createContext<
  FontPreferenceContextValue | undefined
>(undefined)

const loadedFonts = new Set<string>()

function fontAssetUrl(file: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}fonts/persian/${file}`
}

async function applyFont(fontId: string) {
  const font = getAppFont(fontId) ?? getAppFont(defaultAppFontId)!
  const root = document.documentElement

  root.dataset.appFont = font.id
  root.style.setProperty(
    "--app-font-family",
    `"${font.family}", "BYekan", Tahoma, Arial, sans-serif`
  )

  if (!font.file || loadedFonts.has(font.id) || !("fonts" in document)) {
    return
  }

  try {
    const face = new FontFace(font.family, `url("${fontAssetUrl(font.file)}")`)
    await face.load()
    document.fonts.add(face)
    loadedFonts.add(font.id)
  } catch {
    root.style.setProperty(
      "--app-font-family",
      '"BYekan", Tahoma, Arial, sans-serif'
    )
  }
}

export function FontPreferenceProvider({
  children,
  storageKey = "iam-crm-font",
}: {
  children: React.ReactNode
  storageKey?: string
}) {
  const [fontId, setFontIdState] = React.useState(() => {
    const stored = localStorage.getItem(storageKey)
    return getAppFont(stored) ? stored! : defaultAppFontId
  })

  const setFontId = React.useCallback(
    (nextFontId: string) => {
      if (!appFontOptions.some((font) => font.id === nextFontId)) return
      localStorage.setItem(storageKey, nextFontId)
      setFontIdState(nextFontId)
    },
    [storageKey]
  )

  React.useEffect(() => {
    void applyFont(fontId)
  }, [fontId])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || event.key !== storageKey) return
      setFontIdState(getAppFont(event.newValue)?.id ?? defaultAppFontId)
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [storageKey])

  const value = React.useMemo(() => ({ fontId, setFontId }), [fontId, setFontId])

  return (
    <FontPreferenceContext.Provider value={value}>
      {children}
    </FontPreferenceContext.Provider>
  )
}

export function useFontPreference() {
  const context = React.useContext(FontPreferenceContext)
  if (!context) {
    throw new Error("useFontPreference must be used within FontPreferenceProvider")
  }
  return context
}
