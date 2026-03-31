/**
 * View tests for alcohol incident creation.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import AlcoholIncidentCreateView from '../../src/views/alcohol/AlcoholIncidentCreateView.vue'

const pushMock = vi.fn()

const { createIncidentMock, listUsersMock, authStoreMock } = vi.hoisted(() => ({
  createIncidentMock: vi.fn(),
  listUsersMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/alcoholIncidents.ts', () => ({
  alcoholIncidentApi: {
    create: createIncidentMock,
  },
}))

vi.mock('@/api/auth/users.ts', () => ({
  userApi: {
    list: listUsersMock,
  },
}))

vi.mock('@/stores/auth.ts', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('AlcoholIncidentCreateView', () => {
  beforeEach(() => {
    createIncidentMock.mockReset()
    listUsersMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('creates an alcohol incident with assignee selection', async () => {
    listUsersMock.mockResolvedValue([
      { id: 4, username: 'manager1', firstName: 'Mia', lastName: 'West' },
    ])
    createIncidentMock.mockResolvedValue({ id: 8 })

    const { container } = render(AlcoholIncidentCreateView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await screen.findByText('Mia West')
    await fireEvent.update(screen.getByPlaceholderText('e.g. Evening Shift'), 'Evening')
    await fireEvent.update(screen.getByPlaceholderText('e.g. Bar Area'), 'Bar')
    await fireEvent.update(
      screen.getByPlaceholderText('Describe what happened, where, and the circumstances'),
      'Guest attempted to order without valid ID.',
    )
    const selects = container.querySelectorAll('select')
    await fireEvent.update(selects[2], '4')
    await fireEvent.click(screen.getByRole('button', { name: 'Report Incident' }))

    await waitFor(() => {
      expect(createIncidentMock).toHaveBeenCalledWith(expect.objectContaining({
        shiftLabel: 'Evening',
        locationArea: 'Bar',
        incidentType: 'AGE_DOUBT_REFUSAL',
        severity: 'MEDIUM',
        description: 'Guest attempted to order without valid ID.',
        followUpRequired: false,
        assignedToId: 4,
      }))
      expect(pushMock).toHaveBeenCalledWith('/app/alcohol-incidents')
    })
  })
})
