import { execFileSync } from "node:child_process"

const paths = ["apps/web/src", "packages/ui/src"]
const base = process.env.UI_GUARDRAIL_BASE || "HEAD"

let diff = ""
try {
  diff = execFileSync(
    "git",
    ["diff", "--unified=0", "--no-ext-diff", base, "--", ...paths],
    { encoding: "utf8" }
  )
} catch (error) {
  console.warn("UI guardrails could not inspect the Git diff:", error.message)
  process.exit(0)
}

const checks = [
  {
    id: "hardcoded-color",
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    message:
      "Prefer a semantic color token; verify data-driven color exceptions.",
  },
  {
    id: "raw-control",
    pattern: /<(button|input|select|textarea)\b/,
    message: "Prefer the canonical UI primitive when one exists.",
  },
  {
    id: "custom-overlay",
    pattern: /(?:fixed\s+inset-0|inset-0\s+fixed)/,
    message: "Use the canonical Dialog, ResponsiveModal, Sheet, or Popover.",
  },
  {
    id: "generic-feature-primitive",
    pattern:
      /(?:function|const)\s+(?:Button|Input|Select|Textarea|Modal|Dialog|DataTable)\b/,
    message: "Generic primitives belong in the shared UI layer.",
  },
]

const tokenOwners = new Set([
  "packages/ui/src/styles/globals.css",
  "apps/web/src/styles/globals.css",
])
const isCanonicalPrimitiveOwner = (file) =>
  file.startsWith("packages/ui/src/components/")
const warnings = []
let file = ""
let newLine = 0

for (const line of diff.split(/\r?\n/)) {
  if (line.startsWith("+++ b/")) {
    file = line.slice(6)
    continue
  }
  const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
  if (hunk) {
    newLine = Number(hunk[1])
    continue
  }
  if (!line.startsWith("+") || line.startsWith("+++")) {
    if (line.startsWith(" ")) newLine += 1
    continue
  }

  const content = line.slice(1)
  for (const check of checks) {
    if (check.id === "hardcoded-color" && tokenOwners.has(file)) continue
    if (
      isCanonicalPrimitiveOwner(file) &&
      (check.id === "raw-control" || check.id === "generic-feature-primitive")
    ) {
      continue
    }
    if (check.pattern.test(content)) {
      warnings.push({ file, line: newLine, ...check })
    }
  }
  newLine += 1
}

if (warnings.length === 0) {
  console.log("UI guardrails: no review warnings in added lines.")
} else {
  console.warn(`UI guardrails: ${warnings.length} advisory warning(s).`)
  for (const warning of warnings) {
    console.warn(
      `- [${warning.id}] ${warning.file}:${warning.line} ${warning.message}`
    )
  }
  console.warn("Review warnings against DESIGN.md; this check is advisory.")
}
