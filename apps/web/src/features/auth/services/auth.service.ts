import { api } from "@/lib/api"
import { unwrapApiResponse, type ApiWrappedResponse } from "@/lib/apiResponse"
import type { AuthUser } from "@/store/authStore"
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { accessToken: string; accessTokenExpiresIn?: string; user: AuthUser }
export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const r=await api.post<ApiWrappedResponse<LoginResponse>>("/auth/login",data)
    return unwrapApiResponse<LoginResponse>(r.data)
  },
  async logout(): Promise<void> { await api.post("/auth/logout") },
}