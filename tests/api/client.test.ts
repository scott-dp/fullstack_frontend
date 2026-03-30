import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpError, request } from '../../src/api/core/client'

describe('api client request', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON for successful JSON responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(request<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true })
  })

  it('returns undefined for 204 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )

    await expect(request<void>('/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('returns undefined when content-length is zero', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('', {
          status: 200,
          headers: { 'Content-Length': '0', 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(request<void>('/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('returns undefined when the response is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('ok', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        }),
      ),
    )

    await expect(request<void>('/ping')).resolves.toBeUndefined()
  })

  it('returns undefined when the JSON response body is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(request<void>('/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('throws HttpError with parsed API payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            timestamp: '2026-03-24T10:00:00Z',
            status: 400,
            message: 'Bad request',
            errors: { field: 'Required' },
          }),
          {
            status: 400,
            statusText: 'Bad Request',
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    )

    await expect(request('/bad')).rejects.toEqual(
      expect.objectContaining<HttpError>({
        message: 'Bad request',
        status: 400,
        errors: { field: 'Required' },
      }),
    )
  })

  it('throws HttpError with fallback payload when error JSON cannot be parsed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('oops', {
          status: 500,
          statusText: 'Server Error',
          headers: { 'Content-Type': 'text/plain' },
        }),
      ),
    )

    await expect(request('/broken')).rejects.toEqual(
      expect.objectContaining<HttpError>({
        message: 'Server Error',
        status: 500,
        errors: {},
      }),
    )
  })
})
