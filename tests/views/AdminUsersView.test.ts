/**
 * View tests for admin user management and invite creation.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import AdminUsersView from '../../src/views/admin/AdminUsersView.vue'

const {
  userListMock,
  userDeleteMock,
  inviteListMock,
  inviteCreateMock,
  authStoreMock,
} = vi.hoisted(() => ({
  userListMock: vi.fn(),
  userDeleteMock: vi.fn(),
  inviteListMock: vi.fn(),
  inviteCreateMock: vi.fn(),
  authStoreMock: {
    isAdmin: true,
    isSuperAdmin: false,
    hasManageAccess: true,
    user: { id: 1, organizationId: 1 },
  },
}))

vi.mock('@/api/auth/users.ts', () => ({
  userApi: {
    list: userListMock,
    delete: userDeleteMock,
  },
}))

vi.mock('@/api/auth/organizationInvites.ts', () => ({
  organizationInviteApi: {
    list: inviteListMock,
    create: inviteCreateMock,
  },
}))

vi.mock('@/api/admin/organizations.ts', () => ({
  organizationApi: {
    list: vi.fn(),
  },
}))

vi.mock('@/stores/auth.ts', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('AdminUsersView', () => {
  beforeEach(() => {
    userListMock.mockReset()
    userDeleteMock.mockReset()
    inviteListMock.mockReset()
    inviteCreateMock.mockReset()
    authStoreMock.isAdmin = true
    authStoreMock.isSuperAdmin = false
    authStoreMock.user = { id: 1, organizationId: 1 }
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('creates an invite and deletes a staff user', async () => {
    userListMock.mockResolvedValue([
      { id: 1, username: 'admin', firstName: 'Mia', lastName: 'Admin', roles: ['ROLE_ADMIN'] },
      { id: 2, username: 'staff1', firstName: 'Ava', lastName: 'Stone', roles: ['ROLE_STAFF'] },
    ])
    inviteListMock.mockResolvedValue([])
    inviteCreateMock.mockResolvedValue({
      id: 10,
      organizationName: 'Everest',
      role: 'ROLE_MANAGER',
      token: 'abc-123',
      accepted: false,
      acceptedByUsername: null,
      expiresAt: '2026-04-07T10:00:00',
    })
    userDeleteMock.mockResolvedValue({})

    render(AdminUsersView, {
      global: { plugins: [i18n] },
    })

    expect(await screen.findByText('staff1')).toBeTruthy()
    await fireEvent.click(screen.getByRole('button', { name: 'Create invite' }))

    await waitFor(() => {
      expect(inviteCreateMock).toHaveBeenCalledWith({
        role: 'ROLE_MANAGER',
        organizationId: undefined,
        expiresInDays: 7,
      })
      expect(screen.getAllByText('abc-123').length).toBeGreaterThan(0)
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(userDeleteMock).toHaveBeenCalledWith(2)
      expect(screen.queryByText('staff1')).toBeNull()
    })
  })
})
