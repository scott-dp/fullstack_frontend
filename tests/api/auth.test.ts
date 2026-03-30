import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('authApi', () => {
  it('uses the expected auth endpoints', async () => {
    const { authApi } = await import('../../src/api/auth/auth')

    const loginPayload = { identifier: 'alice@example.com', password: 'secret' }
    const registerPayload = { username: 'alice', email: 'alice@example.com', password: 'secret' }
    const emailCodePayload = { email: 'alice@example.com' }
    const emailCodeLoginPayload = { email: 'alice@example.com', code: '123456' }
    authApi.login(loginPayload)
    authApi.register(registerPayload)
    authApi.requestEmailCode(emailCodePayload)
    authApi.loginWithEmailCode(emailCodeLoginPayload)
    authApi.logout()
    authApi.status()
    authApi.verifyEmail('token-123')
    authApi.getAdminSetupInfo('setup-123')
    authApi.completeAdminSetup({ token: 'setup-123', password: 'superSecret123' })

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      '/auth/login',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(loginPayload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/auth/register',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(registerPayload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/auth/email-code/request',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(emailCodePayload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/auth/email-code/login',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(emailCodeLoginPayload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      5,
      '/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(6, '/auth/status')
    expect(requestMock).toHaveBeenNthCalledWith(7, '/auth/verify?token=token-123')
    expect(requestMock).toHaveBeenNthCalledWith(8, '/auth/admin-setup?token=setup-123')
    expect(requestMock).toHaveBeenNthCalledWith(
      9,
      '/auth/admin-setup',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'setup-123', password: 'superSecret123' }),
      }),
    )
  })
})
