/**
 * Users API module.
 * Provides current user profile operations and admin user listing.
 * @module
 */
import { request } from '../core/client.ts'
import type { CurrentUser } from './auth.ts'

/** Lightweight user representation used in lists and assignment dropdowns. */
export interface UserSummary {
  /** Unique user identifier. */
  id: number
  /** Login username. */
  username: string
  /** User's first name, or null if not set. */
  firstName: string | null
  /** User's last name, or null if not set. */
  lastName: string | null
  /** Granted authorities (e.g. ROLE_USER, ROLE_ADMIN). */
  roles: string[]
}

/** Payload for updating the current user's profile. */
export interface UpdateProfileRequest {
  /** Updated first name. */
  firstName?: string
  /** Updated last name. */
  lastName?: string
  /** Updated email address. */
  email?: string
}

/** User API methods. */
export const userApi = {
  /** Fetches the current authenticated user's full profile. */
  me: () => request<CurrentUser>('/users/me'),

  /**
   * Updates the current user's profile fields.
   * @param data - Profile fields to update
   * @returns The updated user profile
   */
  updateProfile: (data: UpdateProfileRequest) => request<CurrentUser>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  /** Lists all users in the organization (admin only). */
  list: () => request<UserSummary[]>('/users'),

  /** Deletes a non-admin user account (admin only). */
  delete: (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' }),
}
