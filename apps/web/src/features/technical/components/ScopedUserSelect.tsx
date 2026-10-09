import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { TaskOptionSelect } from "@/features/tasks/components/TaskOptionSelect"
import { useDebouncedValue } from "@/lib/useDebouncedValue"
import { useAuthStore } from "@/store/authStore"
import { technicalLookups } from "../api"

type Scope = "SELF" | "TEAM" | "ORGANIZATION"

export function ScopedUserSelect({
  value,
  onChange,
  ariaLabel,
  required = false,
}: {
  value?: string | null
  onChange: (value?: string) => void
  ariaLabel: string
  required?: boolean
}) {
  const currentUser = useAuthStore((state) => state.user)
  const [scope, setScope] = useState<Scope>(value === currentUser?.id || (!value && required) ? "SELF" : "ORGANIZATION")
  const [teamId, setTeamId] = useState("")
  const [teamSearch, setTeamSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const debouncedTeamSearch = useDebouncedValue(teamSearch, 250)
  const debouncedUserSearch = useDebouncedValue(userSearch, 250)
  const teams = useQuery({
    queryKey: ["technical-scoped-user-teams", debouncedTeamSearch],
    queryFn: () => technicalLookups("teams", debouncedTeamSearch),
    enabled: scope === "TEAM",
  })
  const users = useQuery({
    queryKey: ["technical-scoped-users", scope, teamId, debouncedUserSearch],
    queryFn: () => technicalLookups("tender-users", debouncedUserSearch, undefined, scope === "TEAM" ? teamId : undefined),
    enabled: scope === "ORGANIZATION" || (scope === "TEAM" && Boolean(teamId)),
  })

  useEffect(() => {
    if (scope === "SELF" && currentUser?.id && value !== currentUser.id) onChange(currentUser.id)
  }, [currentUser?.id, onChange, scope, value])

  function changeScope(next?: string) {
    const selected = (next || "SELF") as Scope
    setScope(selected)
    setTeamId("")
    setUserSearch("")
    onChange(selected === "SELF" ? currentUser?.id : undefined)
  }

  return (
    <div className="grid gap-2">
      <span className="text-xs text-muted-foreground">دامنه انتخاب</span>
      <select
        value={scope}
        onChange={(event) => changeScope(event.target.value)}
        aria-label={`${ariaLabel}؛ دامنه انتخاب`}
        className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:border-[var(--app-primary)]"
      >
        <option value="SELF">خودم</option>
        <option value="TEAM">تیم</option>
        <option value="ORGANIZATION">سازمان</option>
      </select>
      {scope === "TEAM" ? (
        <TaskOptionSelect
          value={teamId}
          selectedOption={(teams.data ?? []).find((option) => option.id === teamId)}
          onChange={(option) => { setTeamId(option?.id || ""); onChange(undefined) }}
          options={teams.data ?? []}
          search={teamSearch}
          onSearchChange={setTeamSearch}
          loading={teams.isLoading || teams.isFetching}
          allowEmpty={false}
          placeholder="انتخاب تیم"
        />
      ) : null}
      {scope !== "SELF" ? (
        <TaskOptionSelect
          value={value || ""}
          selectedOption={(users.data ?? []).find((option) => option.id === value)}
          onChange={(option) => onChange(option?.id)}
          options={users.data ?? []}
          search={userSearch}
          onSearchChange={setUserSearch}
          loading={users.isLoading || users.isFetching}
          disabled={scope === "TEAM" && !teamId}
          allowEmpty={!required}
          placeholder={scope === "TEAM" ? "انتخاب عضو تیم" : "انتخاب از سازمان"}
        />
      ) : null}
    </div>
  )
}
