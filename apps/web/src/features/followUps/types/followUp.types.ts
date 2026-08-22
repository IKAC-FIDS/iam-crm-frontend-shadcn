export type ActivityType="CALL"|"EMAIL"|"LINKEDIN_MESSAGE"|"LINKEDIN_ENGAGEMENT"|"MEETING"|"NOTE"|"STAGE_CHANGE"
export interface FollowUpActivity {
 id:string; companyId:string; personId?:string|null; userId?:string|null; opportunityId?:string|null;
 type:ActivityType; notes?:string|null; outcome?:string|null; occurredAt?:string|null; nextActionDate?:string|null;
 company?:{id:string;legalName:string;brandName?:string|null}|null;
 person?:{id:string;fullName:string}|null; user?:{id:string;fullName:string;email?:string|null}|null;
}
export interface FollowUpPage {data:FollowUpActivity[];meta:{total:number;page:number;limit:number;totalPages:number}}
export type FollowUpFilter="ALL"|"OVERDUE"|"TODAY"|"UPCOMING"
