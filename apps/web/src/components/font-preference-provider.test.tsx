import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it } from "vitest"

import {
  FontPreferenceProvider,
  useFontPreference,
} from "./font-preference-provider"

function Consumer() {
  const { fontId, setFontId } = useFontPreference()
  return <button onClick={() => setFontId("vazir")}>{fontId}</button>
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.style.removeProperty("--app-font-family")
})

it("persists and applies the selected Persian font", async () => {
  render(
    <FontPreferenceProvider>
      <Consumer />
    </FontPreferenceProvider>
  )

  await act(async () => userEvent.click(screen.getByRole("button")))

  expect(localStorage.getItem("iam-crm-font")).toBe("vazir")
  expect(document.documentElement.dataset.appFont).toBe("vazir")
  expect(
    document.documentElement.style.getPropertyValue("--app-font-family")
  ).toContain("AppVazir")
})
