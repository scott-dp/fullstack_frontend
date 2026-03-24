/**
 * Checklists API module.
 * Handles CRUD operations for checklist templates and their completions.
 * @module
 */
import { request } from './client'

/** A single item within a checklist template. */
export interface ChecklistItem {
  /** Unique item identifier. */
  id: number
  /** Description text shown to the user. */
  description: string
  /** Display order within the template (0-based). */
  sortOrder: number
  /** Whether the user must provide a comment when completing this item. */
  requiresComment: boolean
}

/** A checklist template defining a repeatable set of items. */
export interface ChecklistTemplate {
  /** Unique template identifier. */
  id: number
  /** Template title. */
  title: string
  /** Optional longer description of the checklist. */
  description: string | null
  /** How often the checklist should be completed (DAILY, WEEKLY, MONTHLY). */
  frequency: string
  /** Compliance category (FOOD or ALCOHOL). */
  category: string
  /** Whether this template is currently active. */
  active: boolean
  /** Ordered list of checklist items. */
  items: ChecklistItem[]
  /** Username of the template creator. */
  createdByUsername: string
  /** ISO-8601 creation timestamp. */
  createdAt: string
}

/** A recorded answer for one checklist item within a completion. */
export interface ChecklistAnswer {
  /** Unique answer identifier. */
  id: number
  /** The checklist item this answer corresponds to. */
  itemId: number
  /** Description of the answered item. */
  itemDescription: string
  /** Whether the item was checked off. */
  checked: boolean
  /** Optional comment provided for this item. */
  comment: string | null
}

/** A completed instance of a checklist template. */
export interface ChecklistCompletion {
  /** Unique completion identifier. */
  id: number
  /** The template this completion is based on. */
  templateId: number
  /** Title of the completed template. */
  templateTitle: string
  /** Username of the person who completed the checklist. */
  completedByUsername: string
  /** ISO-8601 timestamp of when the checklist was completed. */
  completedAt: string
  /** Completion status (COMPLETE, DEVIATION_FOUND, etc.). */
  status: string
  /** Optional overall comment. */
  comment: string | null
  /** Individual item answers. */
  answers: ChecklistAnswer[]
}

/** Payload for creating a new checklist template. */
export interface CreateTemplateRequest {
  /** Template title. */
  title: string
  /** Optional description. */
  description?: string
  /** Recurrence frequency (DAILY, WEEKLY, MONTHLY). */
  frequency: string
  /** Compliance category (FOOD or ALCOHOL). */
  category: string
  /** Items to include in the template. */
  items: { description: string; sortOrder: number; requiresComment: boolean }[]
}

/** Payload for submitting a completed checklist. */
export interface CompleteChecklistRequest {
  /** ID of the template being completed. */
  templateId: number
  /** Answers for each checklist item. */
  answers: { itemId: number; checked: boolean; comment?: string }[]
  /** Optional overall comment about the completion. */
  comment?: string
}

/** Checklist API methods for templates and completions. */
export const checklistApi = {
  /**
   * Lists all checklist templates, optionally filtered by category.
   * @param category - Optional category filter (FOOD or ALCOHOL)
   */
  listTemplates: (category?: string) => {
    const params = category ? `?category=${category}` : ''
    return request<ChecklistTemplate[]>(`/checklists/templates${params}`)
  },

  /**
   * Fetches a single checklist template by ID.
   * @param id - Template identifier
   */
  getTemplate: (id: number) => request<ChecklistTemplate>(`/checklists/templates/${id}`),

  /**
   * Creates a new checklist template.
   * @param data - Template creation payload
   */
  createTemplate: (data: CreateTemplateRequest) => request<ChecklistTemplate>('/checklists/templates', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Updates an existing checklist template.
   * @param id - Template identifier
   * @param data - Updated template data
   */
  updateTemplate: (id: number, data: CreateTemplateRequest) => request<ChecklistTemplate>(`/checklists/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /**
   * Deletes a checklist template.
   * @param id - Template identifier
   */
  deleteTemplate: (id: number) => request<void>(`/checklists/templates/${id}`, { method: 'DELETE' }),

  /** Lists all checklist completions for the current organization. */
  listCompletions: () => request<ChecklistCompletion[]>('/checklists/completions'),

  /**
   * Fetches a single checklist completion by ID.
   * @param id - Completion identifier
   */
  getCompletion: (id: number) => request<ChecklistCompletion>(`/checklists/completions/${id}`),

  /**
   * Submits a completed checklist.
   * @param data - Completion payload with answers
   */
  completeChecklist: (data: CompleteChecklistRequest) => request<ChecklistCompletion>('/checklists/completions', { method: 'POST', body: JSON.stringify(data) }),
}
