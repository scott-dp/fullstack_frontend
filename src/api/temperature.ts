import { request } from './client'

export interface TemperatureLog {
  id: number
  location: string
  temperature: number
  minThreshold: number
  maxThreshold: number
  status: string
  recordedByUsername: string
  recordedAt: string
  comment: string | null
}

export interface CreateTemperatureLogRequest {
  location: string
  temperature: number
  minThreshold: number
  maxThreshold: number
  comment?: string
}

export const temperatureApi = {
  list: (location?: string) => {
    const params = location ? `?location=${encodeURIComponent(location)}` : ''
    return request<TemperatureLog[]>(`/temperature-logs${params}`)
  },
  get: (id: number) => request<TemperatureLog>(`/temperature-logs/${id}`),
  create: (data: CreateTemperatureLogRequest) => request<TemperatureLog>('/temperature-logs', { method: 'POST', body: JSON.stringify(data) }),
}
