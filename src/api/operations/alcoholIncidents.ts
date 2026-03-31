/**
 * Alcohol Incidents API module.
 * Manages alcohol-related incident and refusal log entries including CRUD operations,
 * status transitions, closing, and reporting.
 * @module
 */
import { request } from '../core/client.ts'

/** An alcohol incident record. */
export interface AlcoholIncident {
  /** Unique incident identifier. */
  id: number
  /** ISO-8601 timestamp when the incident occurred. */
  occurredAt: string
  /** Username of the person who reported the incident. */
  reportedByUsername: string
  /** User ID the incident is assigned to, or null if unassigned. */
  assignedToId: number | null
  /** Username the incident is assigned to, or null if unassigned. */
  assignedToUsername: string | null
  /** Shift label. */
  shiftLabel: string | null
  /** Location area within the venue. */
  locationArea: string | null
  /** Type of alcohol incident. */
  incidentType: string
  /** Severity level (LOW, MEDIUM, HIGH, CRITICAL). */
  severity: string
  /** Detailed description of the incident. */
  description: string
  /** Immediate action taken, or null. */
  immediateActionTaken: string | null
  /** Whether follow-up action is required. */
  followUpRequired: boolean
  /** Linked routine ID, or null. */
  linkedRoutineId: number | null
  /** Linked deviation ID, or null. */
  linkedDeviationId: number | null
  /** Current workflow status (OPEN, UNDER_REVIEW, CLOSED). */
  status: string
  /** ISO-8601 timestamp when closed, or null. */
  closedAt: string | null
  /** Username of the person who closed it, or null. */
  closedByUsername: string | null
  /** ISO-8601 creation timestamp. */
  createdAt: string
  /** ISO-8601 last-update timestamp. */
  updatedAt: string
}

/** Payload for creating a new alcohol incident. */
export interface CreateAlcoholIncidentRequest {
  /** ISO-8601 timestamp when the incident occurred. */
  occurredAt: string
  /** Shift label. */
  shiftLabel?: string
  /** Location area within the venue. */
  locationArea?: string
  /** Type of alcohol incident. */
  incidentType: string
  /** Severity level. */
  severity: string
  /** Detailed description. */
  description: string
  /** Immediate action taken. */
  immediateActionTaken?: string
  /** Whether follow-up is required. */
  followUpRequired: boolean
  /** User ID to assign the incident to. */
  assignedToId?: number
  /** Linked routine ID. */
  linkedRoutineId?: number
  /** Linked deviation ID. */
  linkedDeviationId?: number
}

/** Payload for updating an existing alcohol incident. */
export interface UpdateAlcoholIncidentRequest {
  /** New severity level, if changing. */
  severity?: string
  /** Updated description, if changing. */
  description?: string
  /** Updated immediate action taken. */
  immediateActionTaken?: string
  /** Whether follow-up is required. */
  followUpRequired?: boolean
  /** New status, if changing. */
  status?: string
  /** User ID to assign the incident to. */
  assignedToId?: number
}

/** Summary report of alcohol incidents. */
export interface IncidentReport {
  /** Total number of incidents. */
  totalIncidents: number
  /** Number of open incidents. */
  openCount: number
  /** Number of closed incidents. */
  closedCount: number
  /** Incident counts grouped by type. */
  byType: Record<string, number>
}

/** Alcohol Incidents API methods. */
export const alcoholIncidentApi = {
  /**
   * Lists alcohol incidents with optional status and type filters.
   * @param status - Optional status filter (OPEN, UNDER_REVIEW, CLOSED)
   * @param type - Optional incident type filter
   */
  list: (status?: string, type?: string) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (type) params.set('type', type)
    const query = params.toString()
    return request<AlcoholIncident[]>(`/alcohol-incidents${query ? '?' + query : ''}`)
  },

  /**
   * Fetches a single alcohol incident by ID.
   * @param id - Incident identifier
   */
  get: (id: number) => request<AlcoholIncident>(`/alcohol-incidents/${id}`),

  /**
   * Creates a new alcohol incident.
   * @param data - Incident creation payload
   */
  create: (data: CreateAlcoholIncidentRequest) => request<AlcoholIncident>('/alcohol-incidents', { method: 'POST', body: JSON.stringify(data) }),

  /**
   * Updates an alcohol incident.
   * @param id - Incident identifier
   * @param data - Fields to update
   */
  update: (id: number, data: UpdateAlcoholIncidentRequest) => request<AlcoholIncident>(`/alcohol-incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /**
   * Closes an alcohol incident with optional notes.
   * @param id - Incident identifier
   * @param notes - Optional closing notes
   */
  close: (id: number, notes?: string) => request<AlcoholIncident>(`/alcohol-incidents/${id}/close`, { method: 'POST', body: JSON.stringify({ notes: notes || '' }) }),

  /**
   * Fetches the alcohol incident summary report.
   */
  report: () => request<IncidentReport>('/alcohol-incidents/report'),
}
