import {Bell} from "lucide-react"
import {useNavigate} from "react-router-dom"
import {Button} from "@workspace/ui/components/button"
import {useUnreadCount} from "../hooks/useNotifications"
export function NotificationBell({enabled}:{enabled:boolean}){const n=useNavigate(),q=useUnreadCount(enabled);if(!enabled)return null;const c=q.data??0;return <Button type="button" variant="ghost" size="icon" className="relative size-10 rounded-xl" aria-label="اعلان‌ها" onClick={()=>n("/attention?tab=notifications")}><Bell className="size-5"/>{c>0?<span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-[var(--destructive)] px-1 text-xs font-bold leading-5 text-white">{c>99?"99+":c}</span>:null}</Button>}
