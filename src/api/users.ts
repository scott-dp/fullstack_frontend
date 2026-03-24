import { request } from './client'
import type { CurrentUser } from './auth'

export interface UserSummary {
  id: number
  username: string
  firstName: string | null
  lastName: string | null
  roles: string[]
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
}

export const userApi = {
  me: () => request<CurrentUser>('/users/me'),
  updateProfile: (data: UpdateProfileRequest) => request<CurrentUser>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  list: () => request<UserSummary[]>('/users'),
}
