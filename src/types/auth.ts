/**
 * Shared authentication-related frontend types consumed across views and stores.
 */
export interface AuthRequest {
  username: string
  password: string
}

export interface CurrentUser {
  id: number
  username: string
  roles: string[]
}

export interface AuthStatusResponse {
  authenticated: boolean
  user: CurrentUser | null
}

export interface AuthResponse {
  message: string
  user: CurrentUser
}

export interface ApiErrorPayload {
  message: string
  status: number
  timestamp: string
  errors?: Record<string, string>
}
