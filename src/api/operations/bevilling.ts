/**
 * Bevilling (Alcohol License) API module.
 * Manages bevilling records, conditions, and serving hours.
 * @module
 */
import { request } from '../core/client.ts'

/** Serving hours for a specific weekday. */
export interface ServingHours {
  /** Unique identifier. */
  id: number
  /** Day of the week (MON-SUN). */
  weekday: string
  /** Serving start time (HH:mm). */
  startTime: string
  /** Serving end time (HH:mm). */
  endTime: string
  /** Minutes after end time for consumption deadline. */
  consumptionDeadlineMinutesAfterEnd: number
}

/** A condition attached to a bevilling. */
export interface BevillingCondition {
  /** Unique condition identifier. */
  id: number
  /** Condition type. */
  conditionType: string
  /** Condition title. */
  title: string
  /** Detailed description. */
  description: string | null
  /** Whether the condition is currently active. */
  active: boolean
}

/** A bevilling (alcohol license) record. */
export interface Bevilling {
  /** Unique bevilling identifier. */
  id: number
  /** Municipality that issued the license. */
  municipality: string
  /** Type of bevilling (SKJENKING, SALG, COMBINED). */
  bevillingType: string
  /** Start date (ISO-8601). */
  validFrom: string
  /** End date (ISO-8601), or null. */
  validTo: string | null
  /** License number. */
  licenseNumber: string | null
  /** Current status (ACTIVE, EXPIRED, SUSPENDED, ARCHIVED). */
  status: string
  /** Alcohol groups allowed. */
  alcoholGroupsAllowed: string[]
  /** Serving area description. */
  servingAreaDescription: string | null
  /** Whether indoor serving is allowed. */
  indoorAllowed: boolean
  /** Whether outdoor serving is allowed. */
  outdoorAllowed: boolean
  /** Name of the styrer (license manager). */
  styrerName: string | null
  /** Name of the stedfortreder (deputy). */
  stedfortrederName: string | null
  /** Additional notes. */
  notes: string | null
  /** Attachment ID, if any. */
  attachmentId: number | null
  /** Conditions attached to this bevilling. */
  conditions: BevillingCondition[]
  /** Serving hours for this bevilling. */
  servingHours: ServingHours[]
  /** Creation timestamp. */
  createdAt: string
  /** Last update timestamp. */
  updatedAt: string
}

/** Payload for creating a new bevilling. */
export interface CreateBevillingRequest {
  municipality: string
  bevillingType: string
  validFrom: string
  validTo?: string
  licenseNumber?: string
  alcoholGroupsAllowed?: string[]
  servingAreaDescription?: string
  indoorAllowed?: boolean
  outdoorAllowed?: boolean
  styrerName?: string
  stedfortrederName?: string
  notes?: string
}

/** Payload for updating a bevilling. */
export interface UpdateBevillingRequest {
  municipality?: string
  bevillingType?: string
  validFrom?: string
  validTo?: string
  licenseNumber?: string
  status?: string
  alcoholGroupsAllowed?: string[]
  servingAreaDescription?: string
  indoorAllowed?: boolean
  outdoorAllowed?: boolean
  styrerName?: string
  stedfortrederName?: string
  notes?: string
}

/** Payload for a serving hours entry. */
export interface ServingHoursEntry {
  weekday: string
  startTime: string
  endTime: string
  consumptionDeadlineMinutesAfterEnd?: number
}

/** Payload for creating a condition. */
export interface CreateConditionRequest {
  conditionType: string
  title: string
  description?: string
}

/** Payload for updating a condition. */
export interface UpdateConditionRequest {
  title?: string
  description?: string
  active?: boolean
}

/** Bevilling API methods. */
export const bevillingApi = {
  /** Lists all bevillinger for the organization. */
  list: () => request<Bevilling[]>('/bevillinger'),

  /** Gets the current active bevilling. */
  getCurrent: () => request<Bevilling | null>('/bevillinger/current'),

  /** Fetches a single bevilling by ID. */
  get: (id: number) => request<Bevilling>(`/bevillinger/${id}`),

  /** Creates a new bevilling. */
  create: (data: CreateBevillingRequest) =>
    request<Bevilling>('/bevillinger', { method: 'POST', body: JSON.stringify(data) }),

  /** Updates a bevilling. */
  update: (id: number, data: UpdateBevillingRequest) =>
    request<Bevilling>(`/bevillinger/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Adds a condition to a bevilling. */
  addCondition: (bevillingId: number, data: CreateConditionRequest) =>
    request<BevillingCondition>(`/bevillinger/${bevillingId}/conditions`, { method: 'POST', body: JSON.stringify(data) }),

  /** Updates a condition. */
  updateCondition: (conditionId: number, data: UpdateConditionRequest) =>
    request<BevillingCondition>(`/bevillinger/conditions/${conditionId}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Sets serving hours for a bevilling (replaces existing). */
  setServingHours: (bevillingId: number, entries: ServingHoursEntry[]) =>
    request<ServingHours[]>(`/bevillinger/${bevillingId}/serving-hours`, { method: 'PUT', body: JSON.stringify(entries) }),

  /** Gets serving hours for a bevilling. */
  getServingHours: (bevillingId: number) =>
    request<ServingHours[]>(`/bevillinger/${bevillingId}/serving-hours`),
}
