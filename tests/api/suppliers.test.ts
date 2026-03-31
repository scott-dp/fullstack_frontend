/**
 * Contract tests for supplier API helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('supplierApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('uses the expected supplier endpoints', async () => {
    const { supplierApi } = await import('../../src/api/operations/suppliers')

    supplierApi.list()
    supplierApi.get(5)
    supplierApi.create({ name: 'North Sea Seafood', contactName: 'Nina North' })
    supplierApi.update(5, { active: false, notes: 'Archived for review' })

    expect(requestMock).toHaveBeenNthCalledWith(1, '/suppliers')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/suppliers/5')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/suppliers',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'North Sea Seafood', contactName: 'Nina North' }),
      }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/suppliers/5',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ active: false, notes: 'Archived for review' }),
      }),
    )
  })
})
