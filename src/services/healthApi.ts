/**
 * Health check service wrapper used by smoke tests and diagnostics.
 */
import { httpClient } from './httpClient'

export interface HealthResponse {
  status: string
  application: string
}

export const healthApi = {
  getStatus: () => httpClient.get<HealthResponse>('/api/health'),
}
