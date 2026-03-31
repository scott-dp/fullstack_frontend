/**
 * View tests for the suppliers list.
 */
import { fireEvent, render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import SuppliersView from '../../src/views/suppliers/SuppliersView.vue'

const pushMock = vi.fn()

const { listSuppliersMock, authStoreMock } = vi.hoisted(() => ({
  listSuppliersMock: vi.fn(),
  authStoreMock: {
    hasManageAccess: true,
  },
}))

vi.mock('@/api/operations/suppliers.ts', () => ({
  supplierApi: {
    list: listSuppliersMock,
  },
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('SuppliersView', () => {
  beforeEach(() => {
    listSuppliersMock.mockReset()
    pushMock.mockReset()
    authStoreMock.hasManageAccess = true
  })

  it('filters to inactive suppliers and supports keyboard navigation', async () => {
    listSuppliersMock.mockResolvedValue([
      {
        id: 1,
        name: 'North Sea Seafood',
        organizationNumber: '123',
        contactName: 'Nina North',
        email: 'nina@example.com',
        phone: '99999999',
        address: 'Harbor Street 1',
        notes: null,
        active: true,
        createdAt: '2026-03-25T10:00:00',
        updatedAt: '2026-03-25T10:00:00',
      },
      {
        id: 2,
        name: 'Old Produce',
        organizationNumber: '456',
        contactName: 'Oscar Old',
        email: 'oscar@example.com',
        phone: '88888888',
        address: 'Market Road 2',
        notes: null,
        active: false,
        createdAt: '2026-03-24T10:00:00',
        updatedAt: '2026-03-24T10:00:00',
      },
    ])

    render(SuppliersView, {
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
    await fireEvent.update(screen.getByRole('combobox'), 'false')

    expect(screen.queryByText('North Sea Seafood')).toBeNull()
    expect(screen.getByText('Old Produce')).toBeTruthy()

    await fireEvent.keyDown(screen.getByText('Old Produce').closest('tr')!, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/app/suppliers/2')
  })
})
