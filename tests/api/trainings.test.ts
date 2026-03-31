/**
 * Contract tests for training API helpers.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/core/client.ts', () => ({
  request: requestMock,
}))

describe('trainingApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('builds template, assignment, completion, and report requests correctly', async () => {
    const { trainingApi } = await import('../../src/api/operations/trainings')

    trainingApi.listTemplates('ALCOHOL')
    trainingApi.getTemplate(3)
    trainingApi.createTemplate({
      title: 'Responsible serving',
      moduleType: 'ALCOHOL',
      category: 'SERVICE',
      requiredForRole: 'ROLE_STAFF',
    })
    trainingApi.updateTemplate(3, { title: 'Updated title' })
    trainingApi.deleteTemplate(3)
    trainingApi.assign(3, [1, 2], '2026-04-05')
    trainingApi.myAssignments()
    trainingApi.complete(9, true, 'Done')
    trainingApi.report()

    expect(requestMock).toHaveBeenNthCalledWith(1, '/trainings/templates?moduleType=ALCOHOL')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/trainings/templates/3')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/trainings/templates',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/trainings/templates/3',
      expect.objectContaining({ method: 'PUT', body: JSON.stringify({ title: 'Updated title' }) }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(5, '/trainings/templates/3', expect.objectContaining({ method: 'DELETE' }))
    expect(requestMock).toHaveBeenNthCalledWith(
      6,
      '/trainings/templates/3/assign',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ assigneeUserIds: [1, 2], dueAt: '2026-04-05T00:00:00' }),
      }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(7, '/trainings/assignments/my')
    expect(requestMock).toHaveBeenNthCalledWith(
      8,
      '/trainings/assignments/9/complete',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ acknowledgementChecked: true, comments: 'Done' }),
      }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(9, '/trainings/report')
  })

  it('keeps datetime due dates untouched and omits the module filter when missing', async () => {
    const { trainingApi } = await import('../../src/api/operations/trainings')

    trainingApi.listTemplates()
    trainingApi.assign(4, [5], '2026-04-05T08:30:00')

    expect(requestMock).toHaveBeenNthCalledWith(1, '/trainings/templates')
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/trainings/templates/4/assign',
      expect.objectContaining({
        body: JSON.stringify({ assigneeUserIds: [5], dueAt: '2026-04-05T08:30:00' }),
      }),
    )
  })
})
