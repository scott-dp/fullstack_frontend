/**
 * Store tests for authentication state management and role helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const { authApiMock } = vi.hoisted(() => ({
  authApiMock: {
    login: vi.fn(),
    register: vi.fn(),
    requestEmailCode: vi.fn(),
    loginWithEmailCode: vi.fn(),
    logout: vi.fn(),
    status: vi.fn(),
  },
}))

vi.mock('@/api/auth/auth.ts', () => ({
  authApi: authApiMock,
}))

const testUser = {
  id: 1,
  username: 'alice',
  firstName: 'Alice',
  lastName: 'Doe',
  email: 'alice@example.com',
  roles: ['ROLE_ADMIN'],
  organizationId: 5,
  organizationName: 'Org',
}

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('updates user from an authenticated status response', async () => {
    authApiMock.status.mockResolvedValue({ authenticated: true, user: testUser })
    const store = useAuthStore()

    await store.checkAuth()

    expect(store.user).toEqual(testUser)
    expect(store.isAuthenticated).toBe(true)
    expect(store.isSuperAdmin).toBe(false)
    expect(store.isAdmin).toBe(true)
    expect(store.hasManageAccess).toBe(true)
    expect(store.organizationId).toBe(5)
  })

  it('clears user when status check fails', async () => {
    authApiMock.status.mockRejectedValue(new Error('offline'))
    const store = useAuthStore()
    store.user = testUser

    await store.checkAuth()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('stores the user on login and resets loading afterwards', async () => {
    authApiMock.login.mockResolvedValue({ user: testUser })
    const store = useAuthStore()

    await store.login({ identifier: 'alice@example.com', password: 'secret' })

    expect(store.user).toEqual(testUser)
    expect(store.loading).toBe(false)
    expect(authApiMock.login).toHaveBeenCalledWith({ identifier: 'alice@example.com', password: 'secret' })
  })

  it('returns registration verification details without authenticating the user', async () => {
    authApiMock.register.mockResolvedValue({
      message: 'Registration successful. Check your email to verify your account before logging in.',
    })
    const store = useAuthStore()

    const response = await store.register({
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret',
    })

    expect(response.message).toContain('Check your email')
    expect(store.user).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('clears the user on logout', async () => {
    authApiMock.logout.mockResolvedValue(undefined)
    const store = useAuthStore()
    store.user = testUser

    await store.logout()

    expect(store.user).toBeNull()
  })

  it('requests an email code and resets loading afterwards', async () => {
    authApiMock.requestEmailCode.mockResolvedValue({ message: 'A login code has been sent to your email.' })
    const store = useAuthStore()

    const response = await store.requestEmailCode({ email: 'alice@example.com' })

    expect(response.message).toContain('login code')
    expect(store.loading).toBe(false)
    expect(authApiMock.requestEmailCode).toHaveBeenCalledWith({ email: 'alice@example.com' })
  })

  it('stores the user on email code login', async () => {
    authApiMock.loginWithEmailCode.mockResolvedValue({ user: testUser })
    const store = useAuthStore()

    await store.loginWithEmailCode({ email: 'alice@example.com', code: '123456' })

    expect(store.user).toEqual(testUser)
    expect(store.loading).toBe(false)
    expect(authApiMock.loginWithEmailCode).toHaveBeenCalledWith({
      email: 'alice@example.com',
      code: '123456',
    })
  })

  it('keeps loading false after a failed login', async () => {
    authApiMock.login.mockRejectedValue(new Error('bad credentials'))
    const store = useAuthStore()

    await expect(
      store.login({ identifier: 'alice@example.com', password: 'wrong' }),
    ).rejects.toThrow('bad credentials')

    expect(store.loading).toBe(false)
  })

  it('recognizes superadmin users separately from org admins', async () => {
    authApiMock.status.mockResolvedValue({
      authenticated: true,
      user: {
        ...testUser,
        roles: ['ROLE_SUPERADMIN'],
        organizationId: null,
        organizationName: null,
      },
    })
    const store = useAuthStore()

    await store.checkAuth()

    expect(store.isSuperAdmin).toBe(true)
    expect(store.isAdmin).toBe(false)
    expect(store.hasManageAccess).toBe(false)
    expect(store.organizationId).toBeNull()
  })
})
