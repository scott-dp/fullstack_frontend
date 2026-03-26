import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, httpClient } from '@/services/httpClient'

describe('legacy httpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON for successful requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(httpClient.get<{ ok: boolean }>('/api/health')).resolves.toEqual({ ok: true })
  })

  it('returns undefined for 204 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )

    await expect(httpClient.post<void>('/api/auth/logout')).resolves.toBeUndefined()
  })

  it('throws ApiError with fallback payload when parsing fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('server exploded', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        }),
      ),
    )

    await expect(httpClient.get('/api/health')).rejects.toEqual(
      expect.objectContaining<ApiError>({
        message: 'Request failed',
        status: 500,
      }),
    )
  })
})
