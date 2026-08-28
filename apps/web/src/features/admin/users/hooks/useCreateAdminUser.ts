import { useMutation } from "@tanstack/react-query"
import {
  createUser,
  updateUserRole,
  type Role,
  type UserRole,
} from "../api/adminUsersApi"
import type { CreateUserValues } from "../schemas/createUser"

export function useCreateAdminUser() {
  return useMutation({
    mutationFn: async ({
      values,
      roles,
      canChangeRole,
    }: {
      values: CreateUserValues
      roles: Role[]
      canChangeRole: boolean
    }) => {
      const custom = values.roleChoice.startsWith("ROLE:")
        ? roles.find((role) => role.id === values.roleChoice.slice(5))
        : null
      const role = (custom?.baseRole ??
        values.roleChoice.replace("BASE:", "")) as UserRole
      const created = await createUser({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        role,
        teamId: values.teamId || undefined,
      })
      if (custom && canChangeRole)
        await updateUserRole(created.id, {
          roleId: custom.id,
          teamId: values.teamId || null,
        })
      return created
    },
  })
}
