/**
 * Dashboard API module.
 * Fetches aggregated statistics for the main dashboard view.
 * @module
 */
import { request } from './client'

/** Aggregated dashboard statistics returned by the server. */
export interface DashboardData {
  /** Total number of active checklist templates. */
  totalChecklistTemplates: number
  /** Number of checklists completed today. */
  checklistsCompletedToday: number
  /** Number of temperature alerts raised today. */
  temperatureAlertsToday: number
  /** Number of deviations currently in OPEN status. */
  openDeviations: number
  /** Number of deviations currently in IN_PROGRESS status. */
  inProgressDeviations: number
  /** Number of unread notifications for the current user. */
  unreadNotifications: number
}

/** Dashboard API methods. */
export const dashboardApi = {
  /** Fetches the aggregated dashboard statistics. */
  get: () => request<DashboardData>('/dashboard'),
}
