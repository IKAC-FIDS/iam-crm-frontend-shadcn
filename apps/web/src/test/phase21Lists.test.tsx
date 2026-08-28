import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"
import { useState, type ReactNode } from "react"
import { ActivitiesPage } from "@/features/activities/pages/ActivitiesPage"
import { MeetingsPage } from "@/features/meetings/pages/MeetingsPage"
import { TasksPage } from "@/features/tasks/pages/TasksPage"
import { AdminAuditLogsPage } from "@/features/admin/audit-logs/pages/AdminAuditLogsPage"
import { AdminLibrariesPage } from "@/features/admin/libraries/pages/AdminLibrariesPage"
import { AdminTeamDetailsPage } from "@/features/admin/teams/pages/AdminTeamDetailsPage"
import { useCompanyActivities, useCompanyTasks } from "@/features/companies/hooks/useCompany360Sections"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"
import { uiText } from "@/config/uiText"
import { response, user } from "./fixtures"

vi.mock("@/lib/api", () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))
const team = { id: "t1", code: "TEAM", name: "تیم نمونه", memberCount: 25, isActive: true }
const members = Array.from({length:25},(_,index)=>({id:`u${index}`,fullName:`عضو ${index}`,email:`u${index}@example.test`,role:"REP",isActive:true}))
function page(data:unknown[],params?:{page?:number;limit?:number}) {
  return response({data,meta:{page:params?.page??1,limit:params?.limit??20,total:60,totalPages:3,hasNext:true,hasPrevious:false}})
}
beforeEach(()=>{
  vi.clearAllMocks()
  useAuthStore.setState({user:{...user,permissions:["activity:view","meeting:view","task:view","team:view","audit-log:view","product:view"]},status:"authenticated"})
  vi.mocked(api.get).mockImplementation(async(url,config)=>{
    const params=config?.params as {page?:number;limit?:number}|undefined
    if(url==="/teams/t1")return response(team)
    if(url==="/teams/t1/members")return response(members)
    if(url==="/admin/audit-logs/summary")return response({totalEvents:60,uniqueActors:2,byAction:[],byEntityType:[],byActor:[],trend:[]})
    if(url==="/admin/audit-logs/filter-options")return response({actors:[],entityTypes:[],actions:[],requestMethods:[]})
    if(String(url).includes("types/options"))return response([{id:"demo",code:"DEMO",label:"جلسه دمو",isActive:true}])
    if(url==="/activities/types")return response([{id:"call",code:"CALL",label:"تماس",isActive:true}])
    if(url==="/activities")return page([{id:"a1",type:"CALL",outcome:"فعالیت نمونه",status:"RECORDED"}],params)
    if(url==="/meetings")return page([{id:"m1",title:"جلسه نمونه",status:"SCHEDULED",mode:"ONLINE",startAt:"2026-08-28T10:00:00Z",endAt:"2026-08-28T11:00:00Z",assignees:[],attendees:[],type:{id:"demo",code:"DEMO",label:"جلسه دمو"}}],params)
    if(url==="/tasks")return page([{id:"task1",title:"کار نمونه",status:"TODO",priority:"MEDIUM"}],params)
    if(url==="/product-catalog")return page([{id:"p1",name:"محصول نمونه",code:"P1",type:"HARDWARE",isActive:true,inPersonPriceIRR:"100",digikalaPriceIRR:"200"}],params)
    return page([],params)
  })
})
function mount(element:ReactNode,url:string,path="*"){
  const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})
  const router=createMemoryRouter([{path,element}],{initialEntries:[url]})
  render(<QueryClientProvider client={client}><RouterProvider router={router}/></QueryClientProvider>)
  return {router,client}
}
function expectParams(url:string,params:object){expect(api.get).toHaveBeenCalledWith(url,expect.objectContaining({params:expect.objectContaining(params)}))}
it("Activities retains URL filters, uses server paging, and resets page on status changes",async()=>{
  const {router}=mount(<ActivitiesPage/>,"/activities?page=2&limit=20&activityType=CALL&companyId=c1")
  expect(await screen.findByRole("table")).toHaveTextContent("فعالیت نمونه")
  expectParams("/activities",{page:2,limit:20,companyId:"c1",activityType:"CALL"})
  await userEvent.selectOptions(screen.getByLabelText("وضعیت"),"COMPLETED")
  await waitFor(()=>expectParams("/activities",{page:1,status:"COMPLETED"}))
  await act(()=>router.navigate(-1))
  await waitFor(()=>expectParams("/activities",{page:2,activityType:"CALL"}))
  await userEvent.click(screen.getByRole("button",{name:uiText.common.pagination.next}))
  await waitFor(()=>expectParams("/activities",{page:3,limit:20}))
})
it("Meetings preserves list view and sends meeting type to the server",async()=>{
  mount(<MeetingsPage/>,"/meetings?view=list&meetingTypeId=demo&page=2&limit=50")
  expect(await screen.findByRole("table")).toHaveTextContent("جلسه نمونه")
  expectParams("/meetings",{page:2,limit:50,meetingTypeId:"demo"})
  expect(screen.queryByRole("button",{name:uiText.meetings.actions.create})).not.toBeInTheDocument()
})
it("Tasks preserves priority and server paging when changing page size",async()=>{
  mount(<TasksPage/>,"/tasks?view=list&page=2&priority=HIGH")
  expect(await screen.findByRole("table")).toHaveTextContent("کار نمونه")
  expectParams("/tasks",{page:2,priority:"HIGH"})
  await userEvent.selectOptions(screen.getByLabelText(uiText.common.pagination.rowsPerPage),"50")
  await waitFor(()=>expectParams("/tasks",{page:1,limit:50,priority:"HIGH"}))
})
it("Audit deep links preserve every operational filter at the API boundary",async()=>{
  mount(<AdminAuditLogsPage/>,"/admin/audit-logs?entityType=MEETING&entityId=m1&actorId=u1&action=UPDATE&search=demo&requestId=r1&path=%2Fmeetings&ip=127.0.0.1&page=2&limit=50")
  await waitFor(()=>expectParams("/admin/audit-logs",{entityType:"MEETING",entityId:"m1",actorId:"u1",action:"UPDATE",search:"demo",requestId:"r1",requestPath:"/meetings",ipAddress:"127.0.0.1",page:2,limit:50}))
})
it("Products preserves hardware/software filtering and resets the server page",async()=>{
  mount(<AdminLibrariesPage/>,"/admin/libraries?section=products&type=HARDWARE&page=2")
  expect(await screen.findByRole("table")).toHaveTextContent("محصول نمونه")
  expectParams("/product-catalog",{page:2,type:"HARDWARE"})
  await userEvent.selectOptions(screen.getByLabelText(uiText.products.type),"SOFTWARE")
  await waitFor(()=>expectParams("/product-catalog",{page:1,type:"SOFTWARE"}))
})
it("Team members paginate the returned array without inventing server page requests",async()=>{
  mount(<AdminTeamDetailsPage/>,"/admin/teams/t1","/admin/teams/:teamId")
  const table=await screen.findByRole("table")
  expect(within(table).getByText("عضو 0")).toBeInTheDocument()
  expect(within(table).queryByText("عضو 20")).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole("button",{name:uiText.common.pagination.next}))
  expect(within(table).getByText("عضو 20")).toBeInTheDocument()
  expect(within(table).queryByText("عضو 0")).not.toBeInTheDocument()
  expect(vi.mocked(api.get).mock.calls.filter(([url])=>url==="/teams/t1/members")).toHaveLength(1)
})
function CompanySections(){
  const [activityPage,setActivityPage]=useState(1)
  const activities=useCompanyActivities("c1",activityPage,10)
  const tasks=useCompanyTasks("c1",1,20)
  return <><button onClick={()=>setActivityPage(2)}>next activity</button><output>{activities.data?.meta.page}:{tasks.data?.meta.page}</output></>
}
it("Company 360 section queries keep independent page sizes and cache keys",async()=>{
  mount(<CompanySections/>,"/companies/c1")
  await screen.findByText("1:1")
  await userEvent.click(screen.getByText("next activity"))
  await screen.findByText("2:1")
  expectParams("/activities",{companyId:"c1",page:2,limit:10})
  expectParams("/tasks",{companyId:"c1",page:1,limit:20})
  expect(vi.mocked(api.get).mock.calls.filter(([url])=>url==="/tasks")).toHaveLength(1)
})
