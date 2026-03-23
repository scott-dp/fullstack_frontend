import type { ApiErrorPayload } from '../types/auth'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  details?: Record<string, string>

  constructor(payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.status = payload.status
    this.details = payload.errors
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const fallbackPayload: ApiErrorPayload = {
      message: 'Request failed',
      status: response.status,
      timestamp: new Date().toISOString(),
    }

    let payload = fallbackPayload

    try {
      payload = (await response.json()) as ApiErrorPayload
    } catch {
      payload = fallbackPayload
    }

    throw new ApiError(payload)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
}
