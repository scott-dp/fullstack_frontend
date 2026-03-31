/**
 * View tests for the bevilling overview.
 */
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import BevillingView from '../../src/views/bevilling/BevillingView.vue'

const { getCurrentMock, authStoreMock } = vi.hoisted(() => ({
  getCurrentMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('@/api/operations/bevilling.ts', () => ({
  bevillingApi: {
    getCurrent: getCurrentMock,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('BevillingView', () => {
  beforeEach(() => {
    getCurrentMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('renders the current license with expiry warning and serving hours', async () => {
    getCurrentMock.mockResolvedValue({
      id: 2,
      municipality: 'Oslo',
      bevillingType: 'SKJENKING',
      validFrom: '2026-01-01',
      validTo: '2026-05-01',
      licenseNumber: 'LIC-22',
      status: 'ACTIVE',
      alcoholGroupsAllowed: ['GROUP_1', 'GROUP_2'],
      servingAreaDescription: 'Main floor',
      indoorAllowed: true,
      outdoorAllowed: false,
      styrerName: 'Anna Admin',
      stedfortrederName: 'Bjørn Backup',
      notes: 'Renewal in progress',
      attachmentId: null,
      conditions: [
        { id: 1, conditionType: 'SECURITY_PLAN', title: 'Security plan', description: 'Keep updated', active: true },
      ],
      servingHours: [
        { id: 1, weekday: 'FRI', startTime: '12:00', endTime: '02:00', consumptionDeadlineMinutesAfterEnd: 30 },
      ],
      createdAt: '2026-01-01T10:00:00',
      updatedAt: '2026-03-01T10:00:00',
    })

    render(BevillingView, {
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

    expect(await screen.findByText('Oslo')).toBeTruthy()
    expect(screen.getByText('Security plan')).toBeTruthy()
    expect(screen.getByText('Friday')).toBeTruthy()
  })
})
