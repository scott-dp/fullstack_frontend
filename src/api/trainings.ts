import { request } from './client'

export interface TrainingTemplate {
  id: number
  title: string
  moduleType: string
  category: string
  description: string | null
  contentText: string | null
  requiredForRole: string
  isMandatory: boolean
  validityDays: number | null
  acknowledgmentRequired: boolean
  linkedRoutineId: number | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface TrainingAssignment {
  id: number
  templateId: number
  templateTitle: string
  assigneeUsername: string
  assignedByUsername: string
  assignedAt: string
  dueAt: string | null
  status: string
}

export interface TrainingCompletion {
  id: number
  assignmentId: number
  completedByUsername: string
  completedAt: string
  acknowledgementChecked: boolean
  comments: string | null
  expiresAt: string | null
}

export interface TrainingReport {
  totalTemplates: number
  totalAssignments: number
  completedCount: number
  overdueCount: number
  completionRate: number
}

export interface CreateTrainingTemplateRequest {
  title: string
  moduleType: string
  category: string
  description?: string
  contentText?: string
  requiredForRole: string
  isMandatory?: boolean
  validityDays?: number | null
  acknowledgmentRequired?: boolean
  linkedRoutineId?: number | null
}

function normalizeDueAt(dueAt?: string) {
  if (!dueAt) {
    return undefined
  }

  return dueAt.includes('T') ? dueAt : `${dueAt}T00:00:00`
}

export const trainingApi = {
  listTemplates: (moduleType?: string) => {
    const params = moduleType ? `?moduleType=${moduleType}` : ''
    return request<TrainingTemplate[]>(`/trainings/templates${params}`)
  },

  getTemplate: (id: number) =>
    request<TrainingTemplate>(`/trainings/templates/${id}`),

  createTemplate: (data: CreateTrainingTemplateRequest) =>
    request<TrainingTemplate>('/trainings/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTemplate: (id: number, data: Partial<CreateTrainingTemplateRequest>) =>
    request<TrainingTemplate>(`/trainings/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  assign: (templateId: number, assigneeUserIds: number[], dueAt?: string) =>
    request<TrainingAssignment[]>(`/trainings/templates/${templateId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeUserIds, dueAt: normalizeDueAt(dueAt) }),
    }),

  myAssignments: () =>
    request<TrainingAssignment[]>('/trainings/assignments/my'),

  complete: (assignmentId: number, acknowledgementChecked: boolean, comments?: string) =>
    request<TrainingCompletion>(`/trainings/assignments/${assignmentId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ acknowledgementChecked, comments }),
    }),

  report: () =>
    request<TrainingReport>('/trainings/report'),
}
