import { api } from "@/lib/api"
import { createBrowserSession, logoutSession } from "./session.service"
import { unwrapApiResponse } from "@/lib/apiResponse"
import type { AuthUser } from "@/store/authStore"
import type { AuthenticationResponseJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser"
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { accessToken: string; accessTokenExpiresIn?: string; user: AuthUser }
export interface PasskeyAuthenticationOptions { challengeId: string; options: PublicKeyCredentialRequestOptionsJSON }
export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return createBrowserSession("/auth/login", data)
  },
  logout: logoutSession,
  async getPasskeyAuthenticationOptions(): Promise<PasskeyAuthenticationOptions> {
    const response = await api.post("/auth/passkeys/authentication/options", {})
    return unwrapApiResponse<PasskeyAuthenticationOptions>(response.data)
  },
  async verifyPasskeyAuthentication(challengeId: string, response: AuthenticationResponseJSON): Promise<LoginResponse> {
    return createBrowserSession("/auth/passkeys/authentication/verify", { challengeId, response })
  },
}
