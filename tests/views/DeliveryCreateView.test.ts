/**
 * View tests for delivery creation.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import DeliveryCreateView from '../../src/views/deliveries/DeliveryCreateView.vue'

const pushMock = vi.fn()

const { listSuppliersMock, createDeliveryMock } = vi.hoisted(() => ({
  listSuppliersMock: vi.fn(),
  createDeliveryMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/suppliers.ts', () => ({
  supplierApi: {
    list: listSuppliersMock,
  },
}))

vi.mock('@/api/operations/deliveries.ts', () => ({
  deliveryApi: {
    create: createDeliveryMock,
  },
}))

describe('DeliveryCreateView', () => {
  beforeEach(() => {
    listSuppliersMock.mockReset()
    createDeliveryMock.mockReset()
    pushMock.mockReset()
  })

  it('adds and removes delivery item rows', async () => {
    listSuppliersMock.mockResolvedValue([
      { id: 3, name: 'North Sea Seafood', active: true },
    ])

    render(DeliveryCreateView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    expect(screen.getAllByPlaceholderText('Product name')).toHaveLength(1)
    await fireEvent.click(screen.getByRole('button', { name: '+ Add Item' }))
    expect(screen.getAllByPlaceholderText('Product name')).toHaveLength(2)

    await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[0])
    expect(screen.getAllByPlaceholderText('Product name')).toHaveLength(1)
  })

  it('creates a delivery and redirects to the delivery list', async () => {
    listSuppliersMock.mockResolvedValue([
      { id: 3, name: 'North Sea Seafood', active: true },
    ])
    createDeliveryMock.mockResolvedValue({ id: 11 })

    const { container } = render(DeliveryCreateView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await screen.findByText('North Sea Seafood')
    const selects = container.querySelectorAll('select')
    await fireEvent.update(selects[0], '3')
    await fireEvent.update(container.querySelector('input[type="date"]')!, '2026-03-31')
    await fireEvent.update(screen.getByPlaceholderText('Product name'), 'Salmon')
    await fireEvent.update(screen.getByPlaceholderText('Qty'), '10')
    await fireEvent.update(screen.getByPlaceholderText('kg, pcs, L'), 'kg')
    await fireEvent.update(screen.getByPlaceholderText('Batch or lot number'), 'B-22')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Delivery' }))

    await waitFor(() => {
      expect(createDeliveryMock).toHaveBeenCalledWith({
        supplierId: 3,
        deliveryDate: '2026-03-31',
        documentNumber: undefined,
        notes: undefined,
        items: [
          {
            productName: 'Salmon',
            quantity: 10,
            unit: 'kg',
            batchLot: 'B-22',
            expiryDate: undefined,
            internalIngredientRef: undefined,
          },
        ],
      })
      expect(pushMock).toHaveBeenCalledWith('/app/deliveries')
    })
  })
})
