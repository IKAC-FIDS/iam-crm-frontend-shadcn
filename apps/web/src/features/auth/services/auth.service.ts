import { api } from "@/lib/api"
import { unwrapApiResponse, type ApiWrappedResponse } from "@/lib/apiResponse"
import type { AuthUser } from "@/store/authStore"
import type { AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser"
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { accessToken: string; accessTokenExpiresIn?: string; user: AuthUser }
export interface PasskeyAuthenticationOptions { challengeId: string; options: PublicKeyCredentialRequestOptionsJSON }
export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const r=await api.post<ApiWrappedResponse<LoginResponse>>("/auth/login",data)
    return unwrapApiResponse<LoginResponse>(r.data)
  },
  async logout(): Promise<void> { await api.post("/auth/logout") },
  async getPasskeyAuthenticationOptions(): Promise<PasskeyAuthenticationOptions> {
    const response = await api.post("/auth/passkeys/authentication/options", {})
    return unwrapApiResponse<PasskeyAuthenticationOptions>(response.data)
  },
  async verifyPasskeyAuthentication(challengeId: string, response: AuthenticationResponseJSON): Promise<LoginResponse> {
    const result = await api.post("/auth/passkeys/authentication/verify", { challengeId, response })
    return unwrapApiResponse<LoginResponse>(result.data)
  },
}
