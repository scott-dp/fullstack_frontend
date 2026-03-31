/**
 * View tests for the admin dashboard.
 */
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import AdminDashboardView from '../../src/views/admin/AdminDashboardView.vue'

const { dashboardGetMock, userListMock } = vi.hoisted(() => ({
  dashboardGetMock: vi.fn(),
  userListMock: vi.fn(),
}))

vi.mock('@/api/operations/dashboard.ts', () => ({
  dashboardApi: {
    get: dashboardGetMock,
  },
}))

vi.mock('@/api/auth/users.ts', () => ({
  userApi: {
    list: userListMock,
  },
}))

describe('AdminDashboardView', () => {
  beforeEach(() => {
    dashboardGetMock.mockReset()
    userListMock.mockReset()
  })

  it('renders admin stats and quick action links', async () => {
    dashboardGetMock.mockResolvedValue({
      totalChecklistTemplates: 5,
      checklistsCompletedToday: 2,
      temperatureAlertsToday: 1,
      openDeviations: 3,
      inProgressDeviations: 1,
    })
    userListMock.mockResolvedValue([
      { id: 1, username: 'admin', firstName: 'A', lastName: 'One', roles: ['ROLE_ADMIN'] },
      { id: 2, username: 'manager', firstName: 'B', lastName: 'Two', roles: ['ROLE_MANAGER'] },
      { id: 3, username: 'staff', firstName: 'C', lastName: 'Three', roles: ['ROLE_STAFF'] },
    ])

    render(AdminDashboardView, {
      global: {
        plugins: [i18n],
        stubs: { RouterLink: { props: ['to'], template: '<a><slot /></a>' } },
      },
    })

    expect(await screen.findByText('Total Users')).toBeTruthy()
    expect(screen.getByText('Checklist Templates')).toBeTruthy()
    expect(screen.getByText('Audit History')).toBeTruthy()
    expect(screen.getByText('System administrators')).toBeTruthy()
    expect(screen.getByText('Operational staff')).toBeTruthy()
  })
})
