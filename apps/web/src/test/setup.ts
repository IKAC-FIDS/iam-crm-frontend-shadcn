import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"
import { createTestLockManager } from "./lockManager"
Object.defineProperty(navigator, "locks", { configurable: true, value: createTestLockManager() })
// A deterministic Web Storage double, independent of Node's experimental storage.
const values = new Map<string, string>()
const storage: Storage = {
  get length() {
    return values.size
  },
  clear: () => values.clear(),
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => {
    values.set(key, String(value))
  },
  removeItem: (key) => {
    values.delete(key)
  },
  key: (index) => [...values.keys()][index] ?? null,
}
vi.stubGlobal("localStorage", storage)
afterEach(() => cleanup())
