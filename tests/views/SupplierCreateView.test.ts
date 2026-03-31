/**
 * View tests for supplier creation.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import SupplierCreateView from '../../src/views/suppliers/SupplierCreateView.vue'

const pushMock = vi.fn()

const { createSupplierMock } = vi.hoisted(() => ({
  createSupplierMock: vi.fn(),
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
    create: createSupplierMock,
  },
}))

describe('SupplierCreateView', () => {
  beforeEach(() => {
    createSupplierMock.mockReset()
    pushMock.mockReset()
  })

  it('creates a supplier and redirects to the suppliers page', async () => {
    createSupplierMock.mockResolvedValue({ id: 5 })

    render(SupplierCreateView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    await fireEvent.update(screen.getByPlaceholderText('Supplier company name'), 'Fresh Produce Co')
    await fireEvent.update(screen.getByPlaceholderText('contact@supplier.com'), 'hello@freshproduce.no')
    await fireEvent.click(screen.getByRole('button', { name: 'Create Supplier' }))

    await waitFor(() => {
      expect(createSupplierMock).toHaveBeenCalledWith({
        name: 'Fresh Produce Co',
        organizationNumber: undefined,
        contactName: undefined,
        email: 'hello@freshproduce.no',
        phone: undefined,
        address: undefined,
        notes: undefined,
      })
      expect(pushMock).toHaveBeenCalledWith('/app/suppliers')
    })
  })
})
