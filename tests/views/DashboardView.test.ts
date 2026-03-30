import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardView from '../../src/views/dashboard/DashboardView.vue'
import { i18n } from '@/i18n'

const {
  dashboardGetMock,
  inviteAcceptMock,
  authStoreMock,
} = vi.hoisted(() => ({
  dashboardGetMock: vi.fn(),
  inviteAcceptMock: vi.fn(),
  authStoreMock: {
    user: {
      id: 1,
      username: 'staff',
      firstName: 'Kitchen',
      lastName: 'Staff',
      email: null,
      roles: ['ROLE_STAFF'],
      organizationId: null,
      organizationName: null,
    },
  },
}))

vi.mock('@/api/dashboard', () => ({
  dashboardApi: {
    get: dashboardGetMock,
  },
}))

vi.mock('@/api/organizationInvites', () => ({
  organizationInviteApi: {
    accept: inviteAcceptMock,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('DashboardView', () => {
  beforeEach(() => {
    dashboardGetMock.mockReset()
    inviteAcceptMock.mockReset()
    authStoreMock.user = {
      id: 1,
      username: 'staff',
      firstName: 'Kitchen',
      lastName: 'Staff',
      email: null,
      roles: ['ROLE_STAFF'],
      organizationId: null,
      organizationName: null,
    }
  })

  it('shows the no-organization onboarding state', async () => {
    dashboardGetMock.mockResolvedValue({
      organizationAssigned: false,
      organizationName: null,
      message: 'You have not joined an organization yet.',
      totalChecklistTemplates: 0,
      checklistsCompletedToday: 0,
      temperatureAlertsToday: 0,
      openDeviations: 0,
      inProgressDeviations: 0,
      unreadNotifications: 0,
    })

    render(DashboardView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(await screen.findByText('No organization assigned yet')).toBeTruthy()
    expect(screen.getByText('You have not joined an organization yet.')).toBeTruthy()
  })

  it('accepts an invite and reloads dashboard data', async () => {
    dashboardGetMock
      .mockResolvedValueOnce({
        organizationAssigned: false,
        organizationName: null,
        message: 'You have not joined an organization yet.',
        totalChecklistTemplates: 0,
        checklistsCompletedToday: 0,
        temperatureAlertsToday: 0,
        openDeviations: 0,
        inProgressDeviations: 0,
        unreadNotifications: 0,
      })
      .mockResolvedValueOnce({
        organizationAssigned: true,
        organizationName: 'Everest Sushi & Fusion',
        message: null,
        totalChecklistTemplates: 2,
        checklistsCompletedToday: 1,
        temperatureAlertsToday: 0,
        openDeviations: 0,
        inProgressDeviations: 0,
        unreadNotifications: 0,
      })

    inviteAcceptMock.mockResolvedValue({
      id: 1,
      username: 'staff',
      firstName: 'Kitchen',
      lastName: 'Staff',
      email: null,
      roles: ['ROLE_STAFF'],
      organizationId: 4,
      organizationName: 'Everest Sushi & Fusion',
    })

    render(DashboardView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    await fireEvent.update(await screen.findByLabelText('Invitation token'), 'invite-token')
    await fireEvent.click(screen.getByRole('button', { name: 'Join organization' }))

    await waitFor(() => {
      expect(inviteAcceptMock).toHaveBeenCalledWith({ token: 'invite-token' })
      expect(dashboardGetMock).toHaveBeenCalledTimes(2)
      expect(authStoreMock.user.organizationId).toBe(4)
    })
  })
})
