import {createRoot} from "react-dom/client"
import {QueryClient,QueryClientProvider} from "@tanstack/react-query"
import {MemoryRouter,Routes,Route} from "react-router-dom"
import "@workspace/ui/globals.css"
import "./styles/globals.css"
import {ActivitiesPage} from "./features/activities/pages/ActivitiesPage"
import {MeetingsPage} from "./features/meetings/pages/MeetingsPage"
import {TasksPage} from "./features/tasks/pages/TasksPage"
import {PeoplePage} from "./features/people/pages/PeoplePage"
import {AdminTeamsPage} from "./features/admin/teams/pages/AdminTeamsPage"
import {AdminAuditLogsPage} from "./features/admin/audit-logs/pages/AdminAuditLogsPage"
import {AdminLibrariesPage} from "./features/admin/libraries/pages/AdminLibrariesPage"
import {AttentionCenterPage} from "./features/attention/pages/AttentionCenterPage"
import {CompanyDetailPage} from "./features/companies/pages/CompanyDetailPage"
import {useAuthStore,normalizeAuthUser} from "./store/authStore"
import {api} from "./lib/api"
const permissions=["company:view","company:update","person:view","person:create","activity:view","activity:create","meeting:view","meeting:create","task:view","task:create","team:view","team:manage","audit-log:view","product:view","product:manage","follow-up:view","notification:view"]
useAuthStore.setState({user:normalizeAuthUser({id:"qa",fullName:"کاربر آزمایشی",email:"qa@example.test",role:"ADMIN",permissions}),status:"authenticated"})
const company={id:"c1",legalName:"شرکت نمونه آزمایشی",brandName:"نمونه",priority:"HIGH"}
const meetingType={id:"demo",code:"DEMO",label:"جلسه دمو",sortOrder:0,isActive:true}
api.defaults.adapter=async config=>{
 if(config.method!=="get")throw new Error("Read-only QA fixture")
 const url=config.url||"";const params=config.params||{};let data:unknown=[]
 if(url.includes("types/options"))data=url.startsWith("/meetings")?[meetingType]:[{id:"call",code:"CALL",label:"تماس تلفنی",isActive:true}]
 else if(url==="/companies/c1")data=company
 else if(url.endsWith("/360"))data={}
 else if(url.endsWith("/summary"))data={totalEvents:60,uniqueActors:2,byAction:[],byEntityType:[],byActor:[],trend:[]}
 else if(url.endsWith("/filter-options"))data={actors:[],entityTypes:[],actions:[],requestMethods:[]}
 else if(url.includes("unread-count"))data={count:2}
 else {
 let rows:unknown[]=[]
 for(let i=0;i<4;i++){
 const id=`${url}-${i}`
 if(url==="/companies")rows.push({...company,id})
 if(url==="/activities")rows.push({id,type:"CALL",outcome:"تماس و هماهنگی برنامه اجرایی با شرکت نمونه",status:"RECORDED",company,createdAt:"2026-08-28T09:00:00Z"})
 if(url==="/meetings")rows.push({id,title:"جلسه هماهنگی برنامه‌ریزی و بررسی نیازمندی‌ها",companyId:"c1",company,type:meetingType,meetingTypeId:"demo",mode:"ONLINE",status:"SCHEDULED",startAt:"2026-08-28T09:00:00Z",endAt:"2026-08-28T10:00:00Z",assignees:[],attendees:[]})
 if(url==="/tasks")rows.push({id,title:"پیگیری اجرای مراحل پروژه و هماهنگی تیم",status:"TODO",priority:"HIGH",company})
 if(url==="/people/directory")rows.push({id,fullName:"شخص نمونه آزمایشی",companyId:"c1",company,jobTitle:"مدیر پروژه"})
 if(url==="/teams")rows.push({id,name:"تیم اجرایی نمونه",code:`TEAM${i}`,isActive:true,memberCount:5})
 if(url==="/product-catalog")rows.push({id,name:"محصول آزمایشی",code:`P${i}`,type:"HARDWARE",isActive:true,inPersonPriceIRR:"10000000",digikalaPriceIRR:"12000000"})
 if(url==="/notifications")rows.push({id,title:"اعلان تغییر وضعیت پروژه",body:"هماهنگی‌های لازم برای جلسه انجام شد",priority:"HIGH",type:"SYSTEM",createdAt:"2026-08-28T09:00:00Z"})
 if(url==="/admin/audit-logs")rows.push({id,entityType:"MEETING",entityId:"m1",action:"UPDATE",createdAt:"2026-08-28T09:00:00Z",changedFields:["title"],request:{},actor:{fullName:"کاربر آزمایشی"}})
 }
 data={data:rows,meta:{page:params.page||1,limit:params.limit||20,total:60,totalPages:3,hasNext:true,hasPrevious:false}}
 }
 return {data,status:200,statusText:"OK",headers:{},config}
}
const path=new URLSearchParams(location.search).get("screen")||"/activities"
createRoot(document.getElementById("root")!).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={[path]}><div style={{padding:16,maxWidth:1500,margin:"auto"}}><Routes><Route path="/activities" element={<ActivitiesPage/>}/><Route path="/meetings" element={<MeetingsPage/>}/><Route path="/tasks" element={<TasksPage/>}/><Route path="/people" element={<PeoplePage/>}/><Route path="/admin/teams" element={<AdminTeamsPage/>}/><Route path="/admin/audit-logs" element={<AdminAuditLogsPage/>}/><Route path="/admin/libraries" element={<AdminLibrariesPage/>}/><Route path="/attention" element={<AttentionCenterPage/>}/><Route path="/companies/:companyId" element={<CompanyDetailPage/>}/></Routes></div></MemoryRouter></QueryClientProvider>)
