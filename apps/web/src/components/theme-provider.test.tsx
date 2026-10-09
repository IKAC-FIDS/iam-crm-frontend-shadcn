import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ThemeProvider, useTheme } from "./theme-provider"

function Consumer() {
  const { theme, setTheme } = useTheme()
  return <button onClick={() => setTheme("dark")}>{theme}</button>
}

function mockSystemTheme(dark: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: dark, media: "(prefers-color-scheme: dark)", addEventListener: vi.fn(), removeEventListener: vi.fn() }))
}

describe("ThemeProvider", () => {
  beforeEach(() => { localStorage.clear(); document.documentElement.className = ""; mockSystemTheme(false) })
  it("applies light mode", () => { render(<ThemeProvider defaultTheme="light"><Consumer /></ThemeProvider>); expect(document.documentElement).toHaveClass("light") })
  it("applies dark mode", () => { render(<ThemeProvider defaultTheme="dark"><Consumer /></ThemeProvider>); expect(document.documentElement).toHaveClass("dark") })
  it("resolves system mode", () => { mockSystemTheme(true); render(<ThemeProvider defaultTheme="system"><Consumer /></ThemeProvider>); expect(document.documentElement).toHaveClass("dark") })
  it("persists selection", async () => { render(<ThemeProvider defaultTheme="light"><Consumer /></ThemeProvider>); await act(async () => userEvent.click(screen.getByRole("button"))); expect(localStorage.getItem("iam-crm-theme")).toBe("dark"); expect(document.documentElement).toHaveClass("dark") })
})
