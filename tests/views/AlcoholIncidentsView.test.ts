/**
 * View tests for the alcohol incidents list.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import AlcoholIncidentsView from '../../src/views/alcohol/AlcoholIncidentsView.vue'

const pushMock = vi.fn()

const { listIncidentsMock } = vi.hoisted(() => ({
  listIncidentsMock: vi.fn(),
}))

vi.mock('@/api/operations/alcoholIncidents.ts', () => ({
  alcoholIncidentApi: {
    list: listIncidentsMock,
  },
}))

describe('AlcoholIncidentsView', () => {
  beforeEach(() => {
    listIncidentsMock.mockReset()
    pushMock.mockReset()
  })

  it('filters incidents by type and renders follow-up labels', async () => {
    listIncidentsMock.mockResolvedValue([
      {
        id: 3,
        incidentType: 'AGE_DOUBT_REFUSAL',
        severity: 'HIGH',
        status: 'OPEN',
        locationArea: 'Main bar',
        reportedByUsername: 'staff1',
        occurredAt: '2026-03-26T20:00:00',
        followUpRequired: true,
      },
      {
        id: 4,
        incidentType: 'GUEST_REMOVED',
        severity: 'LOW',
        status: 'CLOSED',
        locationArea: null,
        reportedByUsername: 'manager',
        occurredAt: '2026-03-25T20:00:00',
        followUpRequired: false,
      },
    ])

    render(AlcoholIncidentsView, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: pushMock },
        },
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(await screen.findByText('Age Doubt Refusal')).toBeTruthy()
    const selects = screen.getAllByRole('combobox')
    await fireEvent.update(selects[1], 'GUEST_REMOVED')

    expect(screen.queryByText('Main bar')).toBeNull()
    expect(screen.getByText('manager')).toBeTruthy()
    expect(screen.getByText('No')).toBeTruthy()

    await fireEvent.keyDown(screen.getByText('manager').closest('tr')!, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/app/alcohol-incidents/4')
  })
})
