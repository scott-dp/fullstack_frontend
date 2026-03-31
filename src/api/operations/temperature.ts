/**
 * Temperature logging API module.
 * Manages creation and retrieval of temperature log entries
 * for compliance monitoring of storage facilities.
 * @module
 */
import { request } from '../core/client.ts'

/** A recorded temperature reading for a specific location. */
export interface TemperatureLog {
  /** Unique log entry identifier. */
  id: number
  /** Name of the storage location (e.g. "Fridge A"). */
  location: string
  /** Recorded temperature in degrees Celsius. */
  temperature: number
  /** Lower acceptable temperature bound in degrees Celsius. */
  minThreshold: number
  /** Upper acceptable temperature bound in degrees Celsius. */
  maxThreshold: number
  /** Computed status based on thresholds (NORMAL, WARNING, CRITICAL). */
  status: string
  /** Username of the person who recorded the reading. */
  recordedByUsername: string
  /** ISO-8601 timestamp of when the reading was taken. */
  recordedAt: string
  /** Optional comment about the reading. */
  comment: string | null
}

/** Payload for creating a new temperature log entry. */
export interface CreateTemperatureLogRequest {
  /** Storage location name. */
  location: string
  /** Recorded temperature in degrees Celsius. */
  temperature: number
  /** Lower acceptable threshold in degrees Celsius. */
  minThreshold: number
  /** Upper acceptable threshold in degrees Celsius. */
  maxThreshold: number
  /** Optional comment. */
  comment?: string
}

/** Temperature log API methods. */
export const temperatureApi = {
  /**
   * Lists all temperature log entries, optionally filtered by location.
   * @param location - Optional location name filter
   */
  list: (location?: string) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : ''
    return request<TemperatureLog[]>(`/temperature-logs${params}`)
  },

  /**
   * Fetches a single temperature log entry by ID.
   * @param id - Log entry identifier
   */
  get: (id: number) => request<TemperatureLog>(`/temperature-logs/${id}`),

  /**
   * Creates a new temperature log entry.
   * @param data - Temperature reading payload
   */
  create: (data: CreateTemperatureLogRequest) => request<TemperatureLog>('/temperature-logs', { method: 'POST', body: JSON.stringify(data) }),
}
