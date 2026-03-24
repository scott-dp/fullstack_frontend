/**
 * Authentication API module.
 * Provides login, registration, logout, and session status operations.
 * @module
 */
import { request } from './client'

/** Credentials payload for login and registration. */
export interface AuthRequest {
  /** Unique username. */
  username: string
  /** User password. */
  password: string
}

/** Authenticated user profile returned from the server. */
export interface CurrentUser {
  /** Unique user identifier. */
  id: number
  /** Login username. */
  username: string
  /** User's first name, or null if not set. */
  firstName: string | null
  /** User's last name, or null if not set. */
  lastName: string | null
  /** User's email address, or null if not set. */
  email: string | null
  /** Granted authorities (e.g. ROLE_USER, ROLE_ADMIN). */
  roles: string[]
  /** Organization the user belongs to, or null. */
  organizationId: number | null
  /** Display name of the user's organization, or null. */
  organizationName: string | null
}

/** Response body for successful login or registration. */
export interface AuthResponse {
  /** Server confirmation message. */
  message: string
  /** The authenticated user's profile. */
  user: CurrentUser
}

/** Response body for the session status check. */
export interface AuthStatusResponse {
  /** Whether the current session is authenticated. */
  authenticated: boolean
  /** The current user if authenticated, otherwise null. */
  user: CurrentUser | null
}

/** Authentication API methods. */
export const authApi = {
  /**
   * Authenticates a user with username and password.
   * @param data - Login credentials
   * @returns The auth response containing the user profile
   */
  login: (data: AuthRequest) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Registers a new user account.
   * @param data - Registration credentials
   * @returns The auth response containing the new user profile
   */
  register: (data: AuthRequest) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  /** Logs out the current user and invalidates the session cookie. */
  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  /** Checks whether the current session is authenticated. */
  status: () => request<AuthStatusResponse>('/auth/status'),
}
