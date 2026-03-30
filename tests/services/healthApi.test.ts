/**
 * Compatibility tests for the legacy health service wrapper.
 */
import { describe, expect, it, vi } from 'vitest'

const httpClientMock = {
  get: vi.fn(),
}

vi.mock('@/services/httpClient', () => ({
  httpClient: httpClientMock,
}))

describe('healthApi', () => {
  it('requests the backend health endpoint', async () => {
    const { healthApi } = await import('@/services/healthApi')

    healthApi.getStatus()

    expect(httpClientMock.get).toHaveBeenCalledWith('/api/health')
  })
})
