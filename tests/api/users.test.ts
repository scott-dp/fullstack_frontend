import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('userApi', () => {
  it('uses the expected user endpoints', async () => {
    const { userApi } = await import('../../src/api/auth/users')

    userApi.me()
    userApi.updateProfile({ firstName: 'Alice' })
    userApi.list()

    expect(requestMock).toHaveBeenNthCalledWith(1, '/users/me')
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/users/me',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ firstName: 'Alice' }) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(3, '/users')
  })
})
