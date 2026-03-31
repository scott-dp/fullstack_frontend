/**
 * View tests for the deliveries list.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DeliveriesView from '../../src/views/deliveries/DeliveriesView.vue'

const pushMock = vi.fn()

const { listDeliveriesMock } = vi.hoisted(() => ({
  listDeliveriesMock: vi.fn(),
}))

vi.mock('@/api/operations/deliveries.ts', () => ({
  deliveryApi: {
    list: listDeliveriesMock,
  },
}))

describe('DeliveriesView', () => {
  beforeEach(() => {
    listDeliveriesMock.mockReset()
    pushMock.mockReset()
  })

  it('renders deliveries and navigates from keyboard interaction', async () => {
    listDeliveriesMock.mockResolvedValue([
      {
        id: 21,
        supplierId: 7,
        supplierName: 'North Sea Seafood',
        deliveryDate: '2026-03-25T10:00:00',
        documentNumber: 'DEL-21',
        receivedByUsername: 'manager',
        notes: null,
        attachmentId: null,
        items: [{ id: 1, productName: 'Salmon' }],
        createdAt: '2026-03-25T10:30:00',
      },
    ])

    render(DeliveriesView, {
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

    expect(await screen.findByText('North Sea Seafood')).toBeTruthy()
    expect(screen.getByText('DEL-21')).toBeTruthy()
    expect(screen.getByText('1')).toBeTruthy()

    await fireEvent.keyDown(screen.getByText('North Sea Seafood').closest('tr')!, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/app/deliveries/21')
  })
})
