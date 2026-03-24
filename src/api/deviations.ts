import { request } from './client'

export interface DeviationComment {
  id: number
  authorUsername: string
  content: string
  createdAt: string
}

export interface Deviation {
  id: number
  title: string
  description: string
  category: string
  severity: string
  status: string
  reportedByUsername: string
  assignedToUsername: string | null
  resolvedByUsername: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  comments: DeviationComment[]
}

export interface CreateDeviationRequest {
  title: string
  description: string
  category: string
  severity: string
}

export interface UpdateDeviationRequest {
  status?: string
  assignedToId?: number
}

export const deviationApi = {
  list: (status?: string, category?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    const query = params.toString()
    return request<Deviation[]>(`/deviations${query ? '?' + query : ''}`)
  },
  get: (id: number) => request<Deviation>(`/deviations/${id}`),
  create: (data: CreateDeviationRequest) => request<Deviation>('/deviations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: UpdateDeviationRequest) => request<Deviation>(`/deviations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addComment: (id: number, content: string) => request<DeviationComment>(`/deviations/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
}
