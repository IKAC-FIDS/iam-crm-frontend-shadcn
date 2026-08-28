import {keepPreviousData,useMutation,useQuery,useQueryClient} from "@tanstack/react-query"
import {completeFollowUp,getDueFollowUps,rescheduleFollowUp} from "../api/followUps.api"
export const followUpKeys={all:["follow-ups"] as const,due:(p:number,l:number)=>["follow-ups","due",p,l] as const}
export function useDueFollowUps(p=1,l=20,enabled=true){return useQuery({queryKey:followUpKeys.due(p,l),queryFn:()=>getDueFollowUps(p,l),enabled,placeholderData:keepPreviousData})}
function useInvalidation(){const c=useQueryClient();return ()=>Promise.all([c.invalidateQueries({queryKey:followUpKeys.all}),c.invalidateQueries({queryKey:["activities"]}),c.invalidateQueries({queryKey:["dashboard"]})])}
export function useCompleteFollowUp(){const i=useInvalidation();return useMutation({mutationFn:(x:{id:string;outcome?:string;note?:string})=>completeFollowUp(x.id,x.outcome,x.note),onSuccess:i})}
export function useRescheduleFollowUp(){const i=useInvalidation();return useMutation({mutationFn:(x:{id:string;nextActionDate:string;note?:string})=>rescheduleFollowUp(x.id,x.nextActionDate,x.note),onSuccess:i})}
