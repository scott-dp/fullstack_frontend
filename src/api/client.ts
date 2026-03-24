/**
 * HTTP client for the backend REST API.
 * Wraps the Fetch API with automatic credential handling and JSON error parsing.
 * @module
 */

/** Base URL prefix for all API requests. */
const BASE_URL = '/api'

/** Standardized error payload returned by the backend. */
interface ApiError {
  /** ISO-8601 timestamp when the error occurred. */
  timestamp: string
  /** HTTP status code. */
  status: number
  /** Human-readable error message. */
  message: string
  /** Optional field-level validation errors keyed by field name. */
  errors: Record<string, string>
}

/**
 * Typed HTTP error thrown when the API returns a non-OK response.
 * Provides access to the status code and any field-level validation errors.
 */
class HttpError extends Error {
  /** HTTP status code from the failed response. */
  status: number
  /** Field-level validation errors, if any. */
  errors: Record<string, string>

  /**
   * @param apiError - Parsed error payload from the backend
   */
  constructor(apiError: ApiError) {
    super(apiError.message)
    this.status = apiError.status
    this.errors = apiError.errors || {}
  }
}

/**
 * Performs an authenticated JSON request against the backend API.
 * Credentials are included automatically via cookies. Non-2xx responses
 * are parsed into an {@link HttpError} and thrown.
 * @typeParam T - Expected response body type
 * @param path - API path relative to /api (e.g. '/auth/login')
 * @param options - Standard fetch RequestInit overrides
 * @returns Parsed JSON response body, or undefined for 204 No Content
 * @throws {HttpError} When the server returns a non-2xx status
 */
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
