import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('dashboardApi', () => {
  it('requests the dashboard endpoint', async () => {
    const { dashboardApi } = await import('../../src/api/operations/dashboard')

    dashboardApi.get()

    expect(requestMock).toHaveBeenCalledWith('/dashboard')
  })
})
