/**
 * View tests for delivery details.
 */
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DeliveryDetailView from '../../src/views/deliveries/DeliveryDetailView.vue'

const routeMock = { params: { id: '21' } }

const { getDeliveryMock } = vi.hoisted(() => ({
  getDeliveryMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
  }
})

vi.mock('@/api/operations/deliveries.ts', () => ({
  deliveryApi: {
    get: getDeliveryMock,
  },
}))

describe('DeliveryDetailView', () => {
  beforeEach(() => {
    getDeliveryMock.mockReset()
  })

  it('renders delivery metadata and item rows', async () => {
    getDeliveryMock.mockResolvedValue({
      id: 21,
      supplierId: 7,
      supplierName: 'North Sea Seafood',
      deliveryDate: '2026-03-25T10:00:00',
      documentNumber: 'DEL-21',
      receivedByUsername: 'manager',
      notes: 'Keep chilled',
      items: [
        { id: 1, productName: 'Salmon', quantity: 12, unit: 'kg', batchLot: 'B-77', expiryDate: '2026-04-02' },
      ],
      createdAt: '2026-03-25T10:30:00',
    })

    render(DeliveryDetailView, {
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

    expect(await screen.findByText('North Sea Seafood')).toBeTruthy()
    expect(screen.getByText('DEL-21')).toBeTruthy()
    expect(screen.getByText('Keep chilled')).toBeTruthy()
    expect(screen.getByText('Salmon')).toBeTruthy()
    expect(screen.getByText('kg')).toBeTruthy()
    expect(screen.getByText('B-77')).toBeTruthy()
  })
})
