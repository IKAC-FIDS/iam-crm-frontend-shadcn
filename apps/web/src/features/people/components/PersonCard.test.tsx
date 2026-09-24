import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type {
  PeopleLookupSet,
  PersonDirectoryItem,
} from "../types/person.types"
import { PersonCardList } from "./PersonCard"

const lookups: PeopleLookupSet = {
  departments: [
    { id: "d1", group: "departments", code: "SALES", label: "فروش" },
  ],
  jobTitles: [
    { id: "j1", group: "job-titles", code: "CEO", label: "مدیرعامل" },
  ],
  personaRoles: [
    { id: "p1", group: "persona-roles", code: "BUYER", label: "خریدار" },
  ],
  seniorityLevels: [
    {
      id: "s1",
      group: "seniority-levels",
      code: "C_LEVEL",
      label: "مدیر ارشد",
    },
  ],
}

const person: PersonDirectoryItem = {
  id: "person-1",
  companyId: "company-1",
  fullName: "مریم احمدی",
  jobTitle: "CEO",
  department: "SALES",
  personaRole: "BUYER",
  seniorityLevel: "C_LEVEL",
  isPrimaryContact: true,
  phone: "09120000000",
  email: "maryam@example.com",
  company: { id: "company-1", legalName: "شرکت نمونه" },
}

describe("PersonCardList", () => {
  it("renders Persian labels and keeps the visible action separate from card navigation", () => {
    const onOpen = vi.fn()
    render(
      <PersonCardList
        people={[person]}
        lookups={lookups}
        canViewPerson
        onOpen={onOpen}
      />
    )

    expect(screen.getByText("مریم احمدی")).toBeInTheDocument()
    expect(screen.getByTitle("مدیرعامل · فروش · شرکت نمونه")).toBeInTheDocument()
    expect(screen.getByText("مخاطب اصلی")).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole("button", { name: "مشاهده جزئیات مریم احمدی" })
    )
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it("does not expose detail navigation without person:view permission", () => {
    render(
      <PersonCardList
        people={[person]}
        lookups={lookups}
        canViewPerson={false}
        onOpen={vi.fn()}
      />
    )

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
