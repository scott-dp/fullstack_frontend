import { describe, expect, it, vi } from 'vitest'

const httpClientMock = {
  get: vi.fn(),
  post: vi.fn(),
}

vi.mock('@/services/httpClient', () => ({
  httpClient: httpClientMock,
}))

describe('legacy authApi service', () => {
  it('uses the expected auth and user endpoints', async () => {
    const { authApi } = await import('@/services/authApi')
    const payload = { username: 'alice', password: 'secret' }

    authApi.login(payload)
    authApi.register(payload)
    authApi.logout()
    authApi.getAuthStatus()
    authApi.getCurrentUser()

    expect(httpClientMock.post).toHaveBeenNthCalledWith(1, '/api/auth/login', payload)
    expect(httpClientMock.post).toHaveBeenNthCalledWith(2, '/api/auth/register', payload)
    expect(httpClientMock.post).toHaveBeenNthCalledWith(3, '/api/auth/logout')
    expect(httpClientMock.get).toHaveBeenNthCalledWith(1, '/api/auth/status')
    expect(httpClientMock.get).toHaveBeenNthCalledWith(2, '/api/users/me')
  })
})
