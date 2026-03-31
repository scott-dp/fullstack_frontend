/**
 * Contract tests for routine API helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('routineApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('builds routine CRUD, archive, and history requests correctly', async () => {
    const { routineApi } = await import('../../src/api/operations/routines')

    routineApi.list('FOOD', 'OPENING', true)
    routineApi.get(4)
    routineApi.create({
      name: 'Opening checks',
      moduleType: 'FOOD',
      category: 'OPENING',
      responsibleRole: 'MANAGER',
      frequencyType: 'DAILY',
    })
    routineApi.update(4, { name: 'Updated checks' })
    routineApi.archive(4)
    routineApi.unarchive(4)
    routineApi.delete(4)
    routineApi.review(4, 'Reviewed')
    routineApi.history(4)

    expect(requestMock).toHaveBeenNthCalledWith(1, '/routines?moduleType=FOOD&category=OPENING&active=true')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/routines/4')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/routines',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/routines/4',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ name: 'Updated checks' }) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(5, '/routines/4/archive', expect.objectContaining({ method: 'POST' }))
    expect(requestMock).toHaveBeenNthCalledWith(6, '/routines/4/unarchive', expect.objectContaining({ method: 'POST' }))
    expect(requestMock).toHaveBeenNthCalledWith(7, '/routines/4', expect.objectContaining({ method: 'DELETE' }))
    expect(requestMock).toHaveBeenNthCalledWith(
      8,
      '/routines/4/review',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ notes: 'Reviewed' }) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(9, '/routines/4/history')
  })

  it('omits empty list filters and sends blank review notes when omitted', async () => {
    const { routineApi } = await import('../../src/api/operations/routines')

    routineApi.list()
    routineApi.review(8)

    expect(requestMock).toHaveBeenNthCalledWith(1, '/routines')
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/routines/8/review',
      expect.objectContaining({ body: JSON.stringify({ notes: '' }) }),
    )
  })
})
