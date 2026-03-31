/**
 * Deviations API module.
 * Manages non-compliance deviation reports including CRUD operations,
 * status transitions, assignment, and commenting.
 * @module
 */
import { request } from '../core/client.ts'

/** A comment attached to a deviation report. */
export interface DeviationComment {
  /** Unique comment identifier. */
  id: number
  /** Username of the comment author. */
  authorUsername: string
  /** Comment text content. */
  content: string
  /** ISO-8601 creation timestamp. */
  createdAt: string
}

/** A deviation (non-compliance incident) report. */
export interface Deviation {
  /** Unique deviation identifier. */
  id: number
  /** Short title summarizing the issue. */
  title: string
  /** Detailed description of the deviation. */
  description: string
  /** Compliance category (FOOD or ALCOHOL). */
  category: string
  /** Severity level (LOW, MEDIUM, HIGH, CRITICAL). */
  severity: string
  /** Current workflow status (OPEN, IN_PROGRESS, RESOLVED, CLOSED). */
  status: string
  /** Username of the person who reported the deviation. */
  reportedByUsername: string
  /** Username the deviation is assigned to, or null if unassigned. */
  assignedToUsername: string | null
  /** Username of the person who resolved it, or null. */
  resolvedByUsername: string | null
  /** ISO-8601 timestamp of resolution, or null. */
  resolvedAt: string | null
  /** ISO-8601 creation timestamp. */
  createdAt: string
  /** ISO-8601 last-update timestamp. */
  updatedAt: string
  /** Comments attached to this deviation. */
  comments: DeviationComment[]
}

/** Payload for creating a new deviation report. */
export interface CreateDeviationRequest {
  /** Short title. */
  title: string
  /** Detailed description. */
  description: string
  /** Compliance category (FOOD or ALCOHOL). */
  category: string
  /** Severity level (LOW, MEDIUM, HIGH, CRITICAL). */
  severity: string
}

/** Payload for updating an existing deviation's status or assignment. */
export interface UpdateDeviationRequest {
  /** New workflow status, if changing. */
  status?: string
  /** User ID to assign the deviation to, if changing. */
  assignedToId?: number
}

/** Deviation API methods. */
export const deviationApi = {
  /**
   * Lists deviations with optional status and category filters.
   * @param status - Optional status filter (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
   * @param category - Optional category filter (FOOD or ALCOHOL)
   */
  list: (status?: string, category?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    const query = params.toString()
    return request<Deviation[]>(`/deviations${query ? '?' + query : ''}`)
  },

  /**
   * Fetches a single deviation by ID, including its comments.
   * @param id - Deviation identifier
   */
  get: (id: number) => request<Deviation>(`/deviations/${id}`),

  /**
   * Creates a new deviation report.
   * @param data - Deviation creation payload
   */
  create: (data: CreateDeviationRequest) => request<Deviation>('/deviations', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Updates a deviation's status or assignment.
   * @param id - Deviation identifier
   * @param data - Fields to update
   */
  update: (id: number, data: UpdateDeviationRequest) => request<Deviation>(`/deviations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /**
   * Adds a comment to a deviation.
   * @param id - Deviation identifier
   * @param content - Comment text
   */
  addComment: (id: number, content: string) => request<DeviationComment>(`/deviations/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
}
