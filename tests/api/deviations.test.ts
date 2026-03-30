import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('deviationApi', () => {
  it('builds list, CRUD, and comment requests correctly', async () => {
    const { deviationApi } = await import('../../src/api/operations/deviations')

    deviationApi.list('OPEN', 'FOOD')
    deviationApi.get(1)
    deviationApi.create({
      title: 'Broken cooler',
      description: 'Too warm',
      category: 'FOOD',
      severity: 'HIGH',
    })
    deviationApi.update(1, { status: 'RESOLVED' })
    deviationApi.addComment(1, 'Technician booked')

    expect(requestMock).toHaveBeenNthCalledWith(1, '/deviations?status=OPEN&category=FOOD')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/deviations/1')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/deviations',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/deviations/1',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ status: 'RESOLVED' }) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      5,
      '/deviations/1/comments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'Technician booked' }),
      }),
    )
  })

  it('omits empty list filters from the query string', async () => {
    const { deviationApi } = await import('../../src/api/operations/deviations')

    deviationApi.list()
    expect(requestMock).toHaveBeenCalledWith('/deviations')
  })
})
