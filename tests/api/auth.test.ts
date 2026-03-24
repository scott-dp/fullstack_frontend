import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('authApi', () => {
  it('uses the expected auth endpoints', async () => {
    const { authApi } = await import('@/api/auth')

    const payload = { username: 'alice', password: 'secret' }
    authApi.login(payload)
    authApi.register(payload)
    authApi.logout()
    authApi.status()

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      '/auth/login',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/auth/register',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(4, '/auth/status')
  })
})
