/**
 * Routine API types and helpers for CRUD, reviews, and archive state changes.
 */
import { request } from '../core/client.ts'

export interface Routine {
  id: number
  name: string
  moduleType: string
  category: string
  description: string | null
  purpose: string | null
  responsibleRole: string
  frequencyType: string
  stepsText: string | null
  whatIsDeviationText: string | null
  correctiveActionText: string | null
  requiredEvidenceText: string | null
  linkedChecklistTemplateId: number | null
  linkedChecklistTemplateName: string | null
  active: boolean
  reviewIntervalDays: number | null
  lastReviewedAt: string | null
  versionNumber: number
  createdByUsername: string | null
  createdAt: string
  updatedAt: string
}

export interface RoutineReview {
  id: number
  routineId: number
  reviewedByUsername: string
  reviewedAt: string
  notes: string | null
  nextReviewAt: string | null
}

export interface CreateRoutineRequest {
  name: string
  moduleType: string
  category: string
  description?: string
  purpose?: string
  responsibleRole: string
  frequencyType: string
  stepsText?: string
  whatIsDeviationText?: string
  correctiveActionText?: string
  requiredEvidenceText?: string
  linkedChecklistTemplateId?: number | null
  reviewIntervalDays?: number | null
}

export interface UpdateRoutineRequest {
  name?: string
  moduleType?: string
  category?: string
  description?: string
  purpose?: string
  responsibleRole?: string
  frequencyType?: string
  stepsText?: string
  whatIsDeviationText?: string
  correctiveActionText?: string
  requiredEvidenceText?: string
  linkedChecklistTemplateId?: number | null
  reviewIntervalDays?: number | null
}

export const routineApi = {
  list: (moduleType?: string, category?: string, active?: boolean) => {
    const params = new URLSearchParams()
    if (moduleType) params.set('moduleType', moduleType)
    if (category) params.set('category', category)
    if (active !== undefined) params.set('active', String(active))
    const query = params.toString()
    return request<Routine[]>(`/routines${query ? '?' + query : ''}`)
  },

  get: (id: number) => request<Routine>(`/routines/${id}`),

  create: (data: CreateRoutineRequest) =>
    request<Routine>('/routines', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: UpdateRoutineRequest) =>
    request<Routine>(`/routines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  archive: (id: number) =>
    request<Routine>(`/routines/${id}/archive`, { method: 'POST' }),

  unarchive: (id: number) =>
    request<Routine>(`/routines/${id}/unarchive`, { method: 'POST' }),

  delete: (id: number) =>
    request<void>(`/routines/${id}`, { method: 'DELETE' }),

  review: (id: number, notes?: string) =>
    request<RoutineReview>(`/routines/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ notes: notes || '' }),
    }),

  history: (id: number) =>
    request<RoutineReview[]>(`/routines/${id}/history`),
}
