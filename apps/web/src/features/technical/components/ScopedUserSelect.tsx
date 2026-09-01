import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { SearchableOptionSelect } from "@/components/shared/SearchableOptionSelect"
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
      <SearchableOptionSelect
        value={scope}
        onChange={changeScope}
        options={[
          { id: "SELF", label: "خودم" },
          { id: "TEAM", label: "تیم" },
          { id: "ORGANIZATION", label: "سازمان" },
        ]}
        search=""
        onSearchChange={() => undefined}
        allowEmpty={false}
        ariaLabel={`${ariaLabel}؛ دامنه انتخاب`}
      />
      {scope === "TEAM" ? (
        <SearchableOptionSelect
          value={teamId}
          onChange={(next) => { setTeamId(next || ""); onChange(undefined) }}
          options={teams.data ?? []}
          search={teamSearch}
          onSearchChange={setTeamSearch}
          loading={teams.isLoading || teams.isFetching}
          allowEmpty={false}
          placeholder="انتخاب تیم"
          ariaLabel={`${ariaLabel}؛ تیم`}
        />
      ) : null}
      {scope !== "SELF" ? (
        <SearchableOptionSelect
          value={value || ""}
          onChange={(next) => onChange(next || undefined)}
          options={users.data ?? []}
          search={userSearch}
          onSearchChange={setUserSearch}
          loading={users.isLoading || users.isFetching}
          disabled={scope === "TEAM" && !teamId}
          allowEmpty={!required}
          placeholder={scope === "TEAM" ? "انتخاب عضو تیم" : "انتخاب از سازمان"}
          ariaLabel={ariaLabel}
        />
      ) : null}
    </div>
  )
}
