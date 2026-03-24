import { request } from './client'

export interface AuthRequest {
  username: string
  password: string
}

export interface CurrentUser {
  id: number
  username: string
  firstName: string | null
  lastName: string | null
  email: string | null
  roles: string[]
  organizationId: number | null
  organizationName: string | null
}

export interface AuthResponse {
  message: string
  user: CurrentUser
}

export interface AuthStatusResponse {
  authenticated: boolean
  user: CurrentUser | null
}

export const authApi = {
  login: (data: AuthRequest) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: AuthRequest) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  status: () => request<AuthStatusResponse>('/auth/status'),
}
