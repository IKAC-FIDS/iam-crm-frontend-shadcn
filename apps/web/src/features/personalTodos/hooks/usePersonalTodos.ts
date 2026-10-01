import { useMutation, useQueryClient } from "@tanstack/react-query"
import { operationsKeys } from "@/features/operations/hooks/useOperationsWorkspace"
import { completePersonalTodo, convertPersonalTodo, createPersonalTodo, deletePersonalTodo, reopenPersonalTodo, updatePersonalTodo } from "../api/personalTodos.api"

export const personalTodoKeys = { all: ["personal-todos"] as const }

export function usePersonalTodoMutations() {
  const client = useQueryClient()
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: personalTodoKeys.all }),
      client.invalidateQueries({ queryKey: operationsKeys.all }),
    ])
  }
  return {
    create: useMutation({ mutationFn: createPersonalTodo, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Parameters<typeof updatePersonalTodo>[1] }) => updatePersonalTodo(id, input), onSuccess: invalidate }),
    complete: useMutation({ mutationFn: completePersonalTodo, onSuccess: invalidate }),
    reopen: useMutation({ mutationFn: reopenPersonalTodo, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: deletePersonalTodo, onSuccess: invalidate }),
    convert: useMutation({ mutationFn: convertPersonalTodo, onSuccess: invalidate }),
  }
}
