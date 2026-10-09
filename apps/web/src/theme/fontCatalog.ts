export type AppFontOption = {
  id: string
  label: string
  family: string
  file?: string
  category: "recommended" | "classic"
}

const classicNames = [
  "Abasan", "Afsoon", "Aref", "Arshia", "BBadr", "BBaran", "BFarnaz",
  "BFerdosi", "BHoma", "BJadidBold", "BJalal", "BKoodakBold", "BKourosh",
  "BLotus", "BMehrBold", "BMitra", "BMorvarid", "BNarm", "BNasimBold",
  "BNazanin", "BRoya", "BShiraz", "BSinaBold", "BTabassom", "BTehran",
  "BTitrBold", "BTitrTGEBold", "BTraffic", "BVahidBold", "BYagut", "BYas",
  "BYekan", "BZar", "BZiba", "Casablanca", "Ekhlass", "FarsiSimple", "Flow",
  "FlowBold", "Frutiger", "HeritageTwo", "Kufi", "LinerScreen", "Naskh",
  "Rezvan", "Shams", "Silicon", "Talat", "ThameenDemi", "TitrDF",
  "TunisiaBold", "TVBold", "TwoBold", "TwoLight", "TwoMedium",
] as const

function classicId(name: string) {
  return `pixelboy-${name.toLowerCase()}`
}

export const appFontOptions: readonly AppFontOption[] = [
  { id: "byekan", label: "یکان (پیش‌فرض)", family: "BYekan", category: "recommended" },
  { id: "yekan", label: "یکان وب", family: "AppYekan", file: "yekan.woff", category: "recommended" },
  { id: "vazir", label: "وزیر", family: "AppVazir", file: "vazir.woff2", category: "recommended" },
  { id: "shabnam", label: "شبنم", family: "AppShabnam", file: "shabnam.woff2", category: "recommended" },
  { id: "sahel", label: "ساحل", family: "AppSahel", file: "sahel.woff2", category: "recommended" },
  { id: "samim", label: "صمیم", family: "AppSamim", file: "samim.woff2", category: "recommended" },
  { id: "parastoo", label: "پرستو", family: "AppParastoo", file: "parastoo.woff2", category: "recommended" },
  { id: "tanha", label: "تنها", family: "AppTanha", file: "tanha.woff2", category: "recommended" },
  ...classicNames.map((name) => ({
    id: classicId(name),
    label: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
    family: `Pixelboy${name}`,
    file: `${classicId(name)}.woff`,
    category: "classic" as const,
  })),
]

export const defaultAppFontId = "byekan"

export function getAppFont(id: string | null | undefined) {
  return appFontOptions.find((font) => font.id === id)
}
