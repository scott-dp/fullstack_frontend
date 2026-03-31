/**
 * View tests for traceability search.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import TraceabilitySearchView from '../../src/views/suppliers/TraceabilitySearchView.vue'

const pushMock = vi.fn()

const { searchTraceabilityMock } = vi.hoisted(() => ({
  searchTraceabilityMock: vi.fn(),
}))

vi.mock('@/api/operations/deliveries.ts', () => ({
  deliveryApi: {
    searchTraceability: searchTraceabilityMock,
  },
}))

describe('TraceabilitySearchView', () => {
  beforeEach(() => {
    searchTraceabilityMock.mockReset()
    pushMock.mockReset()
  })

  it('shows validation when both search fields are empty', async () => {
    render(TraceabilitySearchView, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: pushMock },
        },
      },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(screen.getByText('Please enter a product name or batch/lot number to search')).toBeTruthy()
  })

  it('renders search results and supports keyboard navigation to the delivery page', async () => {
    searchTraceabilityMock.mockResolvedValue([
      {
        deliveryItemId: 1,
        deliveryRecordId: 14,
        productName: 'Salmon',
        batchLot: 'LOT-55',
        supplierName: 'North Sea Seafood',
        deliveryDate: '2026-03-25T10:00:00',
        expiryDate: '2026-04-01T00:00:00',
      },
    ])

    render(TraceabilitySearchView, {
      global: {
        plugins: [i18n],
        mocks: {
          $router: { push: pushMock },
        },
      },
    })

    await fireEvent.update(screen.getByPlaceholderText('Search by product name'), 'salmon')
    await fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('North Sea Seafood')).toBeTruthy()
    await fireEvent.keyDown(screen.getByText('Salmon').closest('tr')!, { key: 'Enter' })

    await waitFor(() => {
      expect(searchTraceabilityMock).toHaveBeenCalledWith({
        productName: 'salmon',
        batchLot: undefined,
      })
      expect(pushMock).toHaveBeenCalledWith('/app/deliveries/14')
    })
  })
})
