import { api } from "@/lib/api"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { PersonalTodo, PersonalTodoInput } from "../types/personalTodo.types"

export async function createPersonalTodo(input: PersonalTodoInput) {
  const response = await api.post("/personal-todos", input)
  return unwrapApiResponse<PersonalTodo>(response.data)
}
export async function updatePersonalTodo(id: string, input: Partial<PersonalTodoInput>) {
  const response = await api.patch(`/personal-todos/${id}`, input)
  return unwrapApiResponse<PersonalTodo>(response.data)
}
export async function completePersonalTodo(id: string) {
  const response = await api.patch(`/personal-todos/${id}/complete`)
  return unwrapApiResponse<{ todo: PersonalTodo; nextOccurrence?: PersonalTodo | null }>(response.data)
}
export async function reopenPersonalTodo(id: string) {
  const response = await api.patch(`/personal-todos/${id}/reopen`)
  return unwrapApiResponse<PersonalTodo>(response.data)
}
export async function deletePersonalTodo(id: string) {
  await api.delete(`/personal-todos/${id}`)
}
export async function convertPersonalTodo(id: string) {
  const response = await api.post(`/personal-todos/${id}/convert-to-task`)
  return unwrapApiResponse(response.data)
}
