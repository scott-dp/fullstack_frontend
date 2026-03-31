/**
 * Contract tests for bevilling API helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('bevillingApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('uses the expected bevilling, condition, and serving-hours endpoints', async () => {
    const { bevillingApi } = await import('../../src/api/operations/bevilling')

    bevillingApi.list()
    bevillingApi.getCurrent()
    bevillingApi.get(3)
    bevillingApi.create({
      municipality: 'Oslo',
      bevillingType: 'SKJENKING',
      validFrom: '2026-01-01',
    })
    bevillingApi.update(3, { status: 'SUSPENDED' })
    bevillingApi.addCondition(3, { conditionType: 'GENERAL', title: 'Security plan' })
    bevillingApi.updateCondition(8, { active: false })
    bevillingApi.setServingHours(3, [{ weekday: 'FRI', startTime: '12:00', endTime: '02:00' }])
    bevillingApi.getServingHours(3)

    expect(requestMock).toHaveBeenNthCalledWith(1, '/bevillinger')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/bevillinger/current')
    expect(requestMock).toHaveBeenNthCalledWith(3, '/bevillinger/3')
    expect(requestMock).toHaveBeenNthCalledWith(4, '/bevillinger', expect.objectContaining({ method: 'POST' }))
    expect(requestMock).toHaveBeenNthCalledWith(5, '/bevillinger/3', expect.objectContaining({ method: 'PUT' }))
    expect(requestMock).toHaveBeenNthCalledWith(6, '/bevillinger/3/conditions', expect.objectContaining({ method: 'POST' }))
    expect(requestMock).toHaveBeenNthCalledWith(7, '/bevillinger/conditions/8', expect.objectContaining({ method: 'PUT' }))
    expect(requestMock).toHaveBeenNthCalledWith(
      8,
      '/bevillinger/3/serving-hours',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify([{ weekday: 'FRI', startTime: '12:00', endTime: '02:00' }]),
      }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(9, '/bevillinger/3/serving-hours')
  })
})
