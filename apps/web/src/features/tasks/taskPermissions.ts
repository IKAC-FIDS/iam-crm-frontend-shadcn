export function canAssignTaskTargets(permissions: string[] | undefined) {
  return Boolean(permissions?.includes("task:assign"))
}

export function canReassignTask(permissions: string[] | undefined) {
  return Boolean(
    permissions?.includes("task:reassign") ||
      permissions?.includes("task:assign")
  )
}
