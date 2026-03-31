/**
 * API tests for alcohol incident endpoints.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { alcoholIncidentApi } from '../../src/api/operations/alcoholIncidents.ts'

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}))

vi.mock('../../src/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('alcoholIncidentApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('uses the expected alcohol incident endpoints', async () => {
    requestMock.mockResolvedValue({})

    await alcoholIncidentApi.list('OPEN', 'AGE_DOUBT_REFUSAL')
    await alcoholIncidentApi.get(4)
    await alcoholIncidentApi.create({
      occurredAt: '2026-03-31T10:00:00',
      incidentType: 'AGE_DOUBT_REFUSAL',
      severity: 'HIGH',
      description: 'Guest could not show valid ID',
      followUpRequired: true,
      assignedToId: 3,
    })
    await alcoholIncidentApi.update(4, {
      status: 'UNDER_REVIEW',
      assignedToId: 5,
    })
    await alcoholIncidentApi.close(4, 'Handled by manager')
    await alcoholIncidentApi.report()

    expect(requestMock).toHaveBeenNthCalledWith(1, '/alcohol-incidents?status=OPEN&type=AGE_DOUBT_REFUSAL')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/alcohol-incidents/4')
    expect(requestMock).toHaveBeenNthCalledWith(3, '/alcohol-incidents', {
      method: 'POST',
      body: JSON.stringify({
        occurredAt: '2026-03-31T10:00:00',
        incidentType: 'AGE_DOUBT_REFUSAL',
        severity: 'HIGH',
        description: 'Guest could not show valid ID',
        followUpRequired: true,
        assignedToId: 3,
      }),
    })
    expect(requestMock).toHaveBeenNthCalledWith(4, '/alcohol-incidents/4', {
      method: 'PUT',
      body: JSON.stringify({
        status: 'UNDER_REVIEW',
        assignedToId: 5,
      }),
    })
    expect(requestMock).toHaveBeenNthCalledWith(5, '/alcohol-incidents/4/close', {
      method: 'POST',
      body: JSON.stringify({ notes: 'Handled by manager' }),
    })
    expect(requestMock).toHaveBeenNthCalledWith(6, '/alcohol-incidents/report')
  })
})
