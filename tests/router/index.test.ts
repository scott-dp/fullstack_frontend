import { describe, expect, it, vi } from 'vitest'
import { applyRouteGuard } from '@/router'

describe('route guard', () => {
  it('allows public routes', async () => {
    const auth = {
      isAuthenticated: false,
      isSuperAdmin: false,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn().mockResolvedValue(undefined),
    }

    const result = await applyRouteGuard(
      {
        meta: { public: true },
        fullPath: '/',
        matched: [],
      },
      auth,
    )

    expect(result).toBeUndefined()
    expect(auth.checkAuth).toHaveBeenCalledOnce()
  })

  it('redirects authenticated users away from guest routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: false,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: { guest: true },
        fullPath: '/login',
        matched: [],
      },
      auth,
    )

    expect(result).toEqual({ name: 'dashboard' })
  })

  it('redirects unauthenticated users to login for protected routes', async () => {
    const auth = {
      isAuthenticated: false,
      isSuperAdmin: false,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn().mockResolvedValue(undefined),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/deviations/5',
        matched: [{ meta: { requiresAuth: true } }],
      },
      auth,
    )

    expect(result).toEqual({ name: 'login', query: { redirect: '/app/deviations/5' } })
  })

  it('redirects non-admin users away from admin routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: false,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/admin',
        matched: [{ meta: { requiresAuth: true } }, { meta: { requiresAdmin: true } }],
      },
      auth,
    )

    expect(result).toEqual({ name: 'dashboard' })
  })

  it('allows admin users onto admin routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: false,
      isAdmin: true,
      hasManageAccess: true,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/admin',
        matched: [{ meta: { requiresAuth: true } }, { meta: { requiresAdmin: true } }],
      },
      auth,
    )

    expect(result).toBeUndefined()
  })

  it('redirects users without manage access away from management routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: false,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/admin/users',
        matched: [{ meta: { requiresAuth: true } }, { meta: { requiresManageAccess: true } }],
      },
      auth,
    )

    expect(result).toEqual({ name: 'dashboard' })
  })

  it('allows managers onto management routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: false,
      isAdmin: false,
      hasManageAccess: true,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/admin/users',
        matched: [{ meta: { requiresAuth: true } }, { meta: { requiresManageAccess: true } }],
      },
      auth,
    )

    expect(result).toBeUndefined()
  })

  it('redirects superadmins away from guest routes to the superadmin dashboard', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: true,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: { guest: true },
        fullPath: '/login',
        matched: [],
      },
      auth,
    )

    expect(result).toEqual({ name: 'superadmin-dashboard' })
  })

  it('redirects non-superadmins away from superadmin routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: false,
      isAdmin: true,
      hasManageAccess: true,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/superadmin',
        matched: [{ meta: { requiresAuth: true } }, { meta: { requiresSuperAdmin: true } }],
      },
      auth,
    )

    expect(result).toEqual({ name: 'dashboard' })
  })

  it('redirects superadmins away from regular app routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: true,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/deviations',
        matched: [{ meta: { requiresAuth: true } }],
      },
      auth,
    )

    expect(result).toEqual({ name: 'superadmin-dashboard' })
  })

  it('allows superadmins onto superadmin routes', async () => {
    const auth = {
      isAuthenticated: true,
      isSuperAdmin: true,
      isAdmin: false,
      hasManageAccess: false,
      checkAuth: vi.fn(),
    }

    const result = await applyRouteGuard(
      {
        meta: {},
        fullPath: '/app/superadmin',
        matched: [{ meta: { requiresAuth: true } }, { meta: { requiresSuperAdmin: true } }],
      },
      auth,
    )

    expect(result).toBeUndefined()
  })
})
