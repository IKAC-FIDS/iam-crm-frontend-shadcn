import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ThemeProvider } from "@/components/theme-provider"
import { uiText } from "@/config/uiText"
import { ThemeSelector } from "./ThemeSelector"

describe("ThemeSelector", () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) })
  it("exposes all modes and changes selection", async () => {
    const user = userEvent.setup()
    render(<ThemeProvider defaultTheme="light"><ThemeSelector /></ThemeProvider>)
    await user.click(screen.getByRole("button", { name: uiText.common.theme.label }))
    expect(screen.getByRole("menuitemradio", { name: uiText.common.theme.light })).toBeVisible()
    expect(screen.getByRole("menuitemradio", { name: uiText.common.theme.dark })).toBeVisible()
    expect(screen.getByRole("menuitemradio", { name: uiText.common.theme.system })).toBeVisible()
    await user.click(screen.getByRole("menuitemradio", { name: uiText.common.theme.dark }))
    expect(localStorage.getItem("iam-crm-theme")).toBe("dark")
  })
})
