import { request } from './client'

export interface DashboardData {
  totalChecklistTemplates: number
  checklistsCompletedToday: number
  temperatureAlertsToday: number
  openDeviations: number
  inProgressDeviations: number
  unreadNotifications: number
}

export const dashboardApi = {
  get: () => request<DashboardData>('/dashboard'),
}
