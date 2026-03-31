/**
 * View tests for checklist completion.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { i18n } from '@/i18n'
import ChecklistCompleteView from '../../src/views/checklists/ChecklistCompleteView.vue'

const routeMock = { params: { id: '3' } }
const pushMock = vi.fn()

const { getTemplateMock, completeChecklistMock } = vi.hoisted(() => ({
  getTemplateMock: vi.fn(),
  completeChecklistMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual<typeof import('vue-router')>('vue-router')
  return {
    ...actual,
    useRoute: () => routeMock,
    useRouter: () => ({ push: pushMock }),
  }
})

vi.mock('@/api/operations/checklists.ts', () => ({
  checklistApi: {
    getTemplate: getTemplateMock,
    completeChecklist: completeChecklistMock,
  },
}))

describe('ChecklistCompleteView', () => {
  beforeEach(() => {
    getTemplateMock.mockReset()
    completeChecklistMock.mockReset()
    pushMock.mockReset()
  })

  it('loads a checklist template and submits completion answers', async () => {
    getTemplateMock.mockResolvedValue({
      id: 3,
      title: 'Opening Checklist',
      description: 'Morning checks',
      items: [
        { id: 11, description: 'Check fridge temperature', requiresComment: false },
        { id: 12, description: 'Inspect hand wash station', requiresComment: true },
      ],
    })
    completeChecklistMock.mockResolvedValue({})

    render(ChecklistCompleteView, {
      global: {
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a><slot /></a>' },
        },
      },
    })

    expect(await screen.findByText('Opening Checklist')).toBeTruthy()

    const checkboxes = screen.getAllByRole('checkbox')
    await fireEvent.click(checkboxes[0])
    await fireEvent.update(screen.getByPlaceholderText('Comment (required)'), 'Station stocked')
    await fireEvent.update(document.querySelector('textarea.form-textarea') as HTMLTextAreaElement, 'All set')
    await fireEvent.click(screen.getByRole('button', { name: 'Submit Checklist' }))

    await waitFor(() => {
      expect(completeChecklistMock).toHaveBeenCalledWith({
        templateId: 3,
        answers: [
          { itemId: 11, checked: true, comment: undefined },
          { itemId: 12, checked: false, comment: 'Station stocked' },
        ],
        comment: 'All set',
      })
      expect(pushMock).toHaveBeenCalledWith('/app/checklists/history')
    })
  })
})
