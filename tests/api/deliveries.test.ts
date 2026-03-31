/**
 * Contract tests for delivery and traceability API helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('deliveryApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('uses the expected delivery and traceability endpoints', async () => {
    const { deliveryApi } = await import('../../src/api/operations/deliveries')
    const payload = {
      supplierId: 2,
      deliveryDate: '2026-03-30T09:00:00',
      items: [{ productName: 'Salmon', batchLot: 'B-100' }],
    }

    deliveryApi.list()
    deliveryApi.get(12)
    deliveryApi.create(payload)
    deliveryApi.searchTraceability({ productName: 'salmon', batchLot: 'B-100' })

    expect(requestMock).toHaveBeenNthCalledWith(1, '/deliveries')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/deliveries/12')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/deliveries',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/deliveries/search/traceability?productName=salmon&batchLot=B-100',
    )
  })

  it('omits empty traceability search params', async () => {
    const { deliveryApi } = await import('../../src/api/operations/deliveries')

    deliveryApi.searchTraceability({})

    expect(requestMock).toHaveBeenCalledWith('/deliveries/search/traceability')
  })
})
