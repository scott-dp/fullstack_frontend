import { request } from '../core/client.ts'

export interface OrganizationAdminSummary {
  id: number
  username: string
  firstName: string | null
  lastName: string | null
  email: string
  organizationId: number | null
  organizationName: string | null
  active: boolean
  setupPending: boolean
  createdAt: string
}

export interface CreateOrganizationAdminRequest {
  organizationName: string
  organizationNumber?: string
  organizationType: string
  firstName: string
  lastName?: string
  email: string
}

export const superAdminApi = {
  listOrganizationAdmins: () =>
    request<OrganizationAdminSummary[]>('/superadmin/organization-admins'),

  createOrganizationAdmin: (data: CreateOrganizationAdminRequest) =>
    request<OrganizationAdminSummary>('/superadmin/organization-admins', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  archiveOrganizationAdmin: (id: number) =>
    request<void>(`/superadmin/organization-admins/${id}`, { method: 'DELETE' }),
}
