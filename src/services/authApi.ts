/**
 * Backward-compatible auth service wrapper preserved for older imports and tests.
 */
import { httpClient } from './httpClient'
import type { AuthRequest, AuthResponse, AuthStatusResponse, CurrentUser } from '../types/auth'

export const authApi = {
  login: (payload: AuthRequest) => httpClient.post<AuthResponse>('/api/auth/login', payload),
  register: (payload: AuthRequest) => httpClient.post<AuthResponse>('/api/auth/register', payload),
  logout: () => httpClient.post<void>('/api/auth/logout'),
  getAuthStatus: () => httpClient.get<AuthStatusResponse>('/api/auth/status'),
  getCurrentUser: () => httpClient.get<CurrentUser>('/api/users/me'),
}
