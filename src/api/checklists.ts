import { request } from './client'

export interface ChecklistItem {
  id: number
  description: string
  sortOrder: number
  requiresComment: boolean
}

export interface ChecklistTemplate {
  id: number
  title: string
  description: string | null
  frequency: string
  category: string
  active: boolean
  items: ChecklistItem[]
  createdByUsername: string
  createdAt: string
}

export interface ChecklistAnswer {
  id: number
  itemId: number
  itemDescription: string
  checked: boolean
  comment: string | null
}

export interface ChecklistCompletion {
  id: number
  templateId: number
  templateTitle: string
  completedByUsername: string
  completedAt: string
  status: string
  comment: string | null
  answers: ChecklistAnswer[]
}

export interface CreateTemplateRequest {
  title: string
  description?: string
  frequency: string
  category: string
  items: { description: string; sortOrder: number; requiresComment: boolean }[]
}

export interface CompleteChecklistRequest {
  templateId: number
  answers: { itemId: number; checked: boolean; comment?: string }[]
  comment?: string
}

export const checklistApi = {
  listTemplates: (category?: string) => {
    const params = category ? `?category=${category}` : ''
    return request<ChecklistTemplate[]>(`/checklists/templates${params}`)
  },
  getTemplate: (id: number) => request<ChecklistTemplate>(`/checklists/templates/${id}`),
  createTemplate: (data: CreateTemplateRequest) => request<ChecklistTemplate>('/checklists/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id: number, data: CreateTemplateRequest) => request<ChecklistTemplate>(`/checklists/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id: number) => request<void>(`/checklists/templates/${id}`, { method: 'DELETE' }),
  listCompletions: () => request<ChecklistCompletion[]>('/checklists/completions'),
  getCompletion: (id: number) => request<ChecklistCompletion>(`/checklists/completions/${id}`),
  completeChecklist: (data: CompleteChecklistRequest) => request<ChecklistCompletion>('/checklists/completions', { method: 'POST', body: JSON.stringify(data) }),
}
