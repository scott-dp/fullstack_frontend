const BASE_URL = '/api'

interface ApiError {
  timestamp: string
  status: number
  message: string
  errors: Record<string, string>
}

class HttpError extends Error {
  status: number
  errors: Record<string, string>

  constructor(apiError: ApiError) {
    super(apiError.message)
    this.status = apiError.status
    this.errors = apiError.errors || {}
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      timestamp: new Date().toISOString(),
      status: response.status,
      message: response.statusText,
      errors: {},
    }))
    throw new HttpError(error)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export { request, HttpError }
export type { ApiError }
