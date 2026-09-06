import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import { MeetingFormDialog } from "@/features/meetings/components/MeetingFormDialog"
import { TaskFormDialog } from "@/features/tasks/components/TaskFormDialog"
import { PersonContactDialog } from "@/features/people/components/PersonContactDialog"
import { getPersonContactDisplayLabel } from "@/features/people/components/PersonContactsSection"
import { PersonFormDialog } from "@/features/people/components/PersonFormDialog"
import type { Meeting } from "@/features/meetings/types/meeting.types"
import { api } from "@/lib/api"
import { uiText } from "@/config/uiText"
import { useAuthStore } from "@/store/authStore"
import { response, httpError } from "./fixtures"

vi.mock("@/lib/api",()=>({api:{get:vi.fn(),post:vi.fn(),patch:vi.fn()}}))
const meeting:Meeting={id:"m1",companyId:"c1",title:"جلسه قبلی",meetingTypeId:"demo",type:{id:"demo",code:"DEMO",label:"جلسه دمو",sortOrder:0,isActive:true},mode:"IN_PERSON",status:"SCHEDULED",startAt:"2026-08-28T09:00:00Z",endAt:"2026-08-28T10:00:00Z",assignees:[],attendees:[]}
const contactType={id:"contact-type-work",group:"contact_types",code:"WORK",label:"تلفن کاری",sortOrder:10,isActive:true}
beforeEach(()=>{
  vi.clearAllMocks()
  vi.mocked(api.get).mockImplementation(async(url)=>String(url).includes("/lookups/contact-types")?response([contactType]):String(url).includes("types/options")?response([meeting.type]):response({data:[],meta:{page:1,limit:25,total:0,totalPages:0}}))
  vi.mocked(api.post).mockResolvedValue(response({id:"new"}))
  vi.mocked(api.patch).mockResolvedValue(response(meeting))
  useAuthStore.setState({
    user: {
      id: "user-1", fullName: "کاربر تست", email: "user@example.com", role: "REP",
      team: null, teamId: null, teamCode: null, teamName: null,
      permissions: ["task:create"], organizationId: "org-1", roleId: "role-1",
      roleCode: "REP", roleName: "کارشناس",
    },
    accessToken: "test-token",
    status: "authenticated",
  })
})
function wrapper({children}:{children:ReactNode}){
  return <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>
}
it("Meeting edit retains type, relationships and dates while mapping server field errors",async()=>{
  const onOpenChange=vi.fn()
  vi.mocked(api.patch).mockRejectedValue(httpError(422,{error:{message:"بررسی کنید",details:{fieldErrors:{title:["عنوان تکراری جلسه"]}}}}))
  render(<MeetingFormDialog open onOpenChange={onOpenChange} meeting={meeting}/>,{wrapper})
  const title=screen.getByDisplayValue("جلسه قبلی")
  await userEvent.clear(title)
  await userEvent.type(title,"جلسه جدید")
  await userEvent.click(screen.getByRole("button",{name:uiText.common.save}))
  await waitFor(()=>expect(api.patch).toHaveBeenCalledWith("/meetings/m1",expect.objectContaining({title:"جلسه جدید",companyId:"c1",meetingTypeId:"demo",startAt:"2026-08-28T09:00:00.000Z",assigneeUserIds:[],attendeePersonIds:[]})))
  expect(await screen.findByText("عنوان تکراری جلسه")).toBeInTheDocument()
  expect(title).toHaveAttribute("aria-invalid","true")
  expect(onOpenChange).not.toHaveBeenCalled()
})
it("Task create submits unchanged domain payload and displays a 409 business message",async()=>{
  vi.mocked(api.post).mockRejectedValue(httpError(409,{error:{message:"این کار قابل ایجاد نیست"}}))
  render(<TaskFormDialog open onOpenChange={vi.fn()}/>,{wrapper})
  await userEvent.type(screen.getByLabelText(uiText.tasks.fields.title),"کار جدید")
  await userEvent.click(screen.getByRole("button",{name:uiText.common.save}))
  await waitFor(()=>expect(api.post).toHaveBeenCalledWith("/tasks",expect.objectContaining({title:"کار جدید",priority:"MEDIUM"})))
  expect(await screen.findByRole("alert")).toHaveTextContent("این کار قابل ایجاد نیست")
})
it("Task create locks assignment to SELF without task:assign",async()=>{
  render(<TaskFormDialog open onOpenChange={vi.fn()}/>,{wrapper})
  expect(screen.getByText(/این کار به خود شما واگذار می‌شود/)).toBeInTheDocument()
  expect(screen.queryByText("دامنه واگذاری")).not.toBeInTheDocument()
})
it("Task create exposes full assignment controls with task:assign",async()=>{
  useAuthStore.setState((state)=>({
    ...state,
    user: state.user ? {...state.user,permissions:["task:create","task:assign"]} : null,
  }))
  render(<TaskFormDialog open onOpenChange={vi.fn()}/>,{wrapper})
  expect(screen.getByText("دامنه واگذاری")).toBeInTheDocument()
  expect(screen.getByRole("option",{name:"تیم"})).toBeInTheDocument()
  expect(screen.getByRole("option",{name:"سازمان"})).toBeInTheDocument()
})
it("Person form preserves company and maps server field errors to the name field",async()=>{
  const onSubmit=vi.fn().mockRejectedValue(httpError(422,{error:{message:"اصلاح کنید",details:{fieldErrors:{fullName:["نام نامعتبر است"]}}}}))
  render(<PersonFormDialog open onOpenChange={vi.fn()} mode="create" initialCompanyId="c1" lookups={{departments:[],jobTitles:[],personaRoles:[],seniorityLevels:[]}} onSubmit={onSubmit}/>,{wrapper})
  await userEvent.type(screen.getByLabelText(uiText.people.fields.fullName),"شخص نمونه")
  await userEvent.click(screen.getByRole("button",{name:uiText.common.save}))
  await waitFor(()=>expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({companyId:"c1",fullName:"شخص نمونه"})))
  expect(await screen.findByText("نام نامعتبر است")).toBeInTheDocument()
})
it("Contact form restores edit defaults on reopen and blocks an empty contact",async()=>{
  const onSubmit=vi.fn().mockResolvedValue(undefined)
  const props={onOpenChange:vi.fn(),isPending:false,onSubmit,contact:{id:"contact1",type:"WORK",typeOptionId:contactType.id,typeOption:contactType,value:"09120000000",isPrimary:true}}
  const {rerender}=render(<PersonContactDialog open {...props}/>,{wrapper})
  expect(await screen.findByRole("option",{name:"تلفن کاری"})).toBeInTheDocument()
  expect(screen.getByLabelText(uiText.people.contactHub.type)).toHaveValue(contactType.id)
  await userEvent.clear(screen.getByLabelText(uiText.people.contactHub.value))
  await userEvent.click(screen.getByRole("button",{name:uiText.people.actions.save}))
  expect(onSubmit).not.toHaveBeenCalled()
  expect(await screen.findByRole("alert")).toHaveTextContent(uiText.common.forms.required)
  rerender(<PersonContactDialog open={false} {...props}/>)
  rerender(<PersonContactDialog open {...props}/>)
  expect(await screen.findByDisplayValue("09120000000")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button",{name:uiText.people.actions.save}))
  await waitFor(()=>expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({typeOptionId:contactType.id,value:"09120000000",isPrimary:true})))
  expect(onSubmit.mock.calls[onSubmit.mock.calls.length-1]?.[0]).not.toHaveProperty("type")
})
it("Contact create submits the selected lookup id instead of a legacy type string",async()=>{
  const onSubmit=vi.fn().mockResolvedValue(undefined)
  render(<PersonContactDialog open onOpenChange={vi.fn()} isPending={false} onSubmit={onSubmit}/>,{wrapper})
  await userEvent.selectOptions(await screen.findByLabelText(uiText.people.contactHub.type),contactType.id)
  await userEvent.type(screen.getByLabelText(uiText.people.contactHub.value),"02133333333")
  await userEvent.click(screen.getByRole("button",{name:uiText.people.actions.save}))
  await waitFor(()=>expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({typeOptionId:contactType.id,value:"02133333333"})))
  expect(onSubmit.mock.calls[0][0]).not.toHaveProperty("type")
})
it("Contact edit keeps a legacy type display-only until a current lookup option is selected",async()=>{
  const onSubmit=vi.fn().mockResolvedValue(undefined)
  render(<PersonContactDialog open onOpenChange={vi.fn()} isPending={false} onSubmit={onSubmit} contact={{id:"legacy",type:"FAX_LEGACY",typeOptionId:null,value:"02144444444"}}/>,{wrapper})
  expect(await screen.findByText(/FAX_LEGACY/)).toBeInTheDocument()
  expect(screen.getByRole("button",{name:uiText.people.actions.save})).toBeDisabled()
  await userEvent.selectOptions(screen.getByLabelText(uiText.people.contactHub.type),contactType.id)
  await userEvent.click(screen.getByRole("button",{name:uiText.people.actions.save}))
  await waitFor(()=>expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({typeOptionId:contactType.id})))
})
it("Contact display prefers the lookup label and falls back to legacy type",()=>{
  expect(getPersonContactDisplayLabel({type:"WORK",typeOption:contactType},"نامشخص")).toBe("تلفن کاری")
  expect(getPersonContactDisplayLabel({type:"FAX_LEGACY",typeOption:null},"نامشخص")).toBe("FAX_LEGACY")
})
it("Contact form reports lookup loading failure and prevents submission",async()=>{
  vi.mocked(api.get).mockRejectedValueOnce(httpError(500,{error:{message:"دریافت انواع تماس ناموفق بود"}}))
  const onSubmit=vi.fn()
  render(<PersonContactDialog open onOpenChange={vi.fn()} isPending={false} onSubmit={onSubmit}/>,{wrapper})
  expect(await screen.findByText("دریافت انواع تماس ناموفق بود")).toBeInTheDocument()
  expect(screen.getByLabelText(uiText.people.contactHub.type)).toBeDisabled()
  expect(screen.getByRole("button",{name:uiText.people.actions.save})).toBeDisabled()
})
