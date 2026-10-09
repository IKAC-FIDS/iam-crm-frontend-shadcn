import { readFile, readdir, stat } from "node:fs/promises"
import { gzipSync } from "node:zlib"
import path from "node:path"

const dist = path.resolve(import.meta.dirname, "../dist")
const assets = path.join(dist, "assets")
const limits = { initialJs: 320, largestRouteJs: 75, totalJs: 600, css: 35 }
const files = await readdir(assets)
const sizes = await Promise.all(
  files.map(async (name) => {
    const file = path.join(assets, name)
    return {
      name,
      raw: (await stat(file)).size,
      gzip: gzipSync(await readFile(file)).length,
    }
  })
)
const js = sizes.filter((item) => item.name.endsWith(".js"))
const css = sizes.filter((item) => item.name.endsWith(".css"))
const manifest = JSON.parse(
  await readFile(path.join(dist, ".vite/manifest.json"), "utf8")
)
const entry = Object.values(manifest).find((item) => item.isEntry)
const initialKeys = new Set()
function collectImports(item) {
  if (!item || initialKeys.has(item.file)) return
  initialKeys.add(item.file)
  for (const key of item.imports ?? []) collectImports(manifest[key])
}
collectImports(entry)
const initialNames = new Set(
  [...initialKeys].map((file) => file.split("/").pop())
)
const initial = js
  .filter((item) => initialNames.has(item.name))
  .reduce((sum, item) => sum + item.gzip, 0)
const routeChunks = js.filter((item) => !initialNames.has(item.name))
const metrics = {
  initialJs: initial,
  largestRouteJs: Math.max(0, ...routeChunks.map((item) => item.gzip)),
  totalJs: js.reduce((sum, item) => sum + item.gzip, 0),
  css: css.reduce((sum, item) => sum + item.gzip, 0),
}
let failed = false
for (const [key, bytes] of Object.entries(metrics)) {
  const kb = bytes / 1024
  const limit = limits[key]
  const ok = kb <= limit
  console.log(
    `${ok ? "PASS" : "FAIL"} ${key}: ${kb.toFixed(1)} KiB gzip / ${limit} KiB`
  )
  failed ||= !ok
}
if (failed) process.exitCode = 1
