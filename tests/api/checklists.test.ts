import { describe, expect, it, vi } from 'vitest'

const requestMock = vi.fn()

vi.mock('@/api/client', () => ({
  request: requestMock,
}))

describe('checklistApi', () => {
  it('builds checklist template and completion requests correctly', async () => {
    const { checklistApi } = await import('../../src/api/operations/checklists')
    const templatePayload = {
      title: 'Daily kitchen',
      frequency: 'DAILY',
      category: 'FOOD',
      items: [{ description: 'Clean station', sortOrder: 0, requiresComment: false }],
    }
    const completionPayload = {
      templateId: 1,
      answers: [{ itemId: 1, checked: true }],
      comment: 'All good',
    }

    checklistApi.listTemplates('FOOD')
    checklistApi.getTemplate(1)
    checklistApi.createTemplate(templatePayload)
    checklistApi.updateTemplate(1, templatePayload)
    checklistApi.deleteTemplate(1)
    checklistApi.listCompletions()
    checklistApi.getCompletion(8)
    checklistApi.completeChecklist(completionPayload)

    expect(requestMock).toHaveBeenNthCalledWith(1, '/checklists/templates?category=FOOD')
    expect(requestMock).toHaveBeenNthCalledWith(2, '/checklists/templates/1')
    expect(requestMock).toHaveBeenNthCalledWith(
      3,
      '/checklists/templates',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      4,
      '/checklists/templates/1',
      expect.objectContaining({ method: 'PUT' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      5,
      '/checklists/templates/1',
      expect.objectContaining({ method: 'DELETE' }),
    )
    expect(requestMock).toHaveBeenNthCalledWith(6, '/checklists/completions')
    expect(requestMock).toHaveBeenNthCalledWith(7, '/checklists/completions/8')
    expect(requestMock).toHaveBeenNthCalledWith(
      8,
      '/checklists/completions',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(completionPayload) }),
    )
  })

  it('omits the template category query when not provided', async () => {
    const { checklistApi } = await import('../../src/api/operations/checklists')

    checklistApi.listTemplates()
    expect(requestMock).toHaveBeenCalledWith('/checklists/templates')
  })
})
