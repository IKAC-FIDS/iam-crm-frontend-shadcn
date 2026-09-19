import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeEach, expect, it, vi } from "vitest"
import { useState, type ReactNode } from "react"
import { ActivitiesPage } from "@/features/activities/pages/ActivitiesPage"
import { MeetingsPage } from "@/features/meetings/pages/MeetingsPage"
import { TasksPage } from "@/features/tasks/pages/TasksPage"
import { AdminAuditLogsPage } from "@/features/admin/audit-logs/pages/AdminAuditLogsPage"
import { AdminExchangeRatesPage } from "@/features/admin/exchange-rates/pages/AdminExchangeRatesPage"
import { AdminLibrariesPage } from "@/features/admin/libraries/pages/AdminLibrariesPage"
import { AdminPipelinePage } from "@/features/admin/pipeline/pages/AdminPipelinePage"
import { AdminTeamDetailsPage } from "@/features/admin/teams/pages/AdminTeamDetailsPage"
import { AdminTeamsPage } from "@/features/admin/teams/pages/AdminTeamsPage"
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
  useAuthStore.setState({user:{...user,permissions:["activity:view","meeting:view","task:view","team:view","audit-log:view","product:view","exchange-rate:view","financial:view","pipeline:config:view","pipeline:config:manage","pipeline:transition:view","pipeline:transition:manage"]},status:"authenticated"})
  vi.mocked(api.get).mockImplementation(async(url,config)=>{
    const params=config?.params as {page?:number;limit?:number}|undefined
    if(url==="/teams/t1")return response(team)
    if(url==="/teams/t1/members")return response(members)
    if(url==="/teams")return page([team],params)
    if(url==="/admin/audit-logs/summary")return response({totalEvents:60,uniqueActors:2,byAction:[],byEntityType:[],byActor:[],trend:[]})
    if(url==="/admin/audit-logs/filter-options")return response({actors:[],entityTypes:[],actions:[],requestMethods:[]})
    if(String(url).includes("types/options"))return response([{id:"demo",code:"DEMO",label:"جلسه دمو",isActive:true}])
    if(url==="/activities/types")return response([{id:"call",code:"CALL",label:"تماس",isActive:true}])
    if(url==="/activities")return page([{id:"a1",type:"CALL",outcome:"فعالیت نمونه",status:"RECORDED"}],params)
    if(url==="/meetings")return page([{id:"m1",title:"جلسه نمونه",status:"SCHEDULED",mode:"ONLINE",startAt:"2026-08-28T10:00:00Z",endAt:"2026-08-28T11:00:00Z",assignees:[],attendees:[],type:{id:"demo",code:"DEMO",label:"جلسه دمو"}}],params)
    if(url==="/tasks")return page([{id:"task1",title:"کار نمونه",status:"TODO",priority:"MEDIUM"}],params)
    if(url==="/admin/exchange-rates/current")return response({id:"rate-current",rate:"1050000",validFrom:"2026-09-01T08:00:00Z",status:"ACTIVE",createdBy:{id:"u1",fullName:"مدیر مالی",email:"finance@example.test"}})
    if(url==="/admin/exchange-rates")return page([{id:"rate-current",rate:"1050000",validFrom:"2026-09-01T08:00:00Z",status:"ACTIVE",note:"نرخ شهریور",createdBy:{id:"u1",fullName:"مدیر مالی",email:"finance@example.test"}}],params)
    if(url==="/admin/pipeline/stages")return response([
      {id:"s1",code:"LEAD",label:"سرنخ",sortOrder:10,color:"#2563EB",isActive:true,isTerminal:false,terminalType:"NONE",isDefault:true},
      {id:"s2",code:"WON",label:"موفق",sortOrder:20,color:"#16A34A",isActive:true,isTerminal:true,terminalType:"WON",isDefault:false},
    ])
    if(url==="/admin/pipeline/transitions")return response([
      {id:"tr1",fromStageId:"s1",toStageId:"s2",fromStage:{id:"s1",code:"LEAD",label:"سرنخ"},toStage:{id:"s2",code:"WON",label:"موفق"},role:null,isAllowed:true},
    ])
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
  expect(await screen.findByText("فعالیت نمونه")).toBeInTheDocument()
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
  expect(await screen.findByText("جلسه نمونه")).toBeInTheDocument()
  expectParams("/meetings",{page:2,limit:50,meetingTypeId:"demo"})
  expect(screen.queryByRole("button",{name:uiText.meetings.actions.create})).not.toBeInTheDocument()
})
it("Tasks preserves priority and server paging when changing page size",async()=>{
  mount(<TasksPage/>,"/tasks?view=list&page=2&priority=HIGH")
  expect(await screen.findByText("کار نمونه")).toBeInTheDocument()
  expectParams("/tasks",{page:2,priority:"HIGH"})
  await userEvent.selectOptions(screen.getByLabelText(uiText.common.pagination.rowsPerPage),"50")
  await waitFor(()=>expectParams("/tasks",{page:1,limit:50,priority:"HIGH"}))
})
it("Tasks sends organization-work filters to the server",async()=>{
  mount(<TasksPage/>,"/tasks?view=list&teamId=t1&dueState=overdue&linkedEntityType=MEETING&quick=organization")
  expect(await screen.findByText("کار نمونه")).toBeInTheDocument()
  expectParams("/tasks",{teamId:"t1",dueState:"overdue",linkedEntityType:"MEETING",view:"organization"})
})
it("Audit deep links preserve every operational filter at the API boundary",async()=>{
  mount(<AdminAuditLogsPage/>,"/admin/audit-logs?entityType=MEETING&entityId=m1&actorId=u1&action=UPDATE&search=demo&requestId=r1&path=%2Fmeetings&ip=127.0.0.1&page=2&limit=50")
  await waitFor(()=>expectParams("/admin/audit-logs",{entityType:"MEETING",entityId:"m1",actorId:"u1",action:"UPDATE",search:"demo",requestId:"r1",requestPath:"/meetings",ipAddress:"127.0.0.1",page:2,limit:50}))
})
it("Products preserves hardware/software filtering and resets the server page",async()=>{
  mount(<AdminLibrariesPage/>,"/admin/libraries?section=products&type=HARDWARE&page=2")
  expect(await screen.findByText("محصول نمونه")).toBeInTheDocument()
  expect(screen.queryByRole("table")).not.toBeInTheDocument()
  expectParams("/product-catalog",{page:2,type:"HARDWARE"})
  await userEvent.selectOptions(screen.getByLabelText(uiText.products.type),"SOFTWARE")
  await waitFor(()=>expectParams("/product-catalog",{page:1,type:"SOFTWARE"}))
})
it("Libraries opens with section buttons and supports dedicated section routes",async()=>{
  const overview=mount(<AdminLibrariesPage/>,"/admin/libraries")
  const productsButton=await screen.findByRole("button",{name:/محصولات/})
  await userEvent.click(productsButton)
  expect(overview.router.state.location.pathname).toBe("/admin/libraries/products")

  mount(
    <AdminLibrariesPage/>,
    "/admin/libraries/products",
    "/admin/libraries/:sectionId"
  )
  expect(await screen.findByText("محصول نمونه")).toBeInTheDocument()
  expect(screen.queryByRole("table")).not.toBeInTheDocument()
  expect(screen.queryByText("انتخاب کتابخانه")).not.toBeInTheDocument()
})
it("Team members paginate the returned array without inventing server page requests",async()=>{
  mount(<AdminTeamDetailsPage/>,"/admin/teams/t1","/admin/teams/:teamId")
  expect(await screen.findByText("عضو 0")).toBeInTheDocument()
  expect(screen.queryByRole("table")).not.toBeInTheDocument()
  expect(screen.queryByText("عضو 20")).not.toBeInTheDocument()
  await userEvent.click(screen.getByRole("button",{name:uiText.common.pagination.next}))
  expect(screen.getByText("عضو 20")).toBeInTheDocument()
  expect(screen.queryByText("عضو 0")).not.toBeInTheDocument()
  expect(vi.mocked(api.get).mock.calls.filter(([url])=>url==="/teams/t1/members")).toHaveLength(1)
})
it("Teams uses one standard card view while preserving legacy view links",async()=>{
  mount(<AdminTeamsPage/>,"/admin/teams?view=TABLE&page=2&status=ACTIVE")
  expect(await screen.findByText("تیم نمونه")).toBeInTheDocument()
  expect(screen.queryByRole("table")).not.toBeInTheDocument()
  expect(screen.queryByRole("button",{name:"نمای جدول"})).not.toBeInTheDocument()
  expectParams("/teams",{page:2,isActive:true})
})
it("Exchange-rate history uses the standard card list and keeps server pagination",async()=>{
  mount(<AdminExchangeRatesPage/>,"/admin/exchange-rates")
  expect(await screen.findAllByText("۱٬۰۵۰٬۰۰۰ ریال")).not.toHaveLength(0)
  expect(screen.getByText("نرخ شهریور")).toBeInTheDocument()
  expect(screen.queryByRole("table")).not.toBeInTheDocument()
  expectParams("/admin/exchange-rates",{page:1,limit:20})
  await userEvent.selectOptions(screen.getByLabelText(uiText.common.pagination.rowsPerPage),"50")
  await waitFor(()=>expectParams("/admin/exchange-rates",{page:1,limit:50}))
})
it("Pipeline keeps its comparison matrix and uses standard cards for the operational rule list",async()=>{
  mount(<AdminPipelinePage/>,"/admin/pipeline")
  expect(await screen.findAllByText("سرنخ")).not.toHaveLength(0)
  await userEvent.click(screen.getAllByRole("button",{name:"ویرایش"})[0]!)
  expect(screen.getByDisplayValue("سرنخ")).toBeInTheDocument()
  expect(screen.getByDisplayValue("LEAD")).toBeDisabled()
  await userEvent.click(screen.getByRole("button",{name:"انصراف"}))
  await userEvent.click(screen.getByRole("tab",{name:"قوانین انتقال"}))
  expect(await screen.findByRole("table")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button",{name:"لیست"}))
  expect(screen.queryByRole("table")).not.toBeInTheDocument()
  expect(screen.getByText("سرنخ ← موفق")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button",{name:"ویرایش"}))
  expect(screen.getByDisplayValue("سرنخ")).toBeInTheDocument()
  expect(screen.getByDisplayValue("موفق")).toBeInTheDocument()
  await userEvent.click(screen.getByRole("button",{name:"انصراف"}))
  expect(screen.getByRole("button",{name:"حذف"})).toBeInTheDocument()
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
