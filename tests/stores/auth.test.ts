import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const { authApiMock } = vi.hoisted(() => ({
  authApiMock: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    status: vi.fn(),
  },
}))

vi.mock('@/api/auth', () => ({
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

    await store.login({ username: 'alice', password: 'secret' })

    expect(store.user).toEqual(testUser)
    expect(store.loading).toBe(false)
    expect(authApiMock.login).toHaveBeenCalledWith({ username: 'alice', password: 'secret' })
  })

  it('stores the user on register and resets loading afterwards', async () => {
    authApiMock.register.mockResolvedValue({ user: testUser })
    const store = useAuthStore()

    await store.register({ username: 'alice', password: 'secret' })

    expect(store.user).toEqual(testUser)
    expect(store.loading).toBe(false)
  })

  it('clears the user on logout', async () => {
    authApiMock.logout.mockResolvedValue(undefined)
    const store = useAuthStore()
    store.user = testUser

    await store.logout()

    expect(store.user).toBeNull()
  })

  it('keeps loading false after a failed login', async () => {
    authApiMock.login.mockRejectedValue(new Error('bad credentials'))
    const store = useAuthStore()

    await expect(
      store.login({ username: 'alice', password: 'wrong' }),
    ).rejects.toThrow('bad credentials')

    expect(store.loading).toBe(false)
  })
})
