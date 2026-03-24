import { request } from './client'

export interface OrganizationSummary {
  id: number
  name: string
  organizationNumber: string | null
  address: string | null
  phone: string | null
  type: string
  createdAt: string
}

export const organizationApi = {
  list: () => request<OrganizationSummary[]>('/organizations'),
}
