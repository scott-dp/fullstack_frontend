import { request } from '../core/client.ts'
import type { CurrentUser } from './auth.ts'

export interface OrganizationInvite {
  id: number
  token: string
  organizationId: number
  organizationName: string
  role: string
  createdByUsername: string
  createdAt: string
  expiresAt: string
  accepted: boolean
  acceptedByUsername: string | null
  revoked: boolean
}

export interface CreateOrganizationInviteRequest {
  role: string
  organizationId?: number
  expiresInDays: number
}

export interface AcceptOrganizationInviteRequest {
  token: string
}

export const organizationInviteApi = {
  list: () => request<OrganizationInvite[]>('/organization-invites'),
  create: (data: CreateOrganizationInviteRequest) =>
    request<OrganizationInvite>('/organization-invites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  accept: (data: AcceptOrganizationInviteRequest) =>
    request<CurrentUser>('/organization-invites/accept', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
