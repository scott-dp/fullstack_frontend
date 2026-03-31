/**
 * View tests for the deviations list.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DeviationsView from '../../src/views/deviations/DeviationsView.vue'

const pushMock = vi.fn()

const { listDeviationsMock } = vi.hoisted(() => ({
  listDeviationsMock: vi.fn(),
}))

vi.mock('@/api/operations/deviations.ts', () => ({
  deviationApi: {
    list: listDeviationsMock,
  },
}))

describe('DeviationsView', () => {
  beforeEach(() => {
    listDeviationsMock.mockReset()
    pushMock.mockReset()
  })

  it('filters deviations by status and supports keyboard navigation', async () => {
    listDeviationsMock.mockResolvedValue([
      {
        id: 1,
        title: 'Cold storage issue',
        category: 'FOOD',
        severity: 'CRITICAL',
        status: 'OPEN',
        reportedByUsername: 'manager',
        assignedToUsername: 'staff1',
        createdAt: '2026-03-25T10:00:00',
      },
      {
        id: 2,
        title: 'Late closing check',
        category: 'ALCOHOL',
        severity: 'LOW',
        status: 'RESOLVED',
        reportedByUsername: 'admin',
        assignedToUsername: null,
        createdAt: '2026-03-24T10:00:00',
      },
    ])

    render(DeviationsView, {
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

    expect(await screen.findByText('Cold storage issue')).toBeTruthy()
    const selects = screen.getAllByRole('combobox')
    await fireEvent.update(selects[0], 'RESOLVED')

    expect(screen.queryByText('Cold storage issue')).toBeNull()
    expect(screen.getByText('Late closing check')).toBeTruthy()
    expect(screen.getByText('admin')).toBeTruthy()

    await fireEvent.keyDown(screen.getByText('Late closing check').closest('tr')!, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/app/deviations/2')
  })
})
