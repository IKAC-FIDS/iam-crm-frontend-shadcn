import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { describe, expect, it } from "vitest"
import {
  enumParam,
  parsePageParam,
  parsePageSize,
  patchListParams,
  useListQueryState,
} from "./listQuery"
import { readOpportunityFilters } from "@/features/opportunities/utils/opportunityQuery"

describe("list URL contract", () => {
  it.each([
    null,
    "",
    "0",
    "-1",
    "1.5",
    "Infinity",
    "NaN",
    "1e3",
    "9007199254740992",
  ])("rejects invalid page %s", (value) =>
    expect(parsePageParam(value)).toBe(1)
  )
  it("parses pages, allowed sizes, enums and opportunity deep links", () => {
    expect(parsePageParam("12")).toBe(12)
    expect(parsePageSize("50")).toBe(50)
    expect(parsePageSize("999")).toBe(20)
    expect(enumParam("unknown", ["ALL", "MINE"], "ALL")).toBe("ALL")
    expect(
      readOpportunityFilters(
        new URLSearchParams(
          "companyId=c1&priority=HIGH&ownershipScope=team&stageId=s1"
        )
      )
    ).toMatchObject({
      companyId: "c1",
      priority: "HIGH",
      ownershipScope: "team",
      stageId: "s1",
      archiveState: "active",
    })
    expect(
      readOpportunityFilters(new URLSearchParams("priority=INVALID"))
    ).toHaveProperty("priority", undefined)
  })
  it("preserves unrelated parameters and atomically resets pagination", () => {
    const result = patchListParams(
      new URLSearchParams("view=list&page=8&companyId=c1"),
      { search: "تهران", limit: 50 }
    )
    expect(Object.fromEntries(result)).toEqual({
      view: "list",
      page: "1",
      companyId: "c1",
      search: "تهران",
      limit: "50",
    })
  })
  it("restores filters and pagination on back/forward and accepts pageSize alias", async () => {
    function Harness() {
      const { params, page, pageSize, patch, setPageSize } = useListQueryState()
      return (
        <>
          <output>{`${params.get("search") ?? ""}|${page}|${pageSize}`}</output>
          <button onClick={() => patch({ search: "new" })}>filter</button>
          <button onClick={() => setPageSize(50)}>size</button>
        </>
      )
    }
    const router = createMemoryRouter([{ path: "/", element: <Harness /> }], {
      initialEntries: ["/?search=old&page=3&pageSize=10&view=list"],
    })
    render(<RouterProvider router={router} />)
    expect(screen.getByRole("status")).toHaveTextContent("old|3|10")
    await userEvent.click(screen.getByText("filter"))
    expect(screen.getByRole("status")).toHaveTextContent("new|1|10")
    await userEvent.click(screen.getByText("size"))
    expect(screen.getByRole("status")).toHaveTextContent("new|1|50")
    expect(router.state.location.search).toContain("view=list")
    expect(router.state.location.search).not.toContain("pageSize")
    await act(() => router.navigate(-1))
    expect(screen.getByRole("status")).toHaveTextContent("new|1|10")
    await act(() => router.navigate(-1))
    expect(screen.getByRole("status")).toHaveTextContent("old|3|10")
    await act(() => router.navigate(1))
    expect(screen.getByRole("status")).toHaveTextContent("new|1|10")
  })
})
